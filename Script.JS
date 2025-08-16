/* ========== Utilities ========== */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

/* ========== Theme (dark / light with persistence) ========== */
(function initTheme() {
  const root = document.documentElement;
  const stored = localStorage.getItem("theme");
  const prefersLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
  if (stored === "light" || (!stored && prefersLight)) root.classList.add("light");

  $("#theme-toggle").addEventListener("click", () => {
    root.classList.toggle("light");
    localStorage.setItem("theme", root.classList.contains("light") ? "light" : "dark");
  });
})();

/* ========== Mobile nav toggle ========== */
(function initNav() {
  const btn = $(".nav-toggle");
  const nav = $("#primary-nav");
  if (!btn || !nav) return;
  btn.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    btn.setAttribute("aria-expanded", String(open));
  });
  // Close on link click (mobile)
  $$(".nav-link").forEach(a => a.addEventListener("click", () => nav.classList.remove("open")));
})();

/* ========== Sticky header shadow on scroll ========== */
(function elevateHeader() {
  const header = $(".site-header");
  const set = () => {
    const scrolled = window.scrollY > 4;
    header && header.toggleAttribute("data-elevate", scrolled);
    if (scrolled) header.style.boxShadow = "var(--shadow)"; else header.style.boxShadow = "none";
  };
  set();
  window.addEventListener("scroll", set, { passive: true });
})();

/* ========== Reveal-on-scroll using IntersectionObserver ========== */
(function revealOnScroll() {
  const items = $$(".reveal");
  const onIntersect = (entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      }
    });
  };
  const io = new IntersectionObserver(onIntersect, { threshold: 0.14 });
  items.forEach(el => io.observe(el));
})();

/* ========== Smooth scroll for same-page anchors ========== */
(function smoothScroll() {
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href").slice(1);
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    history.pushState(null, "", `#${id}`);
  });
})();

/* ========== Contact form validation (client-side) ========== */
(function contactForm() {
  const form = $("#contact-form");
  if (!form) return;
  const fields = {
    name: { required: true, test: v => v.trim().length >= 2 || "Please enter your name." },
    email: { required: true, test: v => /\S+@\S+\.\S+/.test(v) || "Please enter a valid email." },
    budget: { required: true, test: v => !!v || "Select a budget." },
    message: { required: true, test: v => v.trim().length >= 20 || "Tell us more (min 20 chars)." },
    consent: { required: true, test: () => form.elements.consent.checked || "Please accept the policy." }
  };

  const showError = (el, msg) => {
    const small = el.closest("label")?.querySelector(".error") || el.parentElement.querySelector(".error");
    if (small) small.textContent = msg || "";
    el.setAttribute("aria-invalid", msg ? "true" : "false");
  };

  const validateField = (name) => {
    const def = fields[name];
    const el = form.elements[name];
    if (!def || !el) return true;
    const value = (el.type === "checkbox") ? el.checked : el.value;
    const result = def.test(String(value));
    const ok = result === true;
    showError(el, ok ? "" : result);
    return ok;
  };

  // Live validation
  Object.keys(fields).forEach((name) => {
    const el = form.elements[name];
    if (!el) return;
    const evt = el.type === "checkbox" ? "change" : "input";
    el.addEventListener(evt, () => validateField(name));
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const allOk = Object.keys(fields).every(validateField);
    if (!allOk) return;

    // Fake async submit (replace with your endpoint / fetch)
    await new Promise((r) => setTimeout(r, 650));
    form.reset();
    const success = $(".form__success", form);
    if (success) {
      success.hidden = false;
      success.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => (success.hidden = true), 5000);
    }
  });
})();

/* ========== Newsletter mini-form ========== */
(function newsletter() {
  const form = $(".newsletter");
  if (!form) return;
  const email = form.querySelector('input[name="nl-email"]');
  const note = form.querySelector(".note");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!/\S+@\S+\.\S+/.test(email.value)) {
      email.setCustomValidity("Please use a valid email.");
      email.reportValidity();
      return;
    }
    email.setCustomValidity("");
    email.value = "";
    note.hidden = false;
    setTimeout(() => (note.hidden = true), 3500);
  });
})();

/* ========== Year in footer ========== */
$("#year").textContent = new Date().getFullYear();
