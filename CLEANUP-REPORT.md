# RadMoon website: Framer removal and performance cleanup report

Date: 2026-11-08 · Status: **all pages converted, not deployed** (no `firebase deploy` was run)

## Pages done

| Page | HTML before | HTML after | Lighthouse mobile before → after | LCP before → after |
|---|---:|---:|---|---|
| blastfront.html | 8,566 KB | 12 KB | 30 → 96 | 43.7 s → 2.7 s |
| 3davatars.html | 8,805 KB | 11 KB | 33 → 94 | 45.2 s → 2.9 s |
| 3dcharacters.html | 14,859 KB | 11 KB | 26 → 91 | 75.8 s → 3.2 s |
| aloha.html | 10,340 KB | 13 KB | 29 → 95 | 52.5 s → 2.6 s |
| chap.html | 15,341 KB | 10 KB | 26 → 100 | 77.6 s → 1.8 s |
| evermore.html | 22,080 KB | 17 KB | 28 → 92 | 112.1 s → 3.2 s |
| neuroscape.html | 24,733 KB | 17 KB | 26 → 93 | 124.8 s → 3.0 s |
| pacificrim.html | 7,880 KB | 10 KB | 33 → 93 | 40.8 s → 2.9 s |
| vflect.html | 7,947 KB | 11 KB | 33 → 96 | 40.7 s → 2.7 s |
| projects.html | 19,873 KB | 12 KB | 38 → 99 | 101.0 s → 2.0 s |
| index.html | 34 KB | 34 KB | 100 → 100 | 1.5 s → 1.7 s |
| fallentear.html | 41 KB | 41 KB | 100 → 98 | 1.5 s → 2.3 s |
| radmoon-redesign-final.html | 31 KB | 31 KB | not measured | |

How this was measured: Lighthouse 12, mobile, on a local server. Requests to Framer, Google Fonts and YouTube were blocked on both sides, so the originals were never slowed down by those. For index and fallentear the "before" score is flattered: their Google Fonts were blocked, while the "after" pages load the same fonts locally. The Framer videos weren't downloaded yet during the test, so re-run Lighthouse once the download script has run.

Originals of every page are in `_framer-originals/`, which Firebase doesn't deploy.

## What changed

- **Framer is gone.** None of the pages load anything from `framerusercontent.com` or `framer.com`, and they don't use Framer's JavaScript runtime (React/Motion modules, hydration, editor bar, search index metas, `data-framer-*`, Framer CSS). The only "framer" text left in the public folder is in `download-framer-assets.ps1` and the `_framer-originals/**` ignore entry in `firebase.json`. Firebase doesn't deploy either of those.
- **Images.**
  - 280+ base64 images were pulled out of the pages, converted to WebP and resized: at most 2× the size they are shown at, and 1920 px for hero backgrounds.
  - The larger images also get a smaller version (`-sm`), so phones download less (`srcset`/`sizes`).
  - Every image below the first screen is lazy-loaded (`loading="lazy" decoding="async"`), and the hero image gets `fetchpriority="high"`.
- **Shared files.**
  - `assets/css/site.v1.css`: header, related projects, contact form, footer and lightbox. This is your `rm-` CSS, with only the rules that hid Framer elements removed.
  - `assets/css/project.v1.css`: the shared project-page layout.
  - `assets/css/projects.v1.css`: the projects listing page.
  - `assets/css/fonts.v1.css`: self-hosted fonts for index and fallentear.
  - `assets/js/site.v1.js`: contact form, YouTube facade, and the gallery/lightbox (your `rm-project-gallery-script`).
  - `assets/js/projects.v1.js`: your projects filter script.
- **How the project pages were rebuilt.**
  - Each original was rendered at 1440, 810 and 390 px and every item's position was measured.
  - The clean pages reproduce those measurements: hero height, title and tag positions, spacing, the 2- and 3-column image rows, and image proportions.
  - In testing, item positions matched the originals to within about one line of text.
  - The build scripts are in the working folder if more pages need converting later.
