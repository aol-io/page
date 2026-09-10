/* ==========================================================
   AOL LOGISTICS — tracking.js
   Powers tracking.html: shipment fetch, waybill/ETA/route/map/
   timeline rendering, live polling, and the Windows-11-style
   pointer "reveal" glow on every .reveal element.
   ========================================================== */

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  "https://rtgvylkbndrmwntaqkfx.supabase.co",
  "sb_publishable_SFI-gjeDtTrOGpLp1_BTtg_hXy6wPSB"
);

/* ============================================================
   0. REVEAL EFFECT — delegated, works on dynamically added nodes
   ============================================================ */
document.addEventListener("pointermove", (e) => {
  const el = e.target.closest(".reveal");
  if (!el) return;
  const r = el.getBoundingClientRect();
  el.style.setProperty("--mx", `${e.clientX - r.left}px`);
  el.style.setProperty("--my", `${e.clientY - r.top}px`);
});
// Touch fallback: light up on tap so mobile still gets a hint of the glow.
document.addEventListener("touchstart", (e) => {
  const el = e.target.closest(".reveal");
  if (!el) return;
  const t = e.touches[0];
  const r = el.getBoundingClientRect();
  el.style.setProperty("--mx", `${t.clientX - r.left}px`);
  el.style.setProperty("--my", `${t.clientY - r.top}px`);
  el.classList.add("reveal-active");
  setTimeout(() => el.classList.remove("reveal-active"), 600);
}, { passive: true });

/* ============================================================
   1. LANGUAGE (tracking-page-only strings; header/footer/chat
      keys are already handled by script.js)
   ============================================================ */
function getSiteLang() { return localStorage.getItem("site_lang") || "ko"; }

const T = {
  ko: {
    track_eyebrow: "항공 화물 운송장 / 배송 명세서",
    track_page_title: "실시간 배송 추적",
    track_page_sub: "운송장 번호를 입력하면 현재 위치와 예상 도착일을 바로 확인할 수 있습니다.",
    tracking_placeholder: "운송장 번호를 입력하세요",
    track_button_text: "추적",
    invalidCodeMessage: "유효하지 않은 운송장 코드입니다:",
    try_again_btn: "다시 시도",
    trackingNoLabel: "운송장 번호", customerLabel: "고객", serviceLabel: "서비스",
    originLabel: "출발지", destinationLabel: "도착지", weightLabel: "중량", locationLabel: "현재 위치",
    liveLabel: "실시간 갱신", refreshBtn: "새로고침", shareBtn: "공유", printBtn: "인쇄",
    etaLabel: "예상 도착", etaNoteDefault: "최신 위치 업데이트를 기준으로 계산됩니다.",
    etaUnavailable: "정보 없음", etaDaysLeft: "일 남음", etaArrivedToday: "오늘 도착 예정", etaDelivered: "배송 완료됨",
    shipmentProgress: "배송 진행 상황",
    orderPlaced: "주문 접수", preparing: "준비 중", shipped: "배송 중", delivered: "배송 완료",
    trackingUpdates: "배송 업데이트",
    notAvailable: "정보 없음", unknown: "알 수 없음",
    updatedJustNow: "방금 갱신됨", updatedAgo: "분 전 갱신",
    copySuccess: "운송장 번호를 복사했습니다", copyFail: "복사에 실패했습니다",
    shareSuccess: "링크가 복사되었습니다", noTimeline: "아직 배송 업데이트가 없습니다."
  },
  en: {
    track_eyebrow: "Air Waybill / Shipment Manifest",
    track_page_title: "Real-Time Shipment Tracking",
    track_page_sub: "Enter a tracking number to see its current location and estimated arrival.",
    tracking_placeholder: "Enter tracking number",
    track_button_text: "Track",
    invalidCodeMessage: "Invalid tracking code:",
    try_again_btn: "Try again",
    trackingNoLabel: "Tracking No.", customerLabel: "Customer", serviceLabel: "Service",
    originLabel: "Origin", destinationLabel: "Destination", weightLabel: "Weight", locationLabel: "Current Location",
    liveLabel: "Live updates", refreshBtn: "Refresh", shareBtn: "Share", printBtn: "Print",
    etaLabel: "Estimated Arrival", etaNoteDefault: "Calculated from the latest location update.",
    etaUnavailable: "Not available", etaDaysLeft: "days left", etaArrivedToday: "Arriving today", etaDelivered: "Delivered",
    shipmentProgress: "Shipment Progress",
    orderPlaced: "Order Placed", preparing: "Preparing", shipped: "Shipped", delivered: "Delivered",
    trackingUpdates: "Tracking Updates",
    notAvailable: "Not available", unknown: "Unknown",
    updatedJustNow: "Updated just now", updatedAgo: "m ago",
    copySuccess: "Tracking number copied", copyFail: "Couldn't copy",
    shareSuccess: "Link copied to clipboard", noTimeline: "No tracking updates yet."
  }
};
function t(key) { return (T[getSiteLang()] && T[getSiteLang()][key]) || key; }

