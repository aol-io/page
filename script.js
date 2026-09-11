/* ==========================================================
   AOL LOGISTICS — script.js
   All page behavior lives here now (previously five separate
   inline <script> blocks in the HTML). Loaded as a single
   ES module from index.html:
     <script type="module" src="script.js"></script>

   Sections:
     1. Hero slider
     2. Header scroll state + scroll-to-top button
     3. Mobile menu
     4. Language toggle (KO/EN) + translations dictionary
     5. Contact form (Supabase insert)
     6. Chat widget: session/history/realtime (Supabase) +
        upgraded AI-style reply engine
   ========================================================== */

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  "https://rtgvylkbndrmwntaqkfx.supabase.co",
  "sb_publishable_SFI-gjeDtTrOGpLp1_BTtg_hXy6wPSB"
);

/* ============================================================
   1. HERO SLIDER
   ============================================================ */
const slides = document.querySelectorAll(".hero-slide");
let heroIndex = 0;
function showSlide(i) {
  slides.forEach((s, idx) => s.classList.toggle("active", idx === i));
}
if (slides.length) {
  showSlide(heroIndex);
  setInterval(() => {
    heroIndex = (heroIndex + 1) % slides.length;
    showSlide(heroIndex);
  }, 5000);
}

/* ============================================================
   2. HEADER SCROLL STATE + SCROLL-TO-TOP
   ============================================================ */
const siteHeader = document.getElementById("siteHeader");
const scrollTopBtn = document.getElementById("scrollTopBtn");
if (scrollTopBtn) scrollTopBtn.classList.add("chat-present");

window.addEventListener(
  "scroll",
  () => {
    const y = window.scrollY;
    if (siteHeader) siteHeader.classList.toggle("scrolled", y > 30);
    if (scrollTopBtn) scrollTopBtn.classList.toggle("show", y > 500);
  },
  { passive: true }
);
if (scrollTopBtn) {
  scrollTopBtn.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: "smooth" })
  );
}

/* ============================================================
   3. MOBILE MENU
   ============================================================ */
const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");
let mobileMenuOpen = false;

function closeMobileMenu() {
  mobileMenuOpen = false;
  if (mobileMenu) mobileMenu.classList.remove("open");
  if (menuBtn) menuBtn.setAttribute("aria-expanded", "false");
}

if (menuBtn && mobileMenu) {
  menuBtn.addEventListener("click", () => {
    mobileMenuOpen = !mobileMenuOpen;
    mobileMenu.classList.toggle("open", mobileMenuOpen);
    menuBtn.setAttribute("aria-expanded", String(mobileMenuOpen));
  });
  mobileMenu.querySelectorAll("a").forEach((link) =>
    link.addEventListener("click", closeMobileMenu)
  );
}

/* ============================================================
   4. LANGUAGE TOGGLE + TRANSLATIONS
   ============================================================ */
const langToggle = document.getElementById("langToggle");

