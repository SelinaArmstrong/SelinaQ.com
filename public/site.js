/* selinaq.com — motion & interaction
   Progressive enhancement: without JS the page is fully readable, and every
   motion effect is switched off under prefers-reduced-motion.

   Scrolling is the hot path, so nothing inside it reads layout. Positions are
   measured once (and again on resize, load and font swap); the scroll handler
   only does arithmetic. */

const root = document.documentElement;
const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
const fine = window.matchMedia("(pointer: fine)");
const mobile = window.matchMedia("(max-width: 760px)");
const clamp01 = (n) => (n < 0 ? 0 : n > 1 ? 1 : n);

/* ── entrance choreography ─────────────────────────────────────────── */
requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add("is-ready")));

/* ── cached page metrics ───────────────────────────────────────────── */
const header = document.querySelector("#siteHeader");
const bar = document.querySelector(".progress i");
const rail = document.querySelector(".rail");
const heroCopy = document.querySelector(".hero-copy");

let viewportH = window.innerHeight;
let maxScroll = 1;
let railTop = 0;
let railHeight = 1;

/* Bumped whenever anything can have moved on screen. Pointer effects use
   it to know when a cached element box has gone stale, which lets them
   measure once instead of once per event. */
let geomTick = 0;

function measure() {
  geomTick++;
  viewportH = window.innerHeight;
  maxScroll = Math.max(root.scrollHeight - viewportH, 1);

  if (rail) {
    const r = rail.getBoundingClientRect();
    railTop = r.top + window.scrollY;
    railHeight = Math.max(r.height, 1);
  }
}

/* ── scroll handler: arithmetic only ─────────────────────────────────
   Two of the three values below spend most of the page clamped at an
   end stop: the rail is full once you are past the timeline, the hero
   has finished drifting after the first screen. Writing the same string
   again still invalidates style, so each write is guarded on the value
   having actually changed. Most frames now write once, not three times. */
let ticking = false;
let lastRail = "";
let lastDrift = "";

function onScroll() {
  ticking = false;
  geomTick++;
  const y = window.scrollY;

  if (bar) bar.style.setProperty("--p", (y / maxScroll).toFixed(4));
  if (!root.classList.contains("nav-open")) header.classList.toggle("is-stuck", y > 24);
  if (calm.matches) return;

  /* the timeline is drawn at the pace you read it */
  if (rail) {
    const value = clamp01((y + viewportH * 0.62 - railTop) / railHeight).toFixed(3);
    if (value !== lastRail) {
      rail.style.setProperty("--rail", value);
      lastRail = value;
    }
  }

  /* the hero leaves at its own pace — it drifts, it does not dissolve */
  if (heroCopy) {
    const drift = (clamp01(y / (viewportH * 0.9)) * -64).toFixed(1);
    if (drift !== lastDrift) {
      heroCopy.style.transform = `translate3d(0, ${drift}px, 0)`;
      lastDrift = drift;
    }
  }
}

function requestTick() {
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(onScroll);
  }
}
window.addEventListener("scroll", requestTick, { passive: true });

/* ── reveal on scroll ───────────────────────────────────────────────
   An observer does the work, because it costs nothing per frame. A sweep
   runs once after scrolling settles to catch anything that flew past
   between frames — a flick scroll, or an in-page anchor jump. */
const pending = new Set(document.querySelectorAll(".reveal"));
const counters = new Set(document.querySelectorAll("[data-count]"));
const easeOut = (t) => 1 - Math.pow(1 - t, 3);

function reveal(el) {
  el.classList.add("in");
  pending.delete(el);
  watcher.unobserve(el);
}

function countUp(el) {
  const target = parseFloat(el.dataset.count);
  const duration = parseInt(el.dataset.dur, 10) || 1000;
  counters.delete(el);
  countWatcher.unobserve(el);
  if (calm.matches || !Number.isFinite(target)) {
    el.textContent = target;
    return;
  }
  const start = performance.now();
  const step = (now) => {
    const t = Math.min((now - start) / duration, 1);
    el.textContent = Math.round(target * easeOut(t));
    if (t < 1) requestAnimationFrame(step);
  };
  el.textContent = "0";
  requestAnimationFrame(step);
}

