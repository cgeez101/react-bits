# FARM RADIO showcase site

A rebuild of the FARM RADIO demo site in a "broadcast almanac" style: paper and ink, hairline-ruled boxes and one on-air orange.

## What to upload
`release/index.html` is the whole site in **one self-contained file** (about 2.4 MB). It includes the images, fonts, audio and code. Upload it to WordPress the same way as the old file (Media › Add New, then open its URL).

## Edit the content
All the content lives in **`src/data.js`**: presenters, schedule tweaks, prices, weather, sport, chat, songs, brand series and sponsors. The hour's running order is in `src/schedule.json`. Images are in `src/assets/`.

The demo plays a simulated live hour, 16:00–17:00. A full hour runs in 5 minutes, and you can set the speed and start point in `STATION` in `src/data.js`.

## Build
```bash
cd farm-radio
npm install
npm run dev      # local preview with hot reload
npm run build    # writes dist/index.html; copy it to release/index.html
```

## What it's built with
- **GSAP**: the local `Animation-GSAP` fork, used when it sits next to this repo (otherwise the npm package). It runs the ScrollTrigger reveals, the SplitText title reveals, the ScrambleText "tuning" effect on the on-air headline, and the tuner needle.
- **Lenis**: the local `lenis` fork (`packages/core`), used for smooth scrolling. It's turned off for anyone with reduced motion set.
- **React Bits**: imported straight from this repo's `src/content`:
  - `SplitFlapText`: the market board
  - `Topography`: the contour-map background in the studio
  - `LogoLoop`: the partner wordmarks
- Vite and React, bundled into a single file with `vite-plugin-singlefile`.

## Page map
Sponsor strip, then a header with the tuner-dial nav, live clock and Listen live, then the breaking band. After that:

**Studio** (on air, up next, the hour strip) → price ticker → **01 Desk** (market board, weather, agri wire, sport, topic pulse) → **02 Feed** (filters, featured video, live/up next/on demand) → **03 Your voice** → **04 Song vote** → **05 Brand series** → **06 Partners** (wordmarks, partner carousel, media-kit pitch) → **07 Presenters** → footer.

The sticky player bar and the Live room chat drawer float over every section.