const translations = {
  en: {
    brand: "AOL LOGISTICS",
    footer_tagline_short: "delivery service at its finest",
    nav_home: "Home", nav_about: "About Us", nav_services: "Services", nav_track: "Track Shipment",
    nav_create: "Create Shipment", nav_reach: "Global Reach", nav_why: "Why Us", nav_industries: "Industries",
    nav_news: "Book shop", nav_testimonials: "Testimonials", nav_contact: "Contact", nav_login: "Login",
    hero_eyebrow: "GLOBAL FREIGHT NETWORK",
    hero_img1_alt: "Cargo Ship", hero_img2_alt: "Container Port", hero_img3_alt: "Logistics Truck",
    hero_title: 'We move cargo and <span class="accent">connect continents</span>.',
    hero_sub: "Reliable logistics solutions that deliver across the globe.",
    hero_track: "Track Shipment", hero_quote: "Request Quote",
    stat_continents: "Continents Served", stat_services: "Freight Services", stat_industries: "Industries Served", stat_support: "Support Desk",
    ticker_live: "NETWORK ACTIVE",
    track_badge: "SMART TRACKING",
    track_section_title: "Track Your Shipment",
    track_section_sub: "Enter your tracking number to see its real-time location.",
    tracking_placeholder: "Enter Tracking Number", track_button_text: "Track",
    services_eyebrow: "CARGO CAPABILITIES",
    services_title: "Our Services",
    services_sub: "Three core freight services matched to the size and nature of your cargo.",
    service1_title: "Container Shipping", service1_text: "Secure and efficient container transport across global trade routes.",
    service2_title: "RoRo (Roll-on/Roll-off)", service2_text: "Seamless shipping for vehicles and heavy machinery worldwide.",
    service3_title: "Special Cargo", service3_text: "Custom solutions for oversized and time-sensitive cargo shipments.",
    reach_eyebrow: "PORT NETWORK",
    reach_title: "Our Global Reach",
    reach_text: "We proudly deliver across every continent — serving businesses from North America to Asia, Africa to Europe, and South America.",
    reach_country_na: "North America", reach_country_sa: "South America", reach_country_eu: "Europe", reach_country_as: "Asia", reach_country_af: "Africa",
    about_eyebrow: "WHO WE ARE",
    about_title: "About Us",
    about_p1: "AOL LOGISTICS is a trusted name in global shipping and logistics. With decades of experience, we ensure smooth, reliable, and cost-effective transportation of goods worldwide.",
    about_p2: "Our mission is to connect businesses across continents and make international trade seamless.",
    why_eyebrow: "OPERATIONS EDGE",
    why_title: "Why Choose Us",
    why_item1_title: "Experience", why_item1_text: "Decades of global logistics expertise across industries.",
    why_item2_title: "Global Network", why_item2_text: "Strong connections with ports, carriers and warehouses worldwide.",
    why_item3_title: "Customer Focus", why_item3_text: "Personalized solutions, transparent tracking and 24/7 support.",
    testimonials_eyebrow: "FROM THE MANIFEST LOG",
    testimonials_title: "What Our Customers Say",
    verified_badge: "VERIFIED",
    testimonial1_img_alt: "Customer 1", testimonial1_text: '"AOL Logistics handled my deliveries with such care and speed. I always felt informed with their real-time tracking."', testimonial1_name: "Sarah Johnson", testimonial1_role: "Small Business Owner",
    testimonial2_img_alt: "Customer 2", testimonial2_text: '"Fast, reliable, and transparent. My online store relies on AOL Logistics for every shipment — never been disappointed."', testimonial2_name: "Michael Lee", testimonial2_role: "E-commerce Entrepreneur",
    testimonial3_img_alt: "Customer 3", testimonial3_text: '"Excellent support team, smooth process, and quick updates. AOL Logistics is a partner I fully trust with my cargo."', testimonial3_name: "Amira Khan", testimonial3_role: "Frequent Shipper",
    industries_eyebrow: "SECTORS SERVED",
    industries_title: "Industries We Serve",
    industry1_title: "Automotive", industry1_text: "Reliable RoRo shipping for cars, trucks and heavy machinery.",
    industry2_title: "Retail", industry2_text: "Fast supply chain solutions for stores and e-commerce businesses.",
    industry3_title: "Energy", industry3_text: "Safe transport of equipment for oil, gas and renewable energy projects.",
    industry4_title: "Healthcare", industry4_text: "Temperature-controlled shipping for pharmaceuticals and medical supplies.",
    news_eyebrow: "LATEST INSIGHTS",
    news_title: "Latest Insights",
    news1_title: "Global Shipping Trends 2025", news1_text: "Stay updated with the latest challenges and innovations in global shipping.",
    news2_title: "How AOL Optimizes RoRo", news2_text: "Discover how we simplify vehicle and machinery shipping worldwide.",
    news3_title: "Technology in Logistics", news3_text: "Learn how AI and IoT are transforming the shipping industry.",
    contact_eyebrow: "GET IN TOUCH",
    contact_title: "Contact Us",
    contact_hq_label: "HEADQUARTERS", contact_phone_label: "PHONE", contact_email_label: "EMAIL",
    contact_address_line: "📍 131 Maple St, Frostburg, MD 21532, United States",
    contact_phone_line: "📞 +1 800 173 5507",
    contact_email_line: "📧 logisticsaol6@gmail.com",
    contact_form_name_placeholder: "Your Name", contact_form_email_placeholder: "Your Email", contact_form_message_placeholder: "Your Message", contact_form_button: "Send Message",
    footer_brand: "AOL LOGISTICS",
    footer_tagline: "Connecting continents with reliable shipping and logistics solutions.",
    footer_links_heading: "Quick Links",
    footer_contact_heading: "Contact",
    footer_email: "Email: logisticsaol6@gmail.com",
    footer_phone: "Phone: +1 800 173 5507",
    copyright_text: "© 2025 AOL LOGISTICS. All rights reserved.",
    chat_title: "AOL Support",
    chat_status_bot: "AI Assistant",
    chat_status_admin: "Agent connected",
    chat_input_placeholder: "Type a message...",
    chat_greeting: "Hi, I'm Aria — the AOL virtual assistant 🚚\n\nAsk me anything about shipping with us: tracking, quotes, services, customs, insurance, or how to reach a human. What can I help with?",
    chat_send_error: "Couldn't send that. Please try again."
  },
  ko: {
    brand: "AOL LOGISTICS",
    footer_tagline_short: "최상의 배송 서비스",
    nav_home: "홈", nav_about: "회사 소개", nav_services: "서비스", nav_track: "배송 추적",
    nav_create: "배송 생성", nav_reach: "글로벌 네트워크", nav_why: "왜 우리인가", nav_industries: "산업 분야",
    nav_news: "서점", nav_testimonials: "고객 후기", nav_contact: "연락처", nav_login: "로그인",
    hero_eyebrow: "글로벌 화물 네트워크",
    hero_img1_alt: "화물선", hero_img2_alt: "컨테이너 항구", hero_img3_alt: "물류 트럭",
    hero_title: '화물을 이동하고 <span class="accent">대륙을 연결</span>합니다.',
    hero_sub: "전 세계 어디서든 신뢰할 수 있는 물류 솔루션을 제공합니다.",
    hero_track: "배송 추적", hero_quote: "견적 요청",
    stat_continents: "대륙 서비스", stat_services: "화물 서비스", stat_industries: "전문 산업 분야", stat_support: "고객 지원",
    ticker_live: "네트워크 가동 중",
    track_badge: "스마트 추적",
    track_section_title: "배송 추적",
    track_section_sub: "운송장 번호만 입력하면 실시간 위치를 확인할 수 있습니다.",
    tracking_placeholder: "운송장 번호를 입력하세요", track_button_text: "추적",
    services_eyebrow: "화물 운송 역량",
    services_title: "우리의 서비스",
    services_sub: "화물의 종류와 규모에 맞춘 세 가지 핵심 운송 서비스를 제공합니다.",
    service1_title: "컨테이너 운송", service1_text: "글로벌 무역 경로를 통한 안전하고 효율적인 컨테이너 운송.",
    service2_title: "RoRo (롤온/롤오프)", service2_text: "차량 및 중장비를 위한 원활한 전세계 선적 서비스.",
    service3_title: "특수 화물", service3_text: "대형 화물 및 긴급 화물 운송을 위한 맞춤형 솔루션.",
    reach_eyebrow: "항만 네트워크",
    reach_title: "글로벌 네트워크",
    reach_text: "북미부터 아시아, 아프리카, 유럽, 남미까지 전 대륙에 걸쳐 서비스를 제공합니다.",
    reach_country_na: "북미", reach_country_sa: "남미", reach_country_eu: "유럽", reach_country_as: "아시아", reach_country_af: "아프리카",
    about_eyebrow: "회사 소개",
    about_title: "회사 소개",
    about_p1: "AOL LOGISTICS는 전 세계 해운 및 물류 분야에서 신뢰받는 이름입니다. 수십 년의 경험을 바탕으로 원활하고 신뢰할 수 있으며 비용 효율적인 화물 운송을 보장합니다.",
    about_p2: "우리의 사명은 기업들을 대륙 간에 연결하고 국제 무역을 원활하게 만드는 것입니다.",
    why_eyebrow: "운영 경쟁력",
    why_title: "왜 우리를 선택해야 하나요",
    why_item1_title: "경험", why_item1_text: "산업 전반에 걸친 수십 년의 글로벌 물류 전문성.",
    why_item2_title: "글로벌 네트워크", why_item2_text: "전 세계 항만, 운송사 및 창고와의 강력한 연결망.",
    why_item3_title: "고객 중심", why_item3_text: "맞춤형 솔루션, 투명한 추적 및 24/7 지원.",
    testimonials_eyebrow: "배송 기록에서",
    testimonials_title: "고객의 소리",
    verified_badge: "인증됨",
    testimonial1_img_alt: "고객 1", testimonial1_text: '"AOL Logistics는 저의 배송을 세심하고 신속하게 처리해 주었습니다. 실시간 추적으로 항상 정보를 받을 수 있었습니다."', testimonial1_name: "Sarah Johnson", testimonial1_role: "소상공인",
    testimonial2_img_alt: "고객 2", testimonial2_text: '"빠르고 신뢰할 수 있으며 투명합니다. 저의 온라인 상점은 모든 배송을 AOL Logistics에 의존합니다."', testimonial2_name: "Michael Lee", testimonial2_role: "전자상거래 사업가",
    testimonial3_img_alt: "고객 3", testimonial3_text: '"훌륭한 지원 팀, 원활한 프로세스 및 빠른 업데이트. AOL Logistics는 제가 화물을 맡길 수 있는 신뢰할 수 있는 파트너입니다."', testimonial3_name: "Amira Khan", testimonial3_role: "자주 사용하는 발송자",
    industries_eyebrow: "제공 산업 분야",
    industries_title: "우리가 제공하는 산업",
    industry1_title: "자동차", industry1_text: "자동차, 트럭 및 중장비를 위한 신뢰할 수 있는 RoRo 선적.",
    industry2_title: "소매", industry2_text: "매장 및 전자상거래 업체를 위한 빠른 공급망 솔루션.",
    industry3_title: "에너지", industry3_text: "석유, 가스 및 재생에너지 프로젝트용 장비의 안전한 운송.",
    industry4_title: "의료", industry4_text: "의약품 및 의료용품을 위한 온도 제어 배송.",
    news_eyebrow: "최신 소식",
    news_title: "최신 소식",
    news1_title: "글로벌 배송 트렌드 2025", news1_text: "글로벌 배송의 최신 과제와 혁신을 확인하세요.",
    news2_title: "AOL의 RoRo 최적화 방법", news2_text: "차량 및 기계류 선적을 간소화하는 방법을 알아보세요.",
    news3_title: "물류의 기술", news3_text: "AI 및 IoT가 화물 업계를 어떻게 변화시키는지 확인하세요.",
    contact_eyebrow: "문의하기",
    contact_title: "문의하기",
    contact_hq_label: "본사", contact_phone_label: "전화", contact_email_label: "이메일",
    contact_address_line: "📍 미국 21532 메릴랜드주 프로스트버그 메이플 스트리트 131A",
    contact_phone_line: "📞 +1 800 173 5507",
    contact_email_line: "📧 logisticsaol6@gmail.com",
    contact_form_name_placeholder: "이름", contact_form_email_placeholder: "이메일", contact_form_message_placeholder: "메시지", contact_form_button: "메시지 보내기",
    footer_brand: "AOL LOGISTICS",
    footer_tagline: "신뢰할 수 있는 해운 및 물류 솔루션으로 대륙을 연결합니다.",
    footer_links_heading: "빠른 링크",
    footer_contact_heading: "연락처",
    footer_email: "이메일: logisticsaol6@gmail.com",
    footer_phone: "전화: +1 800 173 5507",
    copyright_text: "© 2025 AOL LOGISTICS. 모든 권리 보유.",
    chat_title: "AOL 고객 지원",
    chat_status_bot: "AI 어시스턴트",
    chat_status_admin: "상담원 연결됨",
    chat_input_placeholder: "메시지를 입력하세요...",
    chat_greeting: "안녕하세요, 저는 아리아입니다 — AOL 물류 가상 상담원이에요 🚚\n\n배송 추적, 견적, 서비스, 통관, 보험, 상담원 연결 등 무엇이든 편하게 물어보세요. 무엇을 도와드릴까요?",
    chat_send_error: "전송하지 못했습니다. 다시 시도해 주세요."
  }
};