function applyTrackingTranslations() {
  const lang = getSiteLang();
  document.querySelectorAll("[data-key]").forEach((el) => {
    const key = el.getAttribute("data-key");
    if (!T[lang][key]) return; // let script.js's own dictionary own the header/footer/chat keys
    if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") el.placeholder = T[lang][key];
    else el.textContent = T[lang][key];
  });
  if (fetchedShipment) renderAll();
}
document.getElementById("langToggle")?.addEventListener("click", () => {
  // script.js already flips localStorage's site_lang on this same click;
  // re-render our own strings right after.
  setTimeout(applyTrackingTranslations, 0);
});

/* ============================================================
   2. DOM refs
   ============================================================ */
const loadingState   = document.getElementById("loadingState");
const errorState      = document.getElementById("errorState");
const errorText        = document.getElementById("errorText");
const resultsWrap      = document.getElementById("resultsWrap");
const mapCard          = document.getElementById("mapCard");
const timelineEl       = document.getElementById("timeline");
const routeFill        = document.getElementById("routeFill");
const routeVessel      = document.getElementById("routeVessel");
const statusBadge      = document.getElementById("statusBadge");
const updatedText      = document.getElementById("updatedText");
const etaDateEl        = document.getElementById("etaDate");
const etaDaysEl        = document.getElementById("etaDays");
const etaRingFill      = document.getElementById("etaRingFill");
const etaPercentEl     = document.getElementById("etaPercent");
const etaNoteEl        = document.getElementById("etaNote");

const trackAgainForm = document.getElementById("trackAgainForm");
const trackingInput  = document.getElementById("trackingInput");

const params = new URLSearchParams(window.location.search);
let trackingNo = params.get("tracking_no");
if (trackingInput && trackingNo) trackingInput.value = trackingNo;

trackAgainForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const val = trackingInput.value.trim();
  if (!val) return;
  window.location.href = `tracking.html?tracking_no=${encodeURIComponent(val)}`;
});

/* ============================================================
   3. helpers
   ============================================================ */
function escapeHtml(str = "") {
  return String(str).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
function flashPill(msg) {
  const prev = updatedText.textContent;
  updatedText.textContent = msg;
  setTimeout(() => { updatedText.textContent = prev; }, 2200);
}

const statusMapping = {
  "Order Placed":       { key: "orderPlaced",  wp: "wpPending",   badge: "st-pending" },
  "Preparing Shipment": { key: "preparing",    wp: "wpTransit",   badge: "st-transit" },
  "Shipped":            { key: "shipped",      wp: "wpShipped",   badge: "st-shipped" },
  "Delivered":          { key: "delivered",    wp: "wpDelivered", badge: "st-delivered" }
};
const orderStatuses = Object.keys(statusMapping);

function normalizeProgress(raw) {
  if (!raw) return "Order Placed";
  const trimmed = String(raw).trim();
  if (orderStatuses.includes(trimmed)) return trimmed;
  const koMap = {
    "주문 접수": "Order Placed", "접수": "Order Placed",
    "준비 중": "Preparing Shipment", "준비": "Preparing Shipment",
    "배송 중": "Shipped", "배송": "Shipped",
    "배송 완료": "Delivered", "완료": "Delivered"
  };
  if (koMap[trimmed]) return koMap[trimmed];
  const lower = trimmed.toLowerCase();
  if (lower.includes("deliver") || lower.includes("완료")) return "Delivered";
  if (lower.includes("ship")) return "Shipped";
  if (lower.includes("prepar") || lower.includes("준비")) return "Preparing Shipment";
  return "Order Placed";
}

function timeAgo(dateInput) {
  if (!dateInput) return "";
  const seconds = Math.floor((Date.now() - new Date(dateInput).getTime()) / 1000);
  if (seconds < 5) return t("updatedJustNow");
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}${t("updatedAgo")}`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return getSiteLang() === "ko" ? `${hrs}시간 전 갱신` : `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return getSiteLang() === "ko" ? `${days}일 전 갱신` : `${days}d ago`;
}

