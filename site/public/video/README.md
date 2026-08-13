# Video assets

Drop host reels here. Everything under `site/public/` is copied verbatim
into the build and served from the site root, so a file saved as
`site/public/video/reel-1.mp4` is fetched at `/video/reel-1.mp4` — in code,
`withBase('/video/reel-1.mp4')`.

## Naming

    reel-1.mp4          the reel itself
    reel-1-poster.jpg   first-frame still, shown before playback starts
    reel-2.mp4
    reel-2-poster.jpg

The poster matters: without one the card renders black until the video
starts loading.

## Format

- **MP4** (H.264 video + AAC audio) — the one combination every browser plays.
- **Vertical 9:16** to match the carousel cards.
- **Under ~5 MB each.** GitHub refuses any file over 100 MB and warns above
  50 MB, and every visitor downloads these, so a raw phone export usually
  wants compressing first.

Reels autoplay muted and looping where they are used, so audio is optional —
but keep the track if the clip has any, in case it is wanted later.