function getSiteLang() {
  return localStorage.getItem("site_lang") || "ko";
}

function buildTicker(lang) {
  const d = translations[lang];
  const continents = [d.reach_country_na, d.reach_country_sa, d.reach_country_eu, d.reach_country_as, d.reach_country_af];
  const pairs = [];
  for (let i = 0; i < continents.length; i++) {
    pairs.push(`${continents[i]} <span class="sep">⇄</span> ${continents[(i + 2) % continents.length]}`);
  }
  const track = document.getElementById("tickerTrack");
  if (track) track.innerHTML = pairs.concat(pairs).map((p) => `<span>${p}</span>`).join('<span class="sep">•</span>');
}

// The chat status line ("AI Assistant" / "Agent connected") keeps a
// live status dot as its first child — never overwrite it with
// textContent, or the dot disappears. This is the one data-key
// element the generic translator below has to special-case.
function renderChatStatus() {
  const label = document.getElementById("chatStatusLabel");
  if (!label) return;
  const lang = getSiteLang();
  const text = window.__chatSessionStatus === "admin"
    ? translations[lang].chat_status_admin
    : translations[lang].chat_status_bot;
  label.innerHTML = `<span class="ch-dot"></span>${text}`;
}

function setLanguage(lang) {
  document.querySelectorAll("[data-key]").forEach((el) => {
    if (el.id === "chatStatusLabel") return; // handled by renderChatStatus()
    const key = el.getAttribute("data-key");
    const text = translations[lang] && translations[lang][key] ? translations[lang][key] : null;
    if (!text) return;

    if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
      el.placeholder = text;
    } else if (el.tagName === "IMG") {
      el.alt = text;
    } else if (key === "hero_title") {
      el.innerHTML = text;
    } else {
      el.textContent = text;
    }
  });

  if (langToggle) langToggle.textContent = lang === "ko" ? "EN" : "한국어";
  localStorage.setItem("site_lang", lang);
  buildTicker(lang);
  renderChatStatus();
  if (window.__chatOnLanguageChange) window.__chatOnLanguageChange();
}

