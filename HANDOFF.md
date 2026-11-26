# Handoff — selinaq.com

The repository contains the production assets for Selina Armstrong's portfolio
alongside design studies and these maintainer notes.
See the [README](README.md) for local preview and release commands.

## Release checks

- Wrangler serves `public/`. Check the homepage, both project screenshots,
  the resume download, `/privacy/` and the HTTP status and body of a missing URL.
- Check the connected repository and branch in Cloudflare before a release
  through Workers Builds. A local tracking branch can be stale.
- The published resume PDF carries personal contact details on purpose: the
  page links it as a download, so it is public by design. The editable master
  is not in this repository and not in its history. Both were checked before
  this repository was opened; re-check if either file is replaced.
- Update `sitemap.xml` when a page changes meaningfully. Render the Open Graph
  card from `design/og-card.html` if the name, title or palette changes.

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

**There is no navy.** The Trajectory band used to be a saturated #122C5C,
which made it the most chromatic area on a page whose blue is otherwise a thin
accent — a second brand rather than a second surface, fighting the navy
AsylumCompass screenshot directly above it. The band is now the page's own ink
used as a surface, a cool slate (`--nv-bg-a/b`). Everything else on that plane
is the "on dark" ramp, defined once at `:root` as `--nv-*` and **aliased by
`[data-theme="dark"]`** — a dark band in a light theme and the dark theme are
the same situation, so they share one set of values and cannot drift. The
favicons and the Open Graph card follow the same palette; if you change the
accent, regenerate both (`design/og-card.html` carries its command).

**The foot is the masthead again, literally.** The lockup in the foot is the
same `.identity` element under the same rules as the one in the head, down to
hiding the title at the same width, and both point at `#top`. No arrow, no
"Back to top" link: one gesture, one control, in two places.

Height carries the other half of that relationship. The masthead is one
`--head-h`; the foot is two, one band for the lockup and its links and one for
the colophon, each the same height as the bar at the top of the page. Under
760px it becomes three rows — lockup, links, colophon — still one masthead
each. The bands are equal by construction, not by paddings that happen to add
up, so do not replace the `min-height` with padding.

**So is everything else the page draws with.** Icon size, hairline and rule
weights, control heights, the bullet and the timeline node, the rail indent,
the page gutter and the title page's four fluid steps are all tokens in
`:root`. Three relationships are stated in CSS rather than left to match by
coincidence, and they are the ones to preserve: the sticky section heading
clears the masthead (`calc(var(--head-h) + var(--s-7))`), the full-bleed mobile
sheet pads to the same `--gutter` the shell leaves, and the menu mark's cross
is derived from the bar height and the gap between the bars rather than
measured off them. Nothing in the body of the file sets a colour, a type value,
a duration or a design length as a literal.

**Motion is tokenised too.** Six durations in `:root` (`--m-snap` through
`--m-draw`), chosen by what is moving, plus `--m-step` for a stagger and
`--m-lag` for the beat before a sequence. Twenty-three ad-hoc durations had
accumulated before that. One rule governs the pairs: a thing leaves faster
than it arrives. In CSS that means **every entry delay and entry duration
sits on the open state**, never on the base rule — the mobile sheet relies
on this, so removing `.nav-open` makes everything leave at once with no
stagger. Reversing an entrance is not an exit.

**Pointer effects never measure inside the handler.** `trackPointer()` in
`site.js` reads the element's box when the pointer arrives, re-reads only if
`geomTick` says the page has moved under it, and folds the write into the
next frame. The magnetic buttons, the capability cards and the project tilt
all go through it. Calling `getBoundingClientRect()` per `pointermove` forces
a layout several times per frame on a 240Hz mouse; that was the same mistake
the scroll handler was rebuilt to avoid.

**Scrolling.** The scroll handler in `site.js` does arithmetic only. It reads
no layout. Positions are measured in `measure()` on load, resize and font
swap. An earlier version called `getBoundingClientRect()` for every pending
element on every frame and the page stuttered badly through its upper middle.
If you need a new scroll effect, cache its geometry the same way.

Related: the page's ambient gradient is its own fixed layer (`.field`), not
`background-attachment: fixed` on `body`, which repainted the whole page per
frame. The grain overlay carries no `mix-blend-mode` for the same reason.

**Both project screenshots are captured at one viewport.** The frames take
whatever height their image needs, so two captures at different viewports
produce two frames of different heights side by side in the same section —
which is what the page had. Equal heights come from equal captures, not from a
CSS crop. `design/capture-shots.sh` recaptures both at the same viewport; use
it rather than shooting one of them by hand, and update the `width`/`height`
attributes and the alt text if the delivered size or the product changes.

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

**Copy.** The owner's editable resume master is the baseline for
every claim on the page — the figures, the counterparty names, the capability
terms. Do not invent or soften anything; if the master changes, re-check the
hero line, the metrics, Capabilities, the timeline bullets and the project
tags against it. Accented characters were removed deliberately: the word is
"resume", not "résumé".

The shipped PDF, `public/Selina-Armstrong-Resume.pdf`, was replaced on
25 November 2026 from the owner's current export, whose contact line carries
`selinaq.com`. Nothing on the page needed changing: every figure, counterparty
and date in that export matches what was already there.

The editable master is **deliberately not in this repository** and never has
been in its history — it is the owner's file, kept off the public record by
`.gitignore`. The shipped PDF is the only resume this repository carries, and
it is the one the page links. Ask the owner for the current master before
treating any local copy as authoritative.

**Caching is split three ways, and one dashboard switch can undo all of
it.** `public/_headers` gives the font a year, the regenerated images a
week, the stylesheet and script an hour, and leaves every HTML page on the
Workers default so content changes are live on deploy. None of it applies
unless Cloudflare's **Browser Cache TTL stays on "Respect Existing
Headers"** — it was set to 4 hours once, which silently overrode
everything. If caching looks wrong, check that switch before the file.

The images get a week rather than a year on purpose: `capture-shots.sh`
and `og-card.html` both overwrite in place, so a year-long `immutable`
would strand returning visitors on a stale screenshot. The font is the
only asset that may carry `immutable`, because a different subset would
be a different file.

`X-Content-Type-Options` is not in `_headers`. The zone already sends it
via the HSTS no-sniff option; adding it here would emit it twice. There is
deliberately no Content-Security-Policy: the page carries inline analytics
and inline JSON-LD, and static assets cannot issue a per-response nonce, so
a policy here would need `unsafe-inline` and would assert more than it
enforces.

**Accessibility.** Mobile nav is a sheet with a focus trap, scroll lock,
Escape to close, and `aria-expanded` kept in sync. The toggle's visible word
turns over in CSS with both words in the box, so it is decorative and
`aria-hidden`; the accessible name is an `aria-label` that JS updates. A
button whose name comes only from a moving part is a button a screen reader
cannot describe — an earlier CSS-generated label left it with no name at all.

Inside the sheet, `.primary-nav a:not(.btn)` matters: without the `:not`,
the generic nav-link colour out-specified `.btn-primary` and painted the
white-on-blue email button in `--text-2`, at 2.0:1.

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
