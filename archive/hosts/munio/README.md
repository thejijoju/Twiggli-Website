# The Munio (Laura), removed for good 18.11.26

Candle & fragrance workshops (Akazienstr. 30, Schöneberg). Taken off the site
because Laura never replied after 26.10 (agreement, two requests, October
invoice); archived 11.11.26, removed for good 18.11.26 (Jirel). Everything is
kept here so she can come back quickly:

- `munio.mp4`, `munio-poster.jpg`: her reel (was `site/public/video/`)
- `thumb.jpg`: video thumbnail (was `site/public/video/thumbs/munio.jpg`)
- `munio-mail.jpg`: mail picture (was `site/public/img/mail/munio.jpg`)
- `img-hosts/`: her photos (was `site/public/img/hosts/`)
- `removed-data.patch`: her host copy in all languages, facets, area, reel,
  video page, voucher entry, hen party and birthday picks, scraped dates and
  the scraper source (plus her route in the Craftkai source), the homepage
  pictures swapped to Galleria Lucia, and her redirect entry, exactly as
  changed

Her old pages (every language, `/workshops/craft/munio/` and her five class
pages) are noindex redirect stubs to the craft hub
(`site/src/data/removed-hosts.json`).

To bring her back: revert the "The Munio removed for good" commit (or apply
the patch in reverse and copy the files back), and drop her entry from
`site/src/data/removed-hosts.json`.
