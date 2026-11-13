# FARM RADIO showcase site

A rebuild of the FARM RADIO demo site in a "broadcast almanac" style: paper and ink, hairline-ruled boxes and one on-air orange.

## What to upload
`release/index.html` is the whole site in **one self-contained file** (about 2.9 MB). It includes the images, fonts, audio and code. Upload it to WordPress the same way as the old file (Media › Add New, then open its URL).

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
- **three.js** (same version React Bits uses): the 3D FARM RADIO logo in the studio, which you can drag to spin.
- Vite and React, bundled into a single file with `vite-plugin-singlefile`.

## Pages
Each section is its own page. Open them from **Menu** at the top right, from the station index on the On air page, or with the Previous / Next buttons at the bottom of every page. Each page has its own link, for example `index.html#markets`.

| Freq | Page | Link |
|---|---|---|
| 88.2 | On air (studio, 3D logo, this hour, station index) | `#live` |
| 90.4 | Market board | `#markets` |
| 91.6 | Weather | `#weather` |
| 92.8 | Agri wire | `#wire` |
| 93.5 | Sport | `#sport` |
| 94.1 | Topic pulse | `#pulse` |
| 95.7 | The feed | `#feed` |
| 97.4 | Song vote | `#vote` |
| 99.9 | Your voice | `#voice` |
| 101.3 | Presenters | `#team` |
| 102.5 | Brand series | `#brands` |
| 105.3 | Partners | `#partners` |

The page list lives in `src/pages.js`. The header, the sticky player and the Live room chat stay in place on every page.