function formatDate(dateInput) {
  if (!dateInput) return null;
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString(getSiteLang() === "ko" ? "ko-KR" : "en-US", { year: "numeric", month: "short", day: "numeric" });
}

/* ============================================================
   4. state
   ============================================================ */
let fetchedShipment = null;
let fetchedUpdates = [];
let mapInstance = null;
let mapMarker = null;

/* ============================================================
   5. ETA
   Looks for an explicit eta field on the shipment row first
   (eta_date / estimated_delivery / delivery_date / eta). If
   none exists, falls back to showing progress-only (no invented
   date), which is more honest than guessing a delivery day.
   ============================================================ */
function computeEta(shipment, normalizedStatus) {
  const idx = orderStatuses.indexOf(normalizedStatus);
  const percent = Math.round((idx / (orderStatuses.length - 1)) * 100);
  const circumference = 2 * Math.PI * 52; // matches r=52 in tracking.css

  etaRingFill.style.strokeDasharray = `${circumference}`;
  etaRingFill.style.strokeDashoffset = `${circumference - (percent / 100) * circumference}`;
  etaPercentEl.textContent = `${percent}%`;

  if (normalizedStatus === "Delivered") {
    etaDateEl.textContent = t("etaDelivered");
    etaDaysEl.textContent = "";
    etaNoteEl.textContent = t("etaNoteDefault");
    return;
  }

  const rawEta = shipment.eta_date || shipment.estimated_delivery || shipment.delivery_date || shipment.eta;
  const formatted = formatDate(rawEta);
  if (formatted) {
    etaDateEl.textContent = formatted;
    const days = Math.ceil((new Date(rawEta).getTime() - Date.now()) / 86400000);
    etaDaysEl.textContent = days > 0 ? `${days} ${t("etaDaysLeft")}` : t("etaArrivedToday");
  } else {
    etaDateEl.textContent = t("etaUnavailable");
    etaDaysEl.textContent = "";
  }
  etaNoteEl.textContent = t("etaNoteDefault");
}

/* ============================================================
   6. render
   ============================================================ */
function highlightRoute(normalized) {
  const idx = Math.max(0, orderStatuses.indexOf(normalized));
  const ids = ["wpPending", "wpTransit", "wpShipped", "wpDelivered"];
  ids.forEach((id, i) => {
    const el = document.getElementById(id);
    el.classList.remove("done", "current");
    if (i < idx) el.classList.add("done");
    if (i === idx) el.classList.add("current");
  });
  const percent = (idx / (orderStatuses.length - 1)) * 100;
  routeFill.style.width = `${percent}%`;
  routeVessel.style.left = `calc(${percent}% + ${20 - (percent / 100) * 40}px)`;

  const cfg = statusMapping[normalized] || statusMapping["Order Placed"];
  statusBadge.className = `status-badge ${cfg.badge}`;
  statusBadge.textContent = t(cfg.key);
}

function renderTimeline() {
  if (!fetchedUpdates.length) {
    timelineEl.innerHTML = `<p style="color:var(--ink-dimmer); font-size:0.88rem;">${t("noTimeline")}</p>`;
    return;
  }
  timelineEl.innerHTML = fetchedUpdates.map((update) => {
    const raw = update.status || update.progress || "";
    const norm = normalizeProgress(raw);
    const cfg = statusMapping[norm] || statusMapping["Order Placed"];
    const displayStatus = t(cfg.key);
    const displayLocation = update.location || t("unknown");
    const timeStr = update.created_at
      ? new Date(update.created_at).toLocaleString(getSiteLang() === "ko" ? "ko-KR" : "en-US")
      : "";
    const noteHtml = update.note ? `<p class="tl-note">${escapeHtml(update.note)}</p>` : "";
    return `
      <div class="tl-item reveal">
        <div class="tl-top">
          <span class="tl-status">${escapeHtml(displayStatus)}</span>
          <span class="tl-time">${escapeHtml(timeStr)}</span>
        </div>
        <p class="tl-location">${escapeHtml(displayLocation)}</p>
        ${noteHtml}
      </div>`;
  }).join("");
}

