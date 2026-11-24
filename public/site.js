/* selinaq.com — motion & interaction
   Everything here is progressive enhancement: without JS the page is fully readable,
   and every motion effect is disabled under prefers-reduced-motion. */

const root = document.documentElement;
const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
const fine = window.matchMedia("(pointer: fine)");

/* ── entrance choreography ─────────────────────────────────────────── */
requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add("is-ready")));

/* ── scroll progress + sticky header ───────────────────────────────── */
const header = document.querySelector("#siteHeader");
const bar = document.querySelector(".progress i");
const parallax = [...document.querySelectorAll("[data-parallax]")];
let ticking = false;

function onScroll() {
  const y = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  if (bar) bar.style.setProperty("--p", max > 0 ? (y / max).toFixed(4) : 0);
  header.classList.toggle("is-stuck", y > 24);

  if (!calm.matches) {
    for (const el of parallax) {
      const rect = el.getBoundingClientRect();
      if (rect.bottom < -200 || rect.top > window.innerHeight + 200) continue;
      const rate = parseFloat(el.dataset.parallax) || 0.1;
      const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * rate;
      el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0) scale(1.06)`;
    }
  }
  sweep();
  sweepCounters();
  ticking = false;
}
window.addEventListener("scroll", () => {
  if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
}, { passive: true });
window.addEventListener("resize", () => { sweep(); sweepCounters(); }, { passive: true });

/* ── reveal on scroll ───────────────────────────────────────────────
   A plain scroll sweep rather than IntersectionObserver: an observer can
   miss elements that fly past between frames (fast flick scrolling, or an
   in-page anchor jump), which would leave them invisible for good. */
const pending = new Set(document.querySelectorAll(".reveal, .rail"));

function sweep() {
  if (!pending.size) return;
  const line = window.innerHeight * 0.88;
  for (const el of pending) {
    if (el.getBoundingClientRect().top < line) {
      el.classList.add("in");
      pending.delete(el);
    }
  }
}

/* ── metric counters ───────────────────────────────────────────────── */
const easeOut = (t) => 1 - Math.pow(1 - t, 3);

function countUp(el) {
  const target = parseFloat(el.dataset.count);
  const duration = parseInt(el.dataset.dur, 10) || 1000;
  if (calm.matches || !Number.isFinite(target)) { el.textContent = target; return; }
  const start = performance.now();
  const step = (now) => {
    const t = Math.min((now - start) / duration, 1);
    el.textContent = Math.round(target * easeOut(t));
    if (t < 1) requestAnimationFrame(step);
  };
  el.textContent = "0";
  requestAnimationFrame(step);
}

const counters = new Set(document.querySelectorAll("[data-count]"));

function sweepCounters() {
  if (!counters.size) return;
  const line = window.innerHeight * 0.85;
  for (const el of counters) {
    const rect = el.getBoundingClientRect();
    if (rect.top > line) continue;
    counters.delete(el);
    /* already scrolled past: show the final figure, don't animate */
    if (rect.bottom < 0) el.textContent = el.dataset.count;
    else countUp(el);
  }
}

/* ── active section in the nav ─────────────────────────────────────── */
const navLinks = [...document.querySelectorAll(".primary-nav a[href^='#']")];
const sections = navLinks
  .map((a) => document.querySelector(a.getAttribute("href")))
  .filter(Boolean);

if (sections.length) {
  const spy = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      navLinks.forEach((a) =>
        a.classList.toggle("is-active", a.getAttribute("href") === `#${entry.target.id}`));
    }
  }, { rootMargin: "-45% 0px -50% 0px" });
  sections.forEach((s) => spy.observe(s));
}

/* ── magnetic buttons ──────────────────────────────────────────────── */
if (fine.matches && !calm.matches) {
  document.querySelectorAll("[data-magnetic]").forEach((el) => {
    el.addEventListener("pointermove", (event) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${(event.clientX - r.left - r.width / 2) * 0.16}px`);
      el.style.setProperty("--my", `${(event.clientY - r.top - r.height / 2) * 0.26}px`);
    });
    el.addEventListener("pointerleave", () => {
      el.style.setProperty("--mx", "0px");
      el.style.setProperty("--my", "0px");
    });
  });

  /* ── pointer tilt on project media ───────────────────────────────── */
  document.querySelectorAll("[data-tilt]").forEach((el) => {
    el.addEventListener("pointermove", (event) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--rx", `${((event.clientX - r.left) / r.width - 0.5) * 3.2}deg`);
      el.style.setProperty("--ry", `${(0.5 - (event.clientY - r.top) / r.height) * 2.4}deg`);
    });
    el.addEventListener("pointerleave", () => {
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
    });
  });
}

/* ── copy email ────────────────────────────────────────────────────── */
const copyStatus = document.querySelector("#copyStatus");

document.querySelectorAll("[data-copy]").forEach((button) => {
  const label = button.querySelector(".copy-text");
  button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(button.dataset.copy);
      button.classList.add("done");
      if (label) label.textContent = "Copied";
      if (copyStatus) copyStatus.textContent = `${button.dataset.copy} copied to clipboard`;
      setTimeout(() => {
        button.classList.remove("done");
        if (label) label.textContent = "Copy";
        if (copyStatus) copyStatus.textContent = "";
      }, 2000);
    } catch {
      window.location.href = `mailto:${button.dataset.copy}`;
    }
  });
});

/* ── mobile navigation ─────────────────────────────────────────────── */
const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#primary-nav");
const mobile = window.matchMedia("(max-width: 760px)");

if (menuButton && navigation) {
  const close = () => menuButton.setAttribute("aria-expanded", "false");
  menuButton.hidden = false;
  menuButton.addEventListener("click", () => {
    const open = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!open));
  });
  navigation.addEventListener("click", (event) => {
    if (mobile.matches && event.target.closest("a")) close();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
      close();
      menuButton.focus();
    }
  });
  mobile.addEventListener("change", close);
}

/* ── first pass ────────────────────────────────────────────────────── */
onScroll();
window.addEventListener("load", onScroll);
