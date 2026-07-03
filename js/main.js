/* =========================================================
   FIT ROOM · Santa Teresa — interactions
   ---------------------------------------------------------
   EDIT YOUR DETAILS HERE  ↓↓↓  (one place, used everywhere)
   ========================================================= */
const CONFIG = {
  // WhatsApp in full international format, digits only (no +, spaces or dashes).
  // Confirmed from the Santa Teresa flyer: "Reservation required at +506 7253-2299".
  whatsappNumber: "50670546982",            // +506 7054 6982
  whatsappDisplay: "+506 7054 6982",
  whatsappMessage: "Hi Fit Room! I'd love to book a class 🌿",
  instagram: "https://www.instagram.com/fitroom_santateresa",
};
/* ======================================================= */

(function () {
  "use strict";

  /* --- WhatsApp links --- */
  const waURL = "https://wa.me/" + CONFIG.whatsappNumber + "?text=" + encodeURIComponent(CONFIG.whatsappMessage);
  document.querySelectorAll(".js-whatsapp").forEach((el) => { el.href = waURL; el.target = "_blank"; el.rel = "noopener"; });
  document.querySelectorAll(".js-whatsapp-num").forEach((el) => { el.textContent = CONFIG.whatsappDisplay; });

  /* --- Sticky header + scroll progress --- */
  const header = document.getElementById("header");
  const bar = document.getElementById("scrollBar");
  const onScroll = () => {
    header.classList.toggle("scrolled", window.scrollY > 24);
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    if (bar) bar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + "%";
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* --- Mobile menu --- */
  const toggle = document.getElementById("navToggle");
  const menu = document.getElementById("mobileMenu");
  const setMenu = (open) => {
    menu.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  };
  toggle.addEventListener("click", () => setMenu(!menu.classList.contains("open")));
  menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));

  /* --- Hero line reveal (on load) --- */
  requestAnimationFrame(() => {
    document.querySelectorAll(".reveal-line").forEach((el) => el.classList.add("in"));
  });

  /* --- Count-up stats --- */
  const animateCount = (el) => {
    const target = parseInt(el.dataset.count, 10);
    if (isNaN(target)) return;
    const dur = 1400, start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  /* --- Reveal on scroll (+ trigger counters) --- */
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const sibs = [...e.target.parentElement.children].filter((c) => c.classList.contains("reveal"));
          const idx = sibs.indexOf(e.target);
          e.target.style.transitionDelay = (idx > 0 ? Math.min(idx, 6) * 0.07 : 0) + "s";
          e.target.classList.add("in");
          e.target.querySelectorAll("[data-count]").forEach(animateCount);
          io.unobserve(e.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -7% 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("in"));
    document.querySelectorAll("[data-count]").forEach((el) => (el.textContent = el.dataset.count));
  }

  /* --- Year --- */
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  /* --- Netlify form: AJAX submit --- */
  const form = document.querySelector('form[name="contact"]');
  const status = document.getElementById("formStatus");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(form);
      status.textContent = "Sending…";
      status.className = "form__status mono";
      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(data).toString(),
      })
        .then(() => {
          status.textContent = "Thank you — we'll be in touch very soon.";
          status.className = "form__status mono ok";
          form.reset();
        })
        .catch(() => {
          status.textContent = "Something went wrong — please WhatsApp us instead.";
          status.className = "form__status mono err";
        });
    });
  }
})();
