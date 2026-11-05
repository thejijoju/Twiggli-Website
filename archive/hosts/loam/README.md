# Loam (Jana), archived 05.11.26

Taken off the site because Jana never joined Twiggli as a host (no reply to
the March outreach). Everything is kept here so she can come back quickly:

- `loam.mp4`, `loam-poster.jpg`: her reel (was `site/public/video/`)
- `loam.jpg`: mail picture (was `site/public/img/mail/`)
- `thumb.jpg`: video thumbnail (was `site/public/video/thumbs/loam.jpg`)
- `removed-data.patch`: her host copy in all languages, facets, area, first
  name, scraped dates and scraper source, exactly as removed

To bring her back: `git revert 0040ed8` (or apply the patch in reverse and
copy the files back), and drop her entry from `site/src/data/removed-hosts.json`.
