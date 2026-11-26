# selinaq.com

<https://selinaq.com/>

Personal site for Selina Armstrong — Senior Contract Specialist.
Static, hand-built: no framework, no build step, no dependencies.

## Layout

```
public/          ← the deploy root. Everything that ships lives here.
  index.html
  styles.css
  site.js
  404.html
  privacy/       ← privacy policy
  robots.txt
  sitemap.xml
  Selina-Armstrong-Resume.pdf
  assets/        ← screenshots, the Geist woff2 subset, the favicons, OG card
design/          ← visual-direction studies, the Open Graph card template
                   and capture-shots.sh. NOT deployed.
.claude/         ← local preview config for Claude Code. NOT deployed.
```

## Local preview

```
python3 -m http.server 8781 --bind 127.0.0.1 --directory public
```

Then open <http://localhost:8781/>.

## Deploying

`npx wrangler deploy --dry-run` checks the Worker configuration locally.
Use `npx wrangler dev --local` to test routing and the custom 404.
For an authorized release, `npx wrangler deploy` publishes the site.
If using Workers Builds, leave the build command empty and use the same
deploy command. Check the connected repository and branch in Cloudflare
before relying on a push to trigger a release.

`wrangler.jsonc` publishes only `public/` and serves `404.html` with HTTP 404.
The production hostname is `https://selinaq.com/`. The Cloudflare dashboard
manages the custom domain and redirects `www.selinaq.com` to the apex.

## Analytics

The homepage loads the Google tag asynchronously on the production hostname
`selinaq.com`. The GA4 stream uses first-party analytics cookies.
The footer links to the privacy policy at `/privacy/`.

## Things to keep in sync by hand

- `sitemap.xml` — `<lastmod>` when the page changes meaningfully.
- `assets/selina-armstrong.jpg` — the 1200×630 Open Graph card. It is rendered
  from `design/og-card.html`, which carries the command; regenerate it if the
  name, title or palette changes.
- `assets/contractledger-dashboard.webp`, `asylumcompass-home.webp` — both are
  captured at the same viewport by `design/capture-shots.sh`. The frames on the
  page take the image's own height, so equal heights depend on equal captures.
- `assets/favicon-32.png`, `favicon-64.png`, `apple-touch-icon.png` — the mark
  is the Geist "S", white on azure, full bleed. Each size is rendered natively
  rather than downscaled from one master, so the small ones stay crisp.
- `Selina-Armstrong-Resume.pdf` — the approved export. Its editable master is
  deliberately not in this repository (see `.gitignore`); it lives on the
  owner's disk. Check the hero, metrics, capabilities, timeline and project
  tags against each new export.

## Accessibility and motion

- The page respects `prefers-reduced-motion: reduce`. Check text contrast
  against both the default light surfaces and the dark experience section.
- The page is fully readable with JavaScript disabled.
- `@media print` gives the dark theme a light print palette; check it after
  layout changes.

## Licence

Two sets of terms, because this repository is not only code. See
[LICENSE](LICENSE) for the authoritative wording.

- **Code** — the markup, `styles.css`, `site.js`, the Wrangler config and the
  `design/` scripts are MIT. Take them, learn from them, ship them.
- **Content** — the written copy, the photograph, the two product
  screenshots, the favicons and the published resume PDF are all rights
  reserved. The name "Selina Armstrong" and
  the wordmark built from it are not licensed either.
- **Geist** — the typeface in `public/assets/fonts/` is third-party, under
  the SIL Open Font License 1.1. Its licence sits beside it in
  `geist-license.txt` and has to stay with any copy of the font.

So: clone it to see how the page is built, reuse the code freely, and
replace the content with your own before you deploy anything.
