# Craftkai, archived 06.11.26

Taken off the site at Jirel's request. Everything is kept here so Craftkai
can come back quickly:

- `craftkai.mp4`, `craftkai-poster.jpg`: their reel (was `site/public/video/`)
- `thumb.jpg`: video thumbnail (was `site/public/video/thumbs/craftkai.jpg`)
- `craftkai-mail.jpg`: mail picture (was `site/public/img/mail/craftkai.jpg`)
- `img-hosts/`: their photos (was `site/public/img/hosts/`)
- `removed-data.patch`: their host copy in all languages, facets, area, reel,
  scraped dates, homepage pictures, and the scraper change, exactly as removed

Workshops our own hosts sell through Craftkai's shop (Whittle, The Munio,
Yurika) stay on the site: the scraper source keeps only routed workshops
(`routedOnly: true` in `scripts/update-workshops.mjs`).

To bring Craftkai back: revert the "Take Craftkai off the site" commit (or
apply the patch in reverse and copy the files back), and drop its entry
from `site/src/data/removed-hosts.json`.
