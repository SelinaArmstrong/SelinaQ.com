# Handoff — selinaq.com

Personal site for Selina Armstrong, a senior contract specialist looking for
contract operations / procurement / CLM roles. The design is finished and
committed. What is left is getting the commits off this machine and the
current build onto the live site.

Repo: `SelinaQ.com`, branch `main`, clean working
tree, **thirteen commits ahead of where anything has actually been
published**.

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

Plus `public/privacy/index.html`, and supporting files: `public/robots.txt`,
`public/sitemap.xml`, `public/Selina-Armstrong-Resume.pdf`, `public/assets/`
(two product screenshots, the Geist woff2 subset, the Open Graph card and the
favicons).

**Not deployed, and must not be:** `content/` (the master resume .docx),
`design/` (visual studies), `.claude/` (local preview config), `README.md`,
this file.

Local preview:

```
python3 -m http.server 8781 --directory public
```

---

## Task 1 — publish the current build

The live site is **behind this checkout by thirteen commits**. Everything in them
is design work that has been reviewed and verified locally; none of it is on
the web.

Deployment does **not** go through git. `wrangler.jsonc` publishes `./public`
as a Cloudflare Workers static-assets site:

```jsonc
{ "name": "selinaq-com", "assets": { "directory": "./public",
  "not_found_handling": "404-page" } }
```

So the live update is `npx wrangler deploy` from the repo root, after a
Cloudflare login. Neither wrangler nor any Cloudflare credential is present
on this machine — `wrangler --version` fails and there is no
`~/.config/.wrangler`. Ask the owner to authenticate; do not go looking for
their tokens.

After deploying, check the live site rather than trusting the command: the
hero, the two project screenshots, `/privacy/`, and a URL that does not exist
(it must serve `404.html`, which is what `not_found_handling` is for).

## Task 2 — the GitHub remote

`origin` is set to <https://github.com/SelinaArmstrong/SelinaQ.com.git> but
**that repository does not exist** — `git push` returns "Repository not
found", and `gh repo view` cannot resolve it. The local `origin/main` ref is
stale; nothing was ever pushed. The `gh` CLI here is authenticated as
**another GitHub account**, which is not the `SelinaArmstrong` account the remote names,
and has no related repository among its sixteen.

Two decisions belong to the owner, not to you:

- which account owns the repository, and whether it is public or private;
- whether `content/Selina-Armstrong-Resume-master.docx` ships with it. Its
  content is already public as a PDF on the site and the file carries no
  comments or tracked changes, so this is a choice rather than a leak — but
  it is the owner's choice.

Ask, then create the repository, fix the remote if the owner is different,
and push `main`.

## Task 3 — after each change

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

**The project screenshots are never cropped.** `.case-media.shot` takes
whatever height its image needs (`aspect-ratio: auto`, `height: auto`) and
nothing scales the image inside its frame. Two earlier versions did — a
fixed 16:10 frame with `object-fit: cover`, then a scroll-driven parallax at
`scale(1.09)` — and both shaved the navigation off one edge of the dashboard
and the buttons off the other. The screenshots are evidence that the products
exist; they are shown whole. Hover lifts the plane (`--lift-hi`) instead of
zooming the image.

**Alignment is a bookend.** The hero and the contact section are centred;
everything between them runs on one left spine. The hero is the title page
and the contact is the closing page — neither is a block of document being
read. `@media print` returns the contact block to the left, because the
centre line is a screen gesture.

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

- **No portrait.** The hero is typographic and ends on a hairline into the
  metrics. A hero band sat there through five versions — an AI render, a
  process diagram, a signature, a measure, a score — and all five were
  rejected before the element was removed as decoration that had no job. The
  space is deliberately held for a professional photograph, which is the one
  thing that belongs between a name that size and the figures under it, and
  the single change that would do most for the page.
- **The dark scheme is unverified by eye.** It still defines every colour
  token the light scheme does (26 of them; only the navy band's `--nv-*` set
  is shared on purpose, because that band is dark in both). It has not been
  looked at since the type, spacing, link and alignment work landed.
- `design/palettes/` is gitignored — it holds throwaway render comparisons.