function renderAll() {
  if (!fetchedShipment) return;

  document.getElementById("summaryTrackingNo").textContent = fetchedShipment.tracking_no || "-";
  document.getElementById("summaryCustomer").textContent = fetchedShipment.receiver_name || fetchedShipment.customer_name || "-";
  document.getElementById("summaryService").textContent = fetchedShipment.service_type || fetchedShipment.service || "-";
  document.getElementById("summaryOrigin").textContent = fetchedShipment.origin || "-";
  document.getElementById("summaryDestination").textContent = fetchedShipment.receiver_country || fetchedShipment.destination || "-";
  document.getElementById("summaryWeight").textContent = fetchedShipment.weight_kg
    ? `${fetchedShipment.weight_kg} kg`
    : (fetchedShipment.weight || t("notAvailable"));

  const latest = fetchedUpdates.length ? fetchedUpdates[0] : null;
  const rawStatus = latest?.status || latest?.progress || fetchedShipment.status || "Order Placed";
  const normalized = normalizeProgress(rawStatus);

  document.getElementById("summaryLocation").textContent =
    latest?.location || fetchedShipment.location_text || fetchedShipment.location || t("notAvailable");

  updatedText.textContent = latest?.created_at ? timeAgo(latest.created_at) : t("updatedJustNow");

  highlightRoute(normalized);
  computeEta(fetchedShipment, normalized);
  renderTimeline();
}

/* ============================================================
   7. map
   ============================================================ */
function buildTileLayer(map) {
  const primary = L.tileLayer(
    "https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    {
      attribution: '&copy; <a href="https://www.esri.com">Esri</a>, HERE, Garmin, &copy; OpenStreetMap contributors',
      maxZoom: 16, minZoom: 2
    }
  );
  let fellBack = false;
  primary.on("tileerror", () => {
    if (fellBack) return;
    fellBack = true;
    map.removeLayer(primary);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors", subdomains: "abc", maxZoom: 19, minZoom: 2
    }).addTo(map);
  });
  return primary;
}

async function updateMapTo(lat, lng, popupText) {
  if (!lat || !lng) { mapCard.classList.add("hidden"); return; }
  mapCard.classList.remove("hidden");
  const pinIcon = L.divIcon({ className: "", html: '<div class="map-pin"></div>', iconSize: [16, 16] });

  if (!mapInstance) {
    mapInstance = L.map("map", { zoomControl: true }).setView([lat, lng], 11);
    buildTileLayer(mapInstance).addTo(mapInstance);
    mapMarker = L.marker([lat, lng], { icon: pinIcon }).addTo(mapInstance).bindPopup(popupText || "");
  } else {
    mapInstance.setView([lat, lng], mapInstance.getZoom() || 11);
    if (mapMarker) mapMarker.setLatLng([lat, lng]).setPopupContent(popupText || "");
    else mapMarker = L.marker([lat, lng], { icon: pinIcon }).addTo(mapInstance).bindPopup(popupText || "");
  }
  // Leaflet needs a nudge after being placed inside a card that may have
  // been hidden (display:none) during load.
  setTimeout(() => mapInstance.invalidateSize(), 150);
}

