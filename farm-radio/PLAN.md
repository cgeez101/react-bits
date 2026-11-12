# FARM RADIO website rebuild: agreed plan

This site is a **showcase demo for existing clients**. It is not public, and it uses demo data only.

## Decisions
| Topic | Decision |
|---|---|
| Purpose | A showcase demo that keeps the simulated "live hour": the clock runs, shows move on, prices move and chat appears |
| Look | "Broadcast almanac", edgy and boxy: a paper and ink page built from hairline-ruled boxes with square corners, a dark studio hero, and one on-air orange. Wide heavy grotesk headings (Archivo Expanded, matching the logo), typewriter mono for labels and figures |
| Sponsor | A slim "Presented by TOYOTA" strip, plus the Partners section and Brand series. No side panels |
| Real details | None for now. Stream, emails, app/social links and WhatsApp stay as demo placeholders |
| Language | English, keeping the Afrikaans touches ("Wat sê jy alles?", "En hoe lyk jou boerdery?") |
| Delivery | A single self-contained `index.html`, uploaded to WordPress the same way as the current one |

## What makes it less "AI-looking"
- No neon multi-colour tags, glowing card borders, numbered badges or emoji buttons
- Rules, columns and white space instead of a wall of rounded cards
- Colour only where it means something: red for breaking news, green and red for price up or down
- Headings set like a broadcast or print grid, not huge black text ending in a full stop
- Radio details: the section menu is a tuner dial with a needle, an ON AIR tally light, a VU meter, a split-flap market board and a timeline of the hour
- Motion is restrained and turns off when the device is set to reduce motion

## Page order
1. Presenting-partner strip, then the breaking-news line (beef export tariff)
2. Menu with the live clock and **Listen live**. A player bar stays pinned to the bottom once listening starts
3. **On air now**: the current show headline, presenter, progress and up next
4. **Market board**: flip-board prices for beef, wheat, milk, lamb, maize, soybeans and sunflower, with ▲/▼ moves
5. **Today**: weather (spray window, wind alert), agri news, sport (Boks, Proteas, Bafana) and trending topics. The live chat opens as a slim panel
6. **Schedule & replays**: "The feed" and "On demand" merged into one timeline with filters. Video interviews featured: RPO, Telkom BCX, AGRI SA, Agri Expo
7. **Your voice**: "Wat sê jy alles?" voice notes and the farm photo album, combined
8. **Farmer-driven radio**: song vote on 10 tracks
9. **Brand series** (9 shows), **partners** (8 brands) and the media-kit call to action
10. **Presenters**: Isabel, Johnny, Amore, Pieter, Gerben and Christie, with their real photos
11. **Footer**: app links, social media and the demo disclaimer

## Technology (from your three repos)
- **GSAP** (Animation-GSAP): scroll reveals and the on-air progress
- **Lenis**: smooth scrolling
- **React Bits**: SplitFlapText (price board), Topography (contour-line hero background), CountUp, LogoLoop (partner logos)
- Vite and React, built into one file. All content lives in `src/data.js`. Images are compressed, aiming for a page under 2 MB (it is 9 MB now)

## Build steps
1. Set up the project and extract and compress the images from the current page
2. Build the design system: colours, type and spacing
3. Build the sections in the page order above
4. Wire up the simulated live-hour engine (ported from the current site)
5. Check it on phone, tablet and desktop, then build the single `index.html` and commit
