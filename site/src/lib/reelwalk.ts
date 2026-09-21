/** One reel at a time, walking forward through a page of them.
 *
 *  A grid of still thumbnails does not say "these are videos". So one tile
 *  plays for a few seconds and hands over to the tile two places along —
 *  the first card, then the third, then the one in the middle on the next
 *  lap — and scrolling carries the walk with the reader: when the playing
 *  tile leaves the screen the next one in view takes over at once rather
 *  than waiting out its turn.
 *
 *  Only ever one clip runs, and only ever one that is really on screen, so
 *  a page of a hundred reels costs the same as a page of five: a reel loads
 *  nothing until its turn comes.
 *
 *  Pointing at a tile plays that one instead, and clicking stops it until
 *  the pointer leaves and comes back; the walk then resumes from where the
 *  reader was looking. Touch has no hover, so there a tap toggles. Nothing
 *  starts by itself for a reader who asks for reduced motion.
 *
 *  Used by the calendar (DayPicker) and the host directory (HostDirectory).
 */

export type Reel = {
  video: HTMLVideoElement;
  /** What the pointer interacts with and what is watched for visibility —
   *  the picture, not the whole card: a card runs to a thousand pixels with
   *  its blurb, so "half the card is showing" is a poor proxy for "you can
   *  see the video". */
  tile: HTMLElement;
  /** The element hidden when something filters this reel out of the page,
   *  where that is not the tile itself. */
  card?: HTMLElement;
};

export type ReelWalkOptions = {
  /** How long a tile holds the spotlight. */
  holdMs?: number;
  /** How many places along the next tile sits. Two rather than one, so the
   *  eye is pulled across the row instead of down a single column. */
  step?: number;
  /** How much of a tile must show before it counts as on screen. */
  threshold?: number;
  /** Class set on the card (or tile) while its reel is running. */
  playingClass?: string;
  /** Which tile in view opens the walk: 0 for the first, 1 for the second.
   *  The calendar starts on the second card of a four-wide row; the
   *  directory, three wide, starts on the first. */
  startAt?: number;
  /** How long to wait for a clip that has not started yet before giving up
   *  on it and moving along. */
  graceMs?: number;
};