const watcher = new IntersectionObserver((entries) => {
  for (const entry of entries) if (entry.isIntersecting) reveal(entry.target);
}, { rootMargin: "0px 0px -8% 0px" });

const countWatcher = new IntersectionObserver((entries) => {
  for (const entry of entries) if (entry.isIntersecting) countUp(entry.target);
}, { threshold: 0.5 });

pending.forEach((el) => watcher.observe(el));
counters.forEach((el) => countWatcher.observe(el));

function sweep() {
  if (pending.size) {
    const line = viewportH * 0.92;
    for (const el of [...pending]) {
      if (el.getBoundingClientRect().top < line) reveal(el);
    }
  }
  if (counters.size) {
    const line = viewportH * 0.85;
    for (const el of [...counters]) {
      const rect = el.getBoundingClientRect();
      if (rect.top > line) continue;
      if (rect.bottom < 0) {
        counters.delete(el);
        countWatcher.unobserve(el);
        el.textContent = el.dataset.count;   /* scrolled past already: no animation */
      } else {
        countUp(el);
      }
    }
  }
}

let settleTimer;
window.addEventListener("scroll", () => {
  clearTimeout(settleTimer);
  settleTimer = setTimeout(sweep, 120);
}, { passive: true });

/* ── headings arrive line by line ───────────────────────────────────
   Each <br>-separated segment becomes its own masked line. If a segment
   wraps at the current width the mask would clip it, so that heading is
   put back exactly as authored. Re-checked on resize. */
const headings = [...document.querySelectorAll(".sec-head h2, .exp-head h2, .contact h2")]
  .map((el) => ({ el, html: el.innerHTML }));

function splitHeadings() {
  for (const { el, html } of headings) {
    el.innerHTML = html;
    el.classList.remove("split");
    if (calm.matches) continue;

    const parts = html.split(/<br\s*\/?>/i);
    el.innerHTML = parts
      .map((part, i) => `<span class="line"><span style="--l:${i}">${part}</span></span>`)
      .join("");
    el.classList.add("split");

    const lineHeight = parseFloat(getComputedStyle(el).lineHeight);
    const clipped = [...el.querySelectorAll(".line")]
      .some((line) => line.getBoundingClientRect().height > lineHeight * 1.45);
    if (clipped) {
      el.innerHTML = html;
      el.classList.remove("split");
    }
  }
}

/* ── re-measure whenever the page can have changed shape ───────────── */
let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    splitHeadings();
    measure();
    sweep();
    onScroll();
  }, 160);
}, { passive: true });

/* printing mid-count would put a half-finished figure on paper */
window.addEventListener("beforeprint", () => {
  for (const el of document.querySelectorAll("[data-count]")) {
    el.textContent = el.dataset.count;
    counters.delete(el);
  }
});

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

/* ── pointer flourishes (fine pointers only) ─────────────────────────
   Pointer events arrive faster than frames — a 120 or 240Hz mouse fires
   several times between paints — so measuring the element inside the
   handler forces a layout on every one of them. That is the same mistake
   the scroll handler was rebuilt to avoid, and it was still here.

   The element's box is read once, when the pointer arrives, and again
   only if the geometry has moved under it. The write is folded into the
   next frame, so a burst of twelve events costs one style write, not
   twelve layouts. */
function trackPointer(el, write, leave) {
  let box = null;
  let readAt = -1;
  let px = 0;
  let py = 0;
  let queued = false;

  const read = () => {
    box = el.getBoundingClientRect();
    readAt = geomTick;
  };
  const flush = () => {
    queued = false;
    if (box) write(el, px - box.left, py - box.top, box);
  };

  el.addEventListener("pointerenter", read);
  el.addEventListener("pointermove", (event) => {
    if (!box || readAt !== geomTick) read();
    px = event.clientX;
    py = event.clientY;
    if (!queued) {
      queued = true;
      requestAnimationFrame(flush);
    }
  });
  el.addEventListener("pointerleave", () => {
    box = null;
    if (leave) leave(el);
  });
}

