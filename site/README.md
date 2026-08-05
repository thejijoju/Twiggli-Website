# Twiggli website

Implementation of the Claude Design handoff in `../project/Twiggli Landing.dc.html`.

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static output in dist/
npm run check    # type-check .astro files
```

Astro, static output, no client-side JavaScript ships.

## Layout

```
src/
  styles/modernist.css   design-system tokens + component classes (copied verbatim
                         from the bundle's _ds/ — treat as vendored, retune upstream)
  styles/site.css        page layout, lifted from the export's inline styles,
                         plus the media queries the prototype didn't have
  data/site.ts           nav links, footer columns, social, brand
  data/content.ts        steps, host list, phone-mockup sample cards
  components/            Nav, Footer, ImageSlot, PhoneMockup, HostGrid, AppDownloadCta
  layouts/Base.astro     html shell, meta, nav + footer
  pages/                 one file per route
```

## Fidelity to the design

`src/pages/index.astro` reproduces the export exactly: same copy, same emoji,
same section order, same measurements. The export carried two editable props —
`heroLayout` (`overlap` | `single`) and `frontScreen` (`listing` | `photo`) —
which are now `PhoneMockup`'s `layout` and `screen` props. The landing page
uses the export's defaults, `overlap` and `listing`.

Two deliberate departures:

- **Media queries.** The prototype was authored at desktop width only. The
  breakpoints in `site.css` collapse grids below 980px, stack the "how it
  works" rows below 760px, wrap the nav below 720px, and drop the rear phone
  below 520px. No desktop value changes.
- **`<image-slot>` → `ImageSlot.astro`.** The prototype's element was an editor
  affordance (drag a file on it, persist to a JSON sidecar). What ships is its
  empty state, rendered pixel-for-pixel, plus a real `<img>` when given a `src`.

## Legal pages

`/terms-of-service`, `/privacy-policy` and `/impressum` are **drafts written
from scratch**, not copies of the current site — twiggli.com returns 403 to
automated fetches, so the existing text could not be retrieved.

Every operator-supplied value renders as a highlighted `.fill-in` span, so
unfilled fields are visible on the page itself rather than buried in source.
Each page also carries a red-bordered draft notice; delete the
`slot="notice"` block once a lawyer has signed the document off.

Two things worth knowing:

- The Impressum is in German by design — the obligation comes from German law
  (§ 5 DDG, § 18(2) MStV) and is conventionally served in German even on an
  English site.
- It deliberately omits the EU Online Dispute Resolution link that used to be
  boilerplate. That platform shut down on 20 July 2025 and the regulation
  behind it was repealed, so linking it would point users at a dead service.
  The § 36 VSBG statement is what remains required.

## Typeface

The design system ships Archivo, loaded by `modernist.css`. To move the site
onto a different family, add the font to `Base.astro`'s `<head>` and set
`--font-heading` / `--font-body` in the block at the top of `site.css`.
Nothing else in the codebase names a font.

## What still needs real content

- **Photography.** Every `ImageSlot` without a `src` renders the dashed
  placeholder. Drop files in `public/img/` and pass the path.
- **The 17 hosts.** `src/data/content.ts` has 17 entries reading "Host name /
  Workshop type" — the placeholders from the design. Each takes an optional
  `photo` path.
- **Subpage copy.** `/how-it-works`, `/hosts`, `/host`, `/corporate` and
  `/contact` reuse the export's copy where it exists; anything else is marked
  `PLACEHOLDER` in the source.
- **The contact form** posts nowhere. Point its `action` at a form handler.
- **Store links.** `storeLinks` in `src/data/site.ts` holds both hrefs (`#`
  today). Set `badge` on either entry to swap the text button for real badge
  artwork — download the official files from Apple and Google rather than
  redrawing the marks, which both forbid.
- **Legal fields.** 39 highlighted `.fill-in` values across the three legal
  pages, plus a lawyer's review.
