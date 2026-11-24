# Handoff — selinaq.com

Personal site for Selina Armstrong, a senior contract specialist looking for
contract operations / procurement / CLM roles. The site is finished and
committed. What is left is analytics and getting it online.

Repo: `SelinaQ.com`, branch `main`, 9 commits, clean
working tree, **no git remote configured yet**.

---

## What this is

Static site. No framework, no build step, no dependencies, no package.json.
Four files do the work:

| File | Role |
| --- | --- |
| `public/index.html` | the whole page, one document |
| `public/styles.css` | every style; all colour comes from tokens in `:root` |
| `public/site.js` | motion and interaction, progressive enhancement |
| `public/404.html` | not-found page, same design |

Supporting: `public/robots.txt`, `public/sitemap.xml`,
`public/Selina-Armstrong-Resume.pdf`, `public/assets/` (images, the Geist
woff2 subset, monogram, Open Graph card).

**Not deployed, and must not be:** `content/` (the master resume .docx),
`design/` (visual studies), `.claude/` (local preview config), `README.md`,
this file.

Local preview:

```
python3 -m http.server 8781 --directory public
```

---

## Task 1 — GA4

`public/index.html` has a commented block at the very end of `<head>`:

```html
<!-- Analytics. GA4 goes here: swap G-XXXXXXXXXX for the measurement ID and
     uncomment. ... -->
```

Replace both occurrences of `G-XXXXXXXXXX` with the real measurement ID and
uncomment. Keep it last in `<head>` and keep `async`. Nothing else on the page
depends on it.

One consequence to handle, not to ignore: the site currently loads **no**
third-party script and sets no cookie. Adding GA4 changes that. Check whether
a cookie notice is wanted before shipping it, or configure GA4 in a
cookieless / consent-mode setup. Ask the owner; do not decide silently.

## Task 2 — Deploy

No host is chosen and no platform config exists. Pick one with the owner, then:

- **Publish directory is `public/`, never the repo root.** Publishing the root
  would put the master resume .docx and the design studies on the web.
- Custom domain `selinaq.com`, HTTPS on, `www` redirecting to apex (or the
  reverse — just be consistent with what `<link rel="canonical">` already says:
  `https://selinaq.com/`).
- `404.html` is served as the not-found page by GitHub Pages, Netlify,
  Cloudflare Pages and Vercel without extra config; verify it actually fires.
- On GitHub Pages a custom domain needs a `CNAME` file inside `public/`.
- README has a per-host table with the publish-directory setting.

## Task 3 — Git remote

The owner wants the repository at
<https://github.com/SelinaArmstrong/SelinaQ.com>. It does not exist yet as far
as this checkout knows. Create it, add the remote, push `main`.

If the repo is public, note that `content/Selina-Armstrong-Resume-master.docx`
goes public with it. Its content is already published as a PDF on the site and
the file carries no comments or tracked changes, so this is a choice, not a
leak — but confirm it is the choice the owner wants.

## Task 4 — after each change

- `sitemap.xml` `<lastmod>` is maintained by hand. Update it when the page
  changes meaningfully.
- If the name, title or palette changes, regenerate the Open Graph card
  `public/assets/selina-armstrong.jpg` (1200×630). It is rendered from an HTML
  template, not photographed.

---

## Invariants — please do not undo these

Each of these is the result of a specific fix. Breaking one silently
reintroduces a bug that was found and solved.

**Colour.** `styles.css` hard-codes no colour outside the `:root` block. Base
hues are stored as space-separated RGB channels (`--bg-rgb`, `--ac-rgb`,
`--hl-rgb`) so alpha variants mix inline with `rgb(var(--x) / .18)`. The light
scheme is the default; the dark one survives under `[data-theme="dark"]` on
`<html>`. Two accents with distinct jobs: slate (`--ac*`) for structure —
labels, numerals, hairlines — and azure (`--hl*`) for anything you can press,
follow or track. Add a colour by adding a token, not a literal.

**Contrast.** Every text colour meets WCAG AA on every surface it sits on.
`--text-3` (`#5C6878`) is the lightest colour used for real text — 4.8:1 on the
darkest light surface. Do not go dimmer. The inverted navy band
(`.experience`) re-declares the whole token set in its own scope; if you touch
it, re-check the numbers there too.

**Scrolling.** The scroll handler in `site.js` does arithmetic only. It reads
no layout. Positions are measured in `measure()` on load, resize and font
swap. An earlier version called `getBoundingClientRect()` for every pending
element on every frame and the page stuttered badly through its upper middle.
If you need a new scroll effect, cache its geometry the same way.

Related: the page's ambient gradient is its own fixed layer (`.field`), not
`background-attachment: fixed` on `body`, which repainted the whole page per
frame. The grain overlay carries no `mix-blend-mode` for the same reason.

**Reveals.** An IntersectionObserver reveals elements, and a sweep runs 120ms
after scrolling settles to catch anything that flew past between frames. Both
are needed: the observer alone misses flick scrolls and anchor jumps, which
leaves content invisible for good.

**Motion.** Everything is `transform`/`opacity` and everything is switched off
under `prefers-reduced-motion: reduce`. Two effects need explicit handling
there because their resting state is wrong when the animation is removed: the
redline sweep across the name (`.display::after`) and the masked heading lines
(`.split .line > span`). Both are also reset in `@media print`.

**Print.** `@media print` gives the dark-on-light design a light print palette.
It must reset the inverted navy band or that section prints white on white, and
it must reset the masked heading lines or unscrolled headings print blank. A
`beforeprint` handler finalises any running counter. Verify print changes by
rendering, not by reading: `chrome --headless --print-to-pdf`.

**Headings.** `splitHeadings()` wraps each `<br>`-separated segment in a masked
line. If a segment wraps at the current width the mask would clip it, so that
heading is restored exactly as authored, and the check reruns on resize. Keep
the fallback.

**Copy.** `content/Selina-Armstrong-Resume-master.docx` is the baseline for
every claim on the page — the figures, the counterparty names, the capability
terms. Do not invent or soften anything; if the master changes, re-check the
hero line, the metrics, Capabilities, the timeline bullets and the project
tags against it. Accented characters were removed deliberately: the word is
"resume", not "résumé".

**Accessibility.** Mobile nav is a sheet with a focus trap, scroll lock,
Escape to close, and a real text label on the toggle (a CSS-generated label
left the button with no accessible name — that was a bug, not a style
choice). Keep `aria-expanded` in sync with the open state.

---

## Known open items (not blocking)

- **No portrait.** The hero is typographic. A professional photo would help a
  recruiter trust the page faster; the layout has room for it.
- `design/palettes/` is gitignored — it holds throwaway render comparisons.