if (fine.matches && !calm.matches) {
  document.querySelectorAll("[data-magnetic]").forEach((el) => {
    trackPointer(el, (node, x, y, box) => {
      node.style.setProperty("--mx", `${(x - box.width / 2) * 0.16}px`);
      node.style.setProperty("--my", `${(y - box.height / 2) * 0.26}px`);
    }, (node) => {
      node.style.setProperty("--mx", "0px");
      node.style.setProperty("--my", "0px");
    });
  });

  document.querySelectorAll(".cap").forEach((el) => {
    trackPointer(el, (node, x, y) => {
      node.style.setProperty("--px", `${x}px`);
      node.style.setProperty("--py", `${y}px`);
    });
  });

  document.querySelectorAll("[data-tilt]").forEach((el) => {
    trackPointer(el, (node, x, y, box) => {
      node.style.setProperty("--rx", `${(x / box.width - 0.5) * 3.2}deg`);
      node.style.setProperty("--ry", `${(0.5 - y / box.height) * 2.4}deg`);
    }, (node) => {
      node.style.setProperty("--rx", "0deg");
      node.style.setProperty("--ry", "0deg");
    });
  });
}

/* ── mobile navigation ─────────────────────────────────────────────
   A full sheet rather than a few links crammed under the masthead:
   large targets, the page behind it held still, focus kept inside, and
   Escape or any link closes it. */
const menuButton = document.querySelector(".menu-toggle");
const sheet = document.querySelector("#primary-nav");

if (menuButton && sheet) {
  let lastFocus = null;
  const isOpen = () => menuButton.getAttribute("aria-expanded") === "true";

  /* The visible word turns over in CSS, with both words in the box so the
     button cannot change width. That makes the label decorative, so the
     accessible name is carried by aria-label — a button whose name comes
     only from a moving part is a button screen readers cannot describe. */
  let lockedY = 0;

  const setOpen = (open) => {
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Close the menu" : "Open the menu");

    /* Hold the page exactly where it was. Clipping it with overflow:hidden
       lets the browser clamp the scroll position, and the few pixels it
       moves are visible as a jolt behind the sheet. */
    if (open) {
      lockedY = window.scrollY;
      root.classList.add("nav-open");
      document.body.style.top = `-${lockedY}px`;
    } else {
      root.classList.remove("nav-open");
      document.body.style.top = "";
      window.scrollTo(0, lockedY);
    }
    /* Focus stays on the toggle, which is the first stop in the trap below:
       moving it into the sheet while the sheet is still visibility:hidden is
       a silent no-op, and jumping the caret is jarring either way. */
    if (open) {
      lastFocus = document.activeElement;
    } else if (lastFocus) {
      lastFocus.focus({ preventScroll: true });
      lastFocus = null;
    }
  };

  /* Crossing out of the mobile breakpoint with the sheet open has to run
     the real close, not just drop the class: the scroll lock pins the body
     with a negative top, and leaving that behind strands the page. */
  const syncToViewport = () => {
    menuButton.hidden = !mobile.matches;
    if (!mobile.matches && isOpen()) setOpen(false);
  };

  syncToViewport();
  mobile.addEventListener("change", syncToViewport);
  menuButton.addEventListener("click", () => setOpen(!isOpen()));

  sheet.addEventListener("click", (event) => {
    if (mobile.matches && event.target.closest("a")) setOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (!isOpen()) return;
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = [menuButton, ...sheet.querySelectorAll("a, button")];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
}

/* ── first pass ────────────────────────────────────────────────────── */
splitHeadings();
measure();
onScroll();
sweep();

window.addEventListener("load", () => { measure(); onScroll(); sweep(); });
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => { measure(); onScroll(); });
}