async function deriveCoordinates(shipment, latestUpdate) {
  const candidate = latestUpdate?.location || shipment.location || shipment.location_text;
  if (candidate && typeof candidate === "string") {
    try {
      const q = encodeURIComponent(candidate);
      const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${q}`, {
        headers: { Accept: "application/json" }
      });
      if (!resp.ok) throw new Error("Geocode failed");
      const j = await resp.json();
      if (Array.isArray(j) && j.length > 0) return [Number(j[0].lat), Number(j[0].lon)];
    } catch (err) { console.warn("Geocode error", err); }
  }
  return [null, null];
}

/* ============================================================
   8. load + live refresh
   ============================================================ */
async function loadTracking({ silent = false } = {}) {
  if (!trackingNo) { window.location.href = "tracking-form.html"; return; }

  if (!silent) {
    loadingState.classList.remove("hidden");
    errorState.classList.add("hidden");
    resultsWrap.classList.add("hidden");
  }

  try {
    const { data: shipment, error: shipmentError } = await supabase
      .from("user_info").select("*").eq("tracking_no", trackingNo).maybeSingle();

    if (shipmentError || !shipment) {
      loadingState.classList.add("hidden");
      errorState.classList.remove("hidden");
      errorText.textContent = `${t("invalidCodeMessage")} ${trackingNo}`;
      return;
    }

    const { data: updates, error: updatesError } = await supabase
      .from("tracking_updates").select("*").eq("shipment_id", shipment.id)
      .order("created_at", { ascending: false });
    if (updatesError) console.warn("updates error", updatesError);

    fetchedShipment = shipment;
    fetchedUpdates = updates || [];

    loadingState.classList.add("hidden");
    resultsWrap.classList.remove("hidden");

    renderAll();

    const latestUpdate = fetchedUpdates[0] || null;
    const [lat, lng] = await deriveCoordinates(fetchedShipment, latestUpdate);
    if (lat && lng) {
      await updateMapTo(lat, lng, `<strong>${escapeHtml(fetchedShipment.receiver_name || "Package")}</strong><br>${escapeHtml(latestUpdate?.location || fetchedShipment.location || "")}`);
    } else {
      mapCard.classList.add("hidden");
    }
  } catch (err) {
    console.error(err);
    loadingState.classList.add("hidden");
    errorState.classList.remove("hidden");
    errorText.textContent = `${t("invalidCodeMessage")} ${trackingNo}`;
  }
}

let refreshTimer = null;
async function refreshTrackingIfChanged() {
  if (!fetchedShipment) return;
  try {
    const { data: shipmentFresh, error } = await supabase
      .from("user_info").select("*").eq("id", fetchedShipment.id).maybeSingle();
    if (error || !shipmentFresh) return;

    const { data: updatesFresh } = await supabase
      .from("tracking_updates").select("*").eq("shipment_id", fetchedShipment.id)
      .order("created_at", { ascending: false });

    const changed = JSON.stringify(updatesFresh) !== JSON.stringify(fetchedUpdates) ||
      JSON.stringify(shipmentFresh) !== JSON.stringify(fetchedShipment);

    if (changed) {
      fetchedShipment = shipmentFresh;
      fetchedUpdates = updatesFresh || [];
      renderAll();
      const latestUpdate = fetchedUpdates[0] || null;
      const [lat, lng] = await deriveCoordinates(fetchedShipment, latestUpdate);
      if (lat && lng) {
        updateMapTo(lat, lng, `<strong>${escapeHtml(fetchedShipment.receiver_name || "Package")}</strong><br>${escapeHtml(latestUpdate?.location || fetchedShipment.location || "")}`);
      }
    }
  } catch (err) { console.warn("refresh error", err); }
}

/* ============================================================
   9. action buttons
   ============================================================ */
document.getElementById("copyTrackingBtn")?.addEventListener("click", () => {
  const val = document.getElementById("summaryTrackingNo").textContent;
  if (!val || val === "-") return;
  navigator.clipboard?.writeText(val)
    .then(() => flashPill(t("copySuccess")))
    .catch(() => flashPill(t("copyFail")));
});
document.getElementById("refreshBtn")?.addEventListener("click", () => refreshTrackingIfChanged());
document.getElementById("shareBtn")?.addEventListener("click", async () => {
  const url = window.location.href;
  if (navigator.share) {
    try { await navigator.share({ title: "AOL Logistics", url }); return; } catch (_) {}
  }
  navigator.clipboard?.writeText(url).then(() => flashPill(t("shareSuccess")));
});
document.getElementById("printBtn")?.addEventListener("click", () => window.print());

/* ============================================================
   10. init
   ============================================================ */
applyTrackingTranslations();
loadTracking().then(() => {
  if (refreshTimer) clearInterval(refreshTimer);
  refreshTimer = setInterval(refreshTrackingIfChanged, 15000);
});
window.addEventListener("beforeunload", () => { if (refreshTimer) clearInterval(refreshTimer); });