document.addEventListener("DOMContentLoaded", () => setLanguage(getSiteLang()));
if (langToggle) {
  langToggle.addEventListener("click", () => setLanguage(getSiteLang() === "ko" ? "en" : "ko"));
}

/* ============================================================
   5. CONTACT FORM (Supabase insert)
   ============================================================ */
function ct(key) {
  const lang = getSiteLang();
  const map = {
    ko: { sending: "전송 중...", sendButton: "메시지 보내기", sent: "✅ 메시지가 성공적으로 전송되었습니다!", errorPrefix: "❌ 오류: " },
    en: { sending: "Sending...", sendButton: "Send Message", sent: "✅ Message sent successfully!", errorPrefix: "❌ Error: " }
  };
  return map[lang][key];
}

const contactForm = document.getElementById("contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = document.getElementById("contactSubmit");
    const msg = document.getElementById("contactMessage");

    btn.disabled = true;
    btn.innerText = ct("sending");

    const name = document.getElementById("contact_name").value.trim();
    const email = document.getElementById("contact_email").value.trim();
    const message = document.getElementById("contact_message").value.trim();

    if (!name || !email || !message) {
      msg.innerHTML = `<p style="color:#E5484D;">${ct("errorPrefix")}Please complete all fields.</p>`;
      btn.disabled = false;
      btn.innerText = ct("sendButton");
      return;
    }

    try {
      const { error } = await supabase.from("messages").insert([{ name, email, message }]);
      if (error) {
        msg.innerHTML = `<p style="color:#E5484D;">${ct("errorPrefix")}${error.message}</p>`;
        btn.disabled = false;
        btn.innerText = ct("sendButton");
        return;
      }
      msg.innerHTML = `<p style="color:#1FA97A; font-weight:600;">${ct("sent")}</p>`;
      contactForm.reset();
      btn.disabled = false;
      btn.innerText = ct("sendButton");
    } catch (ex) {
      console.error("Contact submit error:", ex);
      msg.innerHTML = `<p style="color:#E5484D;">${ct("errorPrefix")}${ex.message || ex}</p>`;
      btn.disabled = false;
      btn.innerText = ct("sendButton");
    }
  });

  window.addEventListener("storage", (e) => {
    if (e.key === "site_lang") {
      const btn = document.getElementById("contactSubmit");
      if (btn) btn.innerText = getSiteLang() === "en" ? "Send Message" : "메시지 보내기";
    }
  });
}

/* ============================================================
   6. CHAT WIDGET — Aria, the AOL assistant
   ============================================================ */
const chatCopy = {
  ko: {
    greeting: translations.ko.chat_greeting,
    sendError: translations.ko.chat_send_error,
    you: "나", bot: "아리아", admin: "상담원"
  },
  en: {
    greeting: translations.en.chat_greeting,
    sendError: translations.en.chat_send_error,
    you: "You", bot: "Aria", admin: "Agent"
  }
};
function lang() { return getSiteLang(); }
function cc() { return chatCopy[lang()] || chatCopy.ko; }

const fab = document.getElementById("chatFab");
const panel = document.getElementById("chatPanel");
const closeBtn = document.getElementById("chatCloseBtn");
const body = document.getElementById("chatBody");
const input = document.getElementById("chatInput");
const sendBtn = document.getElementById("chatSendBtn");
const unreadBadge = document.getElementById("chatUnread");

let sessionId = localStorage.getItem("aol_chat_session_id") || null;
let sessionStatus = "bot";
window.__chatSessionStatus = sessionStatus;
let channel = null;
let isOpen = false;
let unread = 0;
let renderedIds = new Set();

window.__chatOnLanguageChange = () => {
  if (input) input.placeholder = translations[lang()].chat_input_placeholder;
};
window.__chatOnLanguageChange();

function scrollToBottom() {
  if (body) body.scrollTop = body.scrollHeight;
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// Turns any relative (tracking.html?...) or absolute (https://...) URL
// inside a bot/admin message into a clickable link, while still
// escaping everything else so we never inject raw HTML from anywhere.
function linkify(text) {
  const escaped = escapeHtml(text);
  return escaped.replace(/(https?:\/\/[^\s]+|[a-zA-Z0-9_-]+\.html\?[^\s]+)/g, (url) => {
    return `<a href="${url}" class="chat-link" target="_self" rel="noopener">${url}</a>`;
  });
}

function addBubble(sender, content, atStart = false) {
  const c = cc();
  const wrap = document.createElement("div");
  wrap.className = `chat-msg from-${sender}`;
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  if (sender === "user") {
    bubble.textContent = content;
  } else {
    bubble.innerHTML = linkify(content);
  }
  const meta = document.createElement("div");
  meta.className = "meta";
  meta.textContent = sender === "user" ? c.you : sender === "admin" ? c.admin : c.bot;
  wrap.appendChild(bubble);
  wrap.appendChild(meta);
  if (atStart) body.insertBefore(wrap, body.firstChild);
  else body.appendChild(wrap);
}

// Tappable quick-reply chips under a bot message, so mobile users
// don't have to type at all.
function addQuickReplies(options) {
  const row = document.createElement("div");
  row.className = "chat-quick-replies";
  options.forEach((opt) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "chat-quick-btn";
    btn.textContent = opt;
    btn.addEventListener("click", () => {
      row.remove();
      input.value = opt;
      sendMessage();
    });
    row.appendChild(btn);
  });
  body.appendChild(row);
  scrollToBottom();
}