export function startReelWalk(reels: Reel[], options: ReelWalkOptions = {}) {
  const { holdMs = 3500, step = 2, threshold = 0.4, playingClass, startAt = 1, graceMs = 6000 } = options;
  if (!reels.length) return { resync: () => {} };

  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hoverable = window.matchMedia('(hover: hover)').matches;
  const marked = (reel: Reel) => reel.card ?? reel.tile;

  const onScreen = new Set<Reel>();
  const stopped = new Set<Reel>();
  let hovered: Reel | null = null;
  let current: Reel | null = null;
  /** The reel the walk played last, even once it has scrolled away — it is
   *  where the next step counts from. */
  let last: Reel | null = null;
  /** Where a lap starts. A screen holding an even number of tiles would
   *  otherwise step 1, 3, 1, 3 … and never reach the other two, so each lap
   *  begins one place further along than the last. */
  let lap = startAt % step;
  let timer = 0;

  const eligible = (reel: Reel) =>
    onScreen.has(reel) && !stopped.has(reel) && !marked(reel).hidden;

  const play = (reel: Reel) => {
    const { video } = reel;
    if (playingClass) marked(reel).classList.add(playingClass);
    if (!video.paused) return;
    // Nothing is loaded until something asks for it, and play() on an empty
    // buffer is refused often enough to need a second attempt once there are
    // frames to show.
    video.preload = 'auto';
    const attempt = () => video.play().catch(() => {});
    attempt();
    if (video.readyState < 3) {
      video.addEventListener('canplay', () => {
        if (current === reel || hovered === reel) attempt();
      }, { once: true });
    }
  };

  const halt = (reel: Reel) => {
    if (playingClass) marked(reel).classList.remove(playingClass);
    if (!reel.video.paused) reel.video.pause();
  };

  /** The turn's clock. A turn is three and a half seconds of a clip actually
   *  running, not three and a half seconds of waiting for one: a reel loads
   *  nothing until its turn comes, and a two-megabyte clip on a slow
   *  connection needs a moment before its first frame. Timing the turn from
   *  the play() call instead moved the spotlight on before anything had
   *  shown, and a whole page of reels sat still. */
  const hold = (ms: number) => {
    clearTimeout(timer);
    if (!still) timer = window.setTimeout(advance, ms);
  };

  const show = (reel: Reel | null) => {
    if (current && current !== reel) halt(current);
    current = reel;
    if (!reel) {
      // Nothing in view to play — look again shortly rather than stopping,
      // since the reader may simply be between two rows.
      hold(holdMs);
      return;
    }
    last = reel;
    play(reel);
    if (!reel.video.paused && reel.video.readyState >= 3) {
      hold(holdMs);
    } else {
      // Give it the grace window to get going; the moment it does, the turn
      // starts again from there.
      hold(holdMs + graceMs);
      reel.video.addEventListener('playing', () => {
        if (current === reel) hold(holdMs);
      }, { once: true });
    }
  };

  /** The reel closest to the middle of the screen — where the walk picks up
   *  after the reader has scrolled away from the one that was playing. It
   *  starts again where they are looking rather than at the corner of the
   *  screen or wherever the old one happened to be. */
  const nearestToTheMiddle = (live: Reel[]): Reel => {
    // Both axes: a row of tiles all sit at the same height, so measuring
    // down the page alone would always hand it to the one on the left
    // rather than to the one in the middle of the screen.
    const midY = window.innerHeight / 2;
    const midX = window.innerWidth / 2;
    const offBy = (reel: Reel) => {
      const box = reel.tile.getBoundingClientRect();
      return Math.hypot((box.top + box.bottom) / 2 - midY, (box.left + box.right) / 2 - midX);
    };
    return live.reduce((best, reel) => (offBy(reel) < offBy(best) ? reel : best), live[0]);
  };

  /** Whose turn it is: `step` places on from the last one, counted among the
   *  tiles actually on screen. Nothing played yet, so the walk opens where
   *  `startAt` says; the last one scrolled away, so it picks up in the middle
   *  of the screen; the step ran off the end, so a new lap begins one place
   *  further along than the last. */
  const nextUp = (): Reel | null => {
    const live = reels.filter(eligible);
    if (!live.length) return null;
    if (!last) return live[Math.min(startAt, live.length - 1)];
    const at = live.indexOf(last);
    if (at < 0) return nearestToTheMiddle(live);
    const next = at + step;
    if (next < live.length) return live[next];
    lap = (lap + 1) % step;
    return live[Math.min(lap, live.length - 1)];
  };

  // Declared as a function so `hold` above can schedule it before it is
  // defined — the two call each other, one turn at a time.
  function advance() {
    if (hovered) return; // the pointer outranks the walk
    show(nextUp());
  }

  const byTile = new WeakMap<Element, Reel>();
  reels.forEach((reel) => byTile.set(reel.tile, reel));

  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const reel = byTile.get(entry.target);
      if (!reel) continue;
      if (entry.isIntersecting) onScreen.add(reel);
      else {
        onScreen.delete(reel);
        if (current === reel) current = null;
        if (hovered === reel) hovered = null;
        halt(reel);
      }
    }
    // Whatever was playing has gone, or the first tiles have just come into
    // view: take the next turn now instead of at the next tick.
    if (!still && !current && !hovered) {
      advance();
    }
  }, { threshold: still ? 0.1 : threshold });
  reels.forEach((reel) => io.observe(reel.tile));

  const pin = (reel: Reel) => {
    stopped.delete(reel);
    hovered = reel;
    show(reel);
  };
  const release = (reel: Reel) => {
    if (hovered !== reel) return;
    hovered = null;
    // Carry on from the tile the pointer visited, so the walk picks up where
    // the reader was looking.
    last = reel;
    halt(reel);
    if (current === reel) current = null;
    if (!still) {
      advance();
    }
  };

  for (const reel of reels) {
    if (hoverable) {
      reel.tile.addEventListener('mouseenter', () => pin(reel));
      reel.tile.addEventListener('mouseleave', () => {
        stopped.delete(reel);
        release(reel);
      });
      reel.tile.addEventListener('click', () => {
        stopped.add(reel);
        hovered = null;
        halt(reel);
        if (current === reel) current = null;
      });
    } else {
      // The tile links nowhere, so a tap has nothing else to do — and on the
      // phones whose low-power mode refuses the autoplay above, it is the
      // only way to start a reel at all.
      reel.tile.addEventListener('click', () => {
        if (reel.video.paused) {
          pin(reel);
          hovered = null;
          last = reel;
        } else {
          stopped.add(reel);
          hovered = null;
          halt(reel);
          if (current === reel) current = null;
        }
      });
    }
    // The tile is the keyboard's way in where there is no play button.
    reel.tile.addEventListener('keydown', (event) => {
      const key = (event as KeyboardEvent).key;
      if (key !== 'Enter' && key !== ' ') return;
      event.preventDefault();
      if (reel.video.paused) {
        pin(reel);
        hovered = null;
        last = reel;
      } else {
        stopped.add(reel);
        halt(reel);
        if (current === reel) current = null;
      }
    });
    reel.video.addEventListener('pause', () => {
      if (playingClass) marked(reel).classList.remove(playingClass);
    });
  }

  advance();

  /** Something reflowed or filtered the grid: drop anything no longer
   *  eligible and take the next turn if the spotlight went with it. */
  const resync = () => {
    if (current && !eligible(current)) {
      halt(current);
      current = null;
    }
    if (!still && !current && !hovered) {
      advance();
    }
  };

  return { resync };
}