- **YouTube.** Framer's facade is replaced with a lightweight one: a thumbnail and play button. Clicking it loads `youtube-nocookie.com` with autoplay.
- **Fonts.**
  - Self-hosted as WOFF2 (Latin only): Inter, Archivo Black, Space Mono, Poppins, Roboto Condensed.
  - About 85 Framer `@font-face` rules were dropped.
  - The projects page also uses "M Mabar Regular", which is on the download list.
- **Caching.** `firebase.json` now has year-long immutable caching for images, fonts, video, CSS and JS, and `no-cache` for HTML. The existing `cleanUrls` setting is kept. CSS and JS files have `v1` in their names: rename them to `v2` (and update the links) whenever you change them.

## Follow-up changes (Zo's review)

- **Hero focal points.** Framer had custom focal points on four hero images, and the first version centred them, which cropped the Neuroscape girl's face. Each page now uses the original's focal point:
  - neuroscape: 50.7% 18.8%
  - 3davatars: 50.6% 27% (centred on phones, as the original)
  - 3dcharacters and pacificrim: 48.8% 6%
- **Vflect videos.** The first four Vflect images are now YouTube players, in the same facade style as Blast Front: rA4KqxFRyG8, UZDTTb5H1jE, bivlLnkldvs, F9TWKQ4385c. The four image files those slots used to show are no longer referenced by the page.
- **Blast Front videos.** Confirmed in order: Ulx-ANJl4mg, BlwTS3OgtXQ, VUYrl-1J77s, 0yItKS3U9eg.
- **YouTube thumbnail fallback.** Some videos have no high-resolution thumbnail. When that happens, `site.v1.js` now switches to the standard YouTube thumbnail.

## Needs Zo's attention

1. **Run the download script** for the 30 files that still only exist on Framer: videos, posters, the home images, related-card images, icons and the M Mabar font. It skips files you already have.
   `powershell -ExecutionPolicy Bypass -File "K:\codes\personal projects\Radmoon final website\download-framer-assets.ps1"`
   Until you run it, those videos and images show as blank.
2. **`radmoon-redesign-final.html`** is an older draft of the homepage. Nothing links to it, but it's still deployed and public. It's cleaned up like the others. Do you want it deleted, or added to the Firebase `ignore` list?
3. **Unused large files** in the public folder are still being deployed: `fallentear.png`, `Fallen Tear Acension.png` and `falllen tear ascension.png` (1.8 MB each, identical). No page uses them any more; they're replaced by WebP files. `logo.png` (533 KB) is now used only as the homepage's og/twitter share image. Do you want the three PNGs deleted?
4. **projects.html, phone-only cards.** In the original, the Aloha and CHAP cards appear only on phones, not on desktop or tablet. I kept that. If you want them everywhere, delete the `.pj-card-phone-only{display:none}` rule in `projects.v1.css`.
5. **Fixed while converting.** These are small behaviour changes. Tell me if you want any of them reverted.
   - Clicking a Related Projects card used to open the lightbox instead of going to that project. The cards now link properly.
   - On phones, the "3D Avatars" card on projects.html linked to the 3D Characters page. It now links to 3davatars.html.
   - Project pages now actually load Archivo Black and Space Mono. The `rm-` CSS asked for them, but they were never loaded, so headings fell back to a plain sans-serif.
   - On phones, footer links, hero titles and hero tags used to run off the right edge of the screen. They now wrap.
   - Videos further down a page start loading and playing only when they come close to the screen (pacificrim has 8). Hero videos still start immediately.
   - The phone card text "Vis Develpment" is corrected to "Vis Development".
6. **The contact form on project pages doesn't send anything.** It never did: it shows "Sent ✓" and that's it. Only index.html saves to Firestore. It's worth wiring the project-page form up to the same Firestore code.
7. **Page titles.** Every project page is titled "RadMoon Studios" (neuroscape is "Neuroscape"). Giving each page its own title, such as "Blast Front — RadMoon Studios", would help search results. It's a one-line change per page.
8. **Test before deploying:** `firebase emulators:start --only hosting`, then click through every page. Deploy when you're happy.