function showTyping() {
  hideTyping();
  const t = document.createElement("div");
  t.className = "chat-typing";
  t.id = "chatTypingIndicator";
  t.innerHTML = "<span></span><span></span><span></span>";
  body.appendChild(t);
  scrollToBottom();
}
function hideTyping() {
  const t = document.getElementById("chatTypingIndicator");
  if (t) t.remove();
}

/* ---------------------------------------------------------------
   TRACKING NUMBER DETECTION
   Recognizes a pasted/typed tracking number in free text so the
   bot can hand the user straight to tracking.html with the number
   pre-filled, instead of asking them to retype it in the form.
--------------------------------------------------------------- */
function extractTrackingNumber(rawText) {
  const trimmed = rawText.trim();
  if (!trimmed) return null;

  const labeled = trimmed.match(
    /(?:tracking\s*(?:number|no\.?|#)?|운송장\s*번호|송장\s*번호|awb\s*#?)\s*[:#-]?\s*([A-Za-z0-9-]{5,30})/i
  );
  if (labeled && /\d/.test(labeled[1])) return labeled[1].toUpperCase();

  const tokens = trimmed.split(/\s+/).filter(Boolean);
  if (tokens.length <= 3) {
    for (const raw of tokens) {
      const tok = raw.replace(/^[.,;:!?()]+|[.,;:!?()]+$/g, "");
      const isMixedCode = /^[A-Za-z0-9-]{6,30}$/.test(tok) && /\d/.test(tok) && /[A-Za-z]/.test(tok);
      const isNumericCode = /^[0-9]{8,20}$/.test(tok);
      if (isMixedCode || isNumericCode) return tok.toUpperCase();
    }
  }
  return null;
}

/* ---------------------------------------------------------------
   BOT REPLY ENGINE — "Aria"
   Generates the assistant's reply directly in the browser rather
   than depending on a Supabase Edge Function that may not exist.
   Covers every section of the site (tracking, quotes, services,
   reach, industries, insurance, customs, payment, hours, shipment
   management, and human handoff) so it reads like a real product
   assistant rather than a static FAQ bot.

   If you later deploy a real LLM-backed Edge Function, swap the
   body of generateBotReply() for a call to it.
--------------------------------------------------------------- */
function generateBotReply(rawText, langCode) {
  const isKo = langCode === "ko";
  const q = rawText.toLowerCase().trim();
  const has = (words) => words.some((w) => q.includes(w));

  // ---- 0. Tracking number pasted directly into chat ----
  const trackingNo = extractTrackingNumber(rawText);
  if (trackingNo) {
    const url = `tracking.html?tracking_no=${encodeURIComponent(trackingNo)}`;
    return isKo
      ? `운송장 번호 ${trackingNo} 확인했습니다 📦\n\n아래 링크를 눌러 실시간 배송 상태를 바로 확인하세요:\n${url}`
      : `Got your tracking number ${trackingNo} 📦\n\nTap the link below to see its real-time status right away:\n${url}`;
  }

  // ---- 1. Tracking (no number given yet) ----
  if (has(["추적", "어디", "배송 상태", "배송상태", "track", "where is my", "shipment status"])) {
    return isKo
      ? '배송 추적은 간단해요 📦\n\n운송장 번호를 이 채팅창에 그대로 붙여넣으시면 추적 페이지 링크를 바로 드릴게요. 또는 상단 메뉴의 "배송 추적"을 이용해 주세요.'
      : 'Tracking is easy 📦\n\nJust paste your tracking number right here in the chat and I\'ll send you a direct link to check its status. Or use "Track Shipment" in the menu.';
  }

  // ---- 2. Quotes / pricing ----
  if (has(["견적", "가격", "요금", "비용", "quote", "price", "cost", "how much", "rate"])) {
    return isKo
      ? '견적 문의 감사합니다 💰\n\n컨테이너 운송, RoRo(차량/중장비), 특수 화물 중 어떤 서비스가 필요하신가요? 출발지, 도착지, 화물 정보(무게/부피)를 알려주시면 상담원이 정확한 견적을 도와드립니다. 하단 "연락처" 양식으로도 요청하실 수 있어요.'
      : 'Happy to help with a quote 💰\n\nAre you looking for Container Shipping, RoRo (vehicles/heavy machinery), or Special Cargo? Share your origin, destination, and cargo details (weight/volume) and an agent can put together an accurate quote. You can also use the contact form below.';
  }

  // ---- 3. Delivery time / ETA ----
  if (has(["얼마나 걸려", "도착 시간", "배송 기간", "소요 시간", "eta", "how long", "delivery time", "arrive"])) {
    return isKo
      ? "배송 소요 시간은 경로와 서비스 종류에 따라 달라집니다 ⏱️\n\n운송장 번호가 있으시면 예상 도착일을 바로 확인해 드릴 수 있고, 아직 배송 전이라면 출발지/도착지를 알려주시면 대략적인 소요 기간을 안내해 드릴게요."
      : "Transit time depends on the route and service type ⏱️\n\nIf you already have a tracking number, I can show you the estimated arrival right away. If it hasn't shipped yet, tell me the origin and destination and I can give you a rough timeframe.";
  }

  // ---- 4. Services overview ----
  if (has(["서비스", "service", "services", "무엇을 하", "what do you"])) {
    return isKo
      ? "AOL LOGISTICS는 세 가지 핵심 서비스를 제공합니다 🌍\n\n• 컨테이너 운송 — 글로벌 무역 경로 안전 운송\n• RoRo (롤온/롤오프) — 차량 및 중장비 선적\n• 특수 화물 — 대형·긴급 화물 맞춤 솔루션\n\n더 알고 싶은 서비스가 있으신가요?"
      : "AOL LOGISTICS offers three core services 🌍\n\n• Container Shipping — secure transport on global trade routes\n• RoRo (Roll-on/Roll-off) — vehicles & heavy machinery\n• Special Cargo — custom solutions for oversized or urgent shipments\n\nWant more detail on any of these?";
  }

  // ---- 5. Container shipping detail ----
  if (has(["컨테이너", "container"])) {
    return isKo
      ? "컨테이너 운송 서비스는 전 세계 주요 무역 경로를 통해 화물을 안전하고 효율적으로 운송합니다 🚢\n\nFCL(전용 컨테이너)과 LCL(혼재) 모두 가능하며, 출발지/도착지와 화물량을 알려주시면 견적을 도와드릴 수 있어요."
      : "Container Shipping moves cargo securely and efficiently across the world's major trade routes 🚢\n\nWe support both FCL (full container load) and LCL (shared container). Share your origin/destination and cargo volume and I can help get you a quote.";
  }

  // ---- 6. RoRo detail ----
  if (has(["roro", "롤온", "롤오프", "vehicle shipping", "차량 운송", "자동차 운송"])) {
    return isKo
      ? "RoRo(롤온/롤오프) 서비스는 차량, 트럭, 중장비를 위한 전세계 선적 서비스입니다 🚗\n\n차량을 직접 운전해서 선적하는 방식이라 컨테이너 포장 없이도 안전하게 운송됩니다. 차량 대수와 목적지를 알려주시면 안내해 드릴게요."
      : "RoRo (Roll-on/Roll-off) is our worldwide shipping service for vehicles, trucks, and heavy machinery 🚗\n\nVehicles are driven directly on and off the vessel, so they travel securely without needing container packing. Tell me the number of vehicles and destination and I can guide you further.";
  }

  // ---- 7. Special cargo detail ----
  if (has(["특수 화물", "특수화물", "special cargo", "oversized", "중량물", "긴급 화물"])) {
    return isKo
      ? "특수 화물 서비스는 대형·과중량·긴급 화물을 위한 맞춤형 솔루션입니다 📐\n\n화물의 크기, 무게, 필요 일정을 알려주시면 담당 상담원이 최적의 운송 방법을 제안해 드립니다."
      : "Special Cargo covers custom solutions for oversized, heavy, or time-sensitive shipments 📐\n\nShare the dimensions, weight, and required timeline and an agent can propose the best transport method.";
  }

  // ---- 8. Insurance / damage / claims ----
  if (has(["보험", "파손", "손상", "클레임", "insurance", "damage", "damaged", "claim", "lost package", "분실"])) {
    return isKo
      ? "화물 보험 및 손상/분실 관련 문의는 신속하게 처리해 드립니다 🛡️\n\n운송장 번호와 문제 상황(파손/분실/지연)을 알려주시면 상담원에게 바로 전달해 드릴게요. 급하신 경우 📞 +1 800 173 5507로 연락 주셔도 됩니다."
      : "Cargo insurance and damage/loss issues get priority handling 🛡️\n\nShare your tracking number and describe the issue (damaged/lost/delayed) and I'll flag it for an agent right away. For urgent cases, you can also call 📞 +1 800 173 5507.";
  }

  // ---- 9. Customs / documents ----
  if (has(["세관", "통관", "서류", "관세", "customs", "duties", "documents needed", "paperwork"])) {
    return isKo
      ? "통관 절차는 화물 종류와 목적지 국가에 따라 다릅니다 📄\n\n일반적으로 상업 송장, 포장 명세서, 원산지 증명서가 필요합니다. 목적지 국가를 알려주시면 더 구체적으로 안내해 드릴게요."
      : "Customs requirements vary by cargo type and destination country 📄\n\nTypically you'll need a commercial invoice, packing list, and certificate of origin. Tell me the destination country and I can give you more specific guidance.";
  }

  // ---- 10. Payment methods ----
  if (has(["결제", "지불", "입금", "payment", "pay", "invoice"])) {
    return isKo
      ? "결제는 계좌이체, 신용카드, 기업 인보이스 결제를 지원합니다 💳\n\n정확한 결제 절차는 담당 상담원이 견적과 함께 안내해 드립니다."
      : "We support bank transfer, credit card, and invoiced payment for business accounts 💳\n\nAn agent will walk you through the exact payment process along with your quote.";
  }

  // ---- 11. Service areas / countries ----
  if (has(["어느 나라", "지역", "국가", "countries", "coverage", "which countries", "areas do you serve"])) {
    return isKo
      ? "북미, 남미, 유럽, 아시아, 아프리카까지 5대륙 전역에 서비스를 제공합니다 🌍\n\n특정 국가나 항구에 대해 궁금하신 점이 있으면 말씀해 주세요."
      : "We serve all five continents — North America, South America, Europe, Asia, and Africa 🌍\n\nLet me know if you have a specific country or port in mind.";
  }

  // ---- 12. Industries served ----
  if (has(["산업", "자동차 산업", "industries", "industry", "sector"])) {
    return isKo
      ? "자동차, 소매, 에너지, 의료 산업을 위한 맞춤형 물류 솔루션을 제공합니다 🏭\n\n특히 의료 분야는 온도 제어 배송도 지원합니다. 어떤 산업에 대해 더 알고 싶으신가요?"
      : "We provide tailored logistics for the automotive, retail, energy, and healthcare industries 🏭\n\nHealthcare shipments can also get temperature-controlled handling. Which industry would you like to know more about?";
  }

  // ---- 13. Operating hours / support ----
  if (has(["운영 시간", "영업 시간", "몇 시", "hours", "open", "business hours"])) {
    return isKo
      ? "고객 지원은 연중무휴 24시간 운영됩니다 🕐\n\n언제든 이 채팅창이나 📞 +1 800 173 5507, 📧 logisticsaol6@gmail.com으로 연락 주세요."
      : "Our support desk runs 24/7, every day of the year 🕐\n\nReach us anytime right here in chat, by phone at 📞 +1 800 173 5507, or by email at 📧 logisticsaol6@gmail.com.";
  }

  // ---- 14. Cancel / modify a shipment ----
  if (has(["취소", "변경", "수정", "cancel", "modify", "change my shipment", "edit shipment"])) {
    return isKo
      ? "배송 취소나 변경은 운송 진행 단계에 따라 가능 여부가 달라집니다 ✏️\n\n운송장 번호를 알려주시면 현재 상태를 확인하고 담당 상담원에게 연결해 드릴게요."
      : "Whether a shipment can be canceled or changed depends on how far along it is ✏️\n\nShare your tracking number and I'll check its status and connect you with an agent.";
  }

  // ---- 15. Create a new shipment ----
  if (has(["배송 생성", "배송 신청", "새 배송", "create shipment", "new shipment", "book a shipment", "ship something"])) {
    return isKo
      ? '새 배송은 상단 메뉴의 "배송 생성"에서 신청하실 수 있어요 📝\n\n화물 정보, 출발지, 도착지를 입력하시면 접수가 완료됩니다. 궁금한 점이 있으면 먼저 여기서 물어보셔도 좋아요.'
      : 'You can start a new shipment from "Create Shipment" in the menu 📝\n\nJust enter your cargo details, origin, and destination to submit it. Feel free to ask me anything first if you have questions.';
  }

  // ---- 16. Packaging / labeling ----
  if (has(["포장", "라벨", "packaging", "labeling", "pack", "how do i pack", "box"])) {
    return isKo
      ? "포장은 화물 종류에 따라 규정이 다릅니다 📦\n\n일반 화물은 견고한 상자와 완충재를, 차량·중장비는 별도 포장 없이 RoRo로 선적 가능합니다. 운송장 라벨은 접수 완료 후 이메일로 발송해 드려요. 화물 종류를 알려주시면 구체적으로 안내할게요."
      : "Packaging requirements depend on the cargo type 📦\n\nGeneral cargo needs a sturdy box and cushioning; vehicles and heavy machinery can go straight onto RoRo without extra packaging. Shipping labels are emailed once your shipment is confirmed. Tell me your cargo type for specifics.";
  }

  // ---- 17. Weight / volume / dimensions ----
  if (has(["무게", "부피", "치수", "사이즈", "weight limit", "dimensions", "how big", "max weight"])) {
    return isKo
      ? "화물의 무게와 부피 제한은 운송 방식에 따라 다릅니다 ⚖️\n\nFCL 컨테이너는 최대 약 28톤, LCL은 소량부터 가능하며 RoRo는 차량 크기 기준으로 계산됩니다. 정확한 치수와 무게를 알려주시면 어떤 서비스가 맞는지 안내해 드릴게요."
      : "Weight and volume limits depend on the shipping method ⚖️\n\nA full container (FCL) holds up to roughly 28 tons, LCL works for smaller loads, and RoRo is sized to the vehicle. Share the exact dimensions and weight and I can tell you which service fits.";
  }

  // ---- 18. Pickup / scheduling ----
  if (has(["픽업", "수거", "방문 수거", "pickup", "collection", "schedule a pickup"])) {
    return isKo
      ? "화물 픽업은 요청하신 주소에서 예약하실 수 있어요 🚛\n\n픽업 희망 날짜, 주소, 화물량을 알려주시면 담당 상담원이 일정을 확정해 드립니다."
      : "We can arrange pickup from your requested address 🚛\n\nShare your preferred date, address, and cargo volume and an agent will lock in the schedule.";
  }

  // ---- 19. Careers ----
  if (has(["채용", "구인", "입사", "careers", "job", "hiring", "work with you", "work for aol"])) {
    return isKo
      ? "채용 관련 문의는 감사합니다 🤝\n\n현재 채용 공고는 별도 채용 페이지에서 확인하실 수 있으며, 이력서는 📧 logisticsaol6@gmail.com 으로 보내주시면 담당 부서에서 검토해 드립니다."
      : "Thanks for your interest in joining us 🤝\n\nCurrent openings are listed on our careers page, and you can send your resume to 📧 logisticsaol6@gmail.com for the hiring team to review.";
  }

  // ---- 20. Website navigation ----
  if (has(["사이트맵", "메뉴", "네비게이션", "navigate", "sitemap", "find on the site", "where is"])) {
    return isKo
      ? "사이트 이용 안내해 드릴게요 🧭\n\n• 배송 추적 → 상단 메뉴 \"배송 추적\"\n• 배송 신청 → \"배송 생성\"\n• 서비스 상세 → 홈페이지 \"서비스\" 섹션\n• 문의 → 페이지 하단 \"연락처\" 양식\n\n찾으시는 페이지가 있으면 말씀해 주세요."
      : "Here's a quick map of the site 🧭\n\n• Track a shipment → \"Track Shipment\" in the menu\n• Start a shipment → \"Create Shipment\"\n• Service details → the \"Services\" section on the homepage\n• Reach us → the \"Contact\" form at the bottom of the page\n\nLet me know what you're looking for and I'll point you there.";
  }

  // ---- 21. Greetings ----
  if (has(["안녕", "hello", "hey", "반가워"]) || q === "hi") {
    return isKo
      ? "안녕하세요! 배송 추적 📦, 견적 요청 💰, 서비스 안내 🌍, 연락처 📞 중 무엇을 도와드릴까요?"
      : "Hello! How can I help — tracking 📦, a quote 💰, our services 🌍, or contact info 📞?";
  }

  // ---- 22. Thanks / goodbye ----
  if (has(["감사", "고마워", "thank", "thanks"])) {
    return isKo ? "천만에요! 더 필요한 게 있으면 언제든 말씀해 주세요 😊" : "You're welcome! Let me know if there's anything else you need 😊";
  }
  if (has(["안녕히", "잘가", "bye", "goodbye", "see you"])) {
    return isKo ? "이용해 주셔서 감사합니다! 좋은 하루 되세요 🚚" : "Thanks for stopping by! Have a great day 🚚";
  }

  // ---- 23. Contact / human agent ----
  if (has(["연락처", "전화", "이메일", "contact", "phone", "email", "상담원", "agent", "human", "사람", "talk to someone"])) {
    return isKo
      ? "언제든 연락 주세요 📞\n\n전화: +1 800 173 5507\n이메일: logisticsaol6@gmail.com\n\n지금 상담원과 연결해 드릴까요? 이 채팅창에 계속 메시지를 남겨주시면 상담원이 확인 후 직접 답변드립니다."
      : "Here's how to reach us 📞\n\nPhone: +1 800 173 5507\nEmail: logisticsaol6@gmail.com\n\nWant me to loop in a human agent? Keep chatting here and an agent can jump in anytime.";
  }

  // ---- 24. Fallback ----
  return isKo
    ? "문의 감사합니다! 다음 중 궁금하신 내용이 있으실까요?\n\n• 📦 배송 추적 (운송장 번호를 붙여넣어 보세요)\n• 💰 견적 요청\n• 🌍 서비스 / 산업 분야 안내\n• 📐 포장, 무게·부피, 픽업 일정\n• 🛡️ 보험, 파손, 통관 문의\n• 📞 연락처 / 상담원 연결\n\n원하시는 항목을 말씀해 주세요."
    : "Thanks for reaching out! I can help with:\n\n• 📦 Tracking (paste your tracking number)\n• 💰 Quotes\n• 🌍 Our services / industries\n• 📐 Packaging, weight & volume, pickup scheduling\n• 🛡️ Insurance, damage, or customs questions\n• 📞 Contact info / a human agent\n\nJust let me know which one you'd like.";
}

async function ensureSession() {
  if (sessionId) return sessionId;
  const { data, error } = await supabase.from("chat_sessions").insert([{ status: "bot" }]).select().single();
  if (error) {
    console.error("session error", error);
    return null;
  }
  sessionId = data.id;
  sessionStatus = data.status;
  window.__chatSessionStatus = sessionStatus;
  localStorage.setItem("aol_chat_session_id", sessionId);
  return sessionId;
}

async function loadHistory() {
  if (!sessionId) return;
  const { data: sessionRow } = await supabase.from("chat_sessions").select("*").eq("id", sessionId).maybeSingle();
  if (sessionRow) {
    sessionStatus = sessionRow.status;
    window.__chatSessionStatus = sessionStatus;
  }
  renderChatStatus();

  const { data: msgs, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });
  if (error) {
    console.error("history error", error);
    return;
  }
  body.innerHTML = "";
  renderedIds = new Set();
  (msgs || []).forEach((m) => {
    addBubble(m.sender, m.content);
    renderedIds.add(m.id);
  });
  scrollToBottom();
}

function subscribeRealtime() {
  if (channel || !sessionId) return;
  channel = supabase
    .channel(`chat-${sessionId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "chat_messages", filter: `session_id=eq.${sessionId}` },
      (payload) => {
        const m = payload.new;
        if (renderedIds.has(m.id)) return;
        renderedIds.add(m.id);
        hideTyping();
        addBubble(m.sender, m.content);
        scrollToBottom();
        if (m.sender !== "user" && !isOpen) {
          unread += 1;
          unreadBadge.textContent = String(unread);
          unreadBadge.classList.remove("hidden");
        }
      }
    )
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "chat_sessions", filter: `id=eq.${sessionId}` },
      (payload) => {
        sessionStatus = payload.new.status;
        window.__chatSessionStatus = sessionStatus;
        renderChatStatus();
      }
    )
    .subscribe();
}

async function openPanel() {
  isOpen = true;
  fab.classList.add("open");
  fab.setAttribute("aria-expanded", "true");
  panel.classList.add("open");
  unread = 0;
  unreadBadge.classList.add("hidden");

  await ensureSession();
  if (!sessionId) return;

  await loadHistory();
  if (body.children.length === 0) {
    addBubble("bot", cc().greeting);
    addQuickReplies(
      lang() === "ko"
        ? ["배송 추적", "견적 요청", "서비스 안내", "상담원 연결"]
        : ["Track a shipment", "Get a quote", "Our services", "Talk to an agent"]
    );
  }
  subscribeRealtime();
  scrollToBottom();
  input.focus();
}

function closePanel() {
  isOpen = false;
  fab.classList.remove("open");
  fab.setAttribute("aria-expanded", "false");
  panel.classList.remove("open");
}

if (fab) fab.addEventListener("click", () => (isOpen ? closePanel() : openPanel()));
if (closeBtn) closeBtn.addEventListener("click", closePanel);

if (input) {
  input.addEventListener("input", () => {
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight, 90) + "px";
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
}
if (sendBtn) sendBtn.addEventListener("click", sendMessage);

async function sendMessage() {
  const text = input.value.trim();
  if (!text) return;
  input.value = "";
  input.style.height = "auto";
  sendBtn.disabled = true;

  const qr = document.querySelector(".chat-quick-replies");
  if (qr) qr.remove();

  await ensureSession();
  if (!sessionId) {
    sendBtn.disabled = false;
    return;
  }
  subscribeRealtime();

  addBubble("user", text);
  scrollToBottom();

  try {
    const { data: inserted, error } = await supabase
      .from("chat_messages")
      .insert([{ session_id: sessionId, sender: "user", content: text }])
      .select()
      .single();
    if (error) throw error;
    if (inserted) renderedIds.add(inserted.id);

    // Only the bot answers here — if an admin has taken over
    // (sessionStatus === 'admin'), we stay silent and let the
    // admin panel's live reply come through the realtime
    // subscription above instead.
    if (sessionStatus !== "admin") {
      showTyping();
      const replyText = generateBotReply(text, lang());

      setTimeout(async () => {
        try {
          const { data: botMsg, error: botErr } = await supabase
            .from("chat_messages")
            .insert([{ session_id: sessionId, sender: "bot", content: replyText }])
            .select()
            .single();
          if (botErr) throw botErr;

          hideTyping();
          if (botMsg && !renderedIds.has(botMsg.id)) {
            renderedIds.add(botMsg.id);
            addBubble("bot", botMsg.content);
            scrollToBottom();
          }
        } catch (botInsertErr) {
          console.error("bot reply insert failed", botInsertErr);
          hideTyping();
          addBubble("bot", cc().sendError);
          scrollToBottom();
        }
      }, 500 + Math.random() * 500);
    }
  } catch (err) {
    console.error("send error", err);
    addBubble("bot", cc().sendError);
  } finally {
    sendBtn.disabled = false;
  }
}

renderChatStatus();
