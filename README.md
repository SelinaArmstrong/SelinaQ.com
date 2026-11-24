# selinaq.com

<https://github.com/SelinaArmstrong/SelinaQ.com>

Personal site for Selina Armstrong — Senior Contract Specialist.
Static, hand-built: no framework, no build step, no dependencies.

## Layout

```
public/          ← the deploy root. Everything that ships lives here.
  index.html
  styles.css
  site.js
  404.html
  robots.txt
  sitemap.xml
  Selina-Armstrong-Resume.pdf
  assets/        ← images, the Geist woff2 subset, monogram, OG card
content/         ← the master resume (.docx). Source of truth for every
                   claim on the page. NOT deployed.
design/          ← visual-direction studies. NOT deployed.
.claude/         ← local preview config for Claude Code. NOT deployed.
```

## Local preview

```
python3 -m http.server 8781 --directory public
```

Then open <http://localhost:8781/>.

## Deploying

The site is plain static files — **publish the `public/` directory, not the
repository root**, so `design/` and `.claude/` stay off the web.

Per-host notes, since `404.html` and clean URLs are handled differently:

| Host | Publish directory | 404 page |
| --- | --- | --- |
| GitHub Pages | `/public` on the default branch (or `gh-pages`) | `404.html` works as-is |
| Netlify | `publish = "public"` | `404.html` works as-is |
| Cloudflare Pages | build output `public` | `404.html` works as-is |
| Vercel | set the output directory to `public` | `404.html` works as-is |

A custom domain needs a `CNAME` file in `public/` on GitHub Pages; the other
hosts set the domain in their dashboard.

## Analytics

`index.html` carries a commented GA4 block at the end of `<head>`. Drop the
measurement ID in and uncomment it; nothing else on the page depends on it,
and no other third-party script is loaded.

## Things to keep in sync by hand

- `sitemap.xml` — `<lastmod>` when the page changes meaningfully.
- `assets/selina-armstrong.jpg` — the 1200×630 Open Graph card. It is generated
  from an HTML template, not photographed; regenerate it if the name, title or
  palette changes.
- `Selina-Armstrong-Resume.pdf` — exported from
  `content/Selina-Armstrong-Resume-master.docx`, which is the baseline for the
  wording on the page. When the master changes, re-check the hero line, the
  metrics, Capabilities, the timeline bullets and the project tags against it.

## Accessibility and motion

- Every animation is `transform`/`opacity` only and is switched off under
  `prefers-reduced-motion: reduce`.
- Body copy meets WCAG 2.1 AA contrast on the dark palette; `--text-3`
  (`#80858E`) is the lightest colour used for real text — do not go dimmer.
- The page is fully readable with JavaScript disabled.
- `@media print` gives the dark theme a light print palette; check it after
  layout changes.
