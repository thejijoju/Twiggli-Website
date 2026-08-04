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
- **Store links.** `AppDownloadCta` takes `appStoreHref` / `googlePlayHref`,
  both `#` today. Real store badge artwork should replace the text buttons.
