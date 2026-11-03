# Swarmfeed

A dark green, AI Pepe-themed reader for top tweets about IdentityMD. The delivered site includes eight sourced posts, search, topic and date filters, most-liked and newest ordering, device-local bookmarks, copyable tweet links, and source details.

**The feed is a dated snapshot, not a live or exhaustive X ranking.** “Top tweets” sorts the collected posts by recorded likes. Original tweet links and the mirror used for each entry are available in the UI. See [the source register](docs/SOURCES.md).

## Install and develop

Use Node.js 22.12+ and npm. Node 24.21.0 was used for the recorded build.

```sh
npm ci
npm run dev
```

Open the local address printed by Vite. No API keys, wallet, backend, or environment file are needed.

## Rebuild and preview

```sh
npm run typecheck
npm run build
npm run preview
```

The complete production site is already included in **`dist/`**, alongside the source and `package-lock.json`. Serve that folder with any static HTTP host. Vite uses `base: './'`; scripts, styles, images, font, favicon and share image use relative URLs and work beneath a gateway subpath. The app uses one HTML page and fragment links, so no route rewrites are required. Use an HTTP preview rather than opening `index.html` with `file://`.

Fonts, illustrations and avatars are local. The exported page makes no remote requests until a visitor follows an external link. X may require a login. Bookmarks use `localStorage` in this browser; if storage is denied, they work for the current visit. Clipboard denial provides a selectable URL instead of a false success message.

The relative `og:image` is intentional because the eventual public address is unknown. A host may set an absolute image URL after assigning its domain if its social crawler requires one.

## Validate

```sh
npx playwright install chromium webkit
npm run validate
```

On Linux, Playwright browsers also require native system libraries. The validation script starts and closes its own static server, serves `dist/` at `/preview/`, blocks external runtime requests, and checks the actual production output. It writes results, accessibility findings and screenshots under `test/scratch/interactions/`. A failed Chromium interaction sets a nonzero exit code. An unavailable WebKit runtime is reported separately as a limitation, not a passing Safari check.

### Recorded results, 3 November 2026

| Check | Actual result |
| --- | --- |
| `npm run typecheck` | Passed, TypeScript reported no errors |
| `npm run build` | Passed, Vite production export generated |
| `npm run validate` | 28 checks passed, 0 failed in Chromium |
| Axe, feed and open About dialog | 0 violations for the tested WCAG 2.2 AA rules |
| Pinned `taste@1` probe, offline | 16/16 checks passed at 320, 390 and 1440px |
| Responsive browser checks | 320, 390, 580, 768, 1024 and 1440px; no horizontal overflow |
| 200% text enlargement | Reflow passed at 320, 390 and 1440px; not a native browser zoom test |
| Browser console and local resources | No errors or missing files; no external runtime requests |
| WebKit | Downloaded, but launch failed because native libraries including `libgtk-4.so.1` are absent |

The worker installed build and test dependencies in temporary directories outside this repository, copied the same source there, ran the commands above, and copied the clean export back. No dependencies, browser binaries, registry mirrors or caches are part of the submission. A new `.gitignore` has an explicit **256-byte path budget** and excludes only generated dependency/cache directories at every nesting level plus scratch output; `dist/` remains included. A tool-generated `node_modules/.cache` directory was left untouched and excluded from submission.

The additional pinned probe command was:

```sh
PLAYWRIGHT_BROWSERS_PATH=/tmp/swarmfeed-browsers \
IMD_PLAYWRIGHT=/tmp/swarmfeed-tools/node_modules/playwright/index.mjs \
node .imd/reads/skills/design-critic/scripts/taste.mjs --out test/scratch/taste --offline
```

The pinned guide and probe are assignment inputs and are removed before delivery. The reusable interaction checker remains in `scripts/validate.mjs`. Read [the complete six-domain review](artifacts/validation.md) for fixes, evidence and limitations. These are worker checks, not an independent certification.

## Source map and content updates

- `src/App.tsx`: UI, native dialogs, search/filter state, bookmarks, clipboard recovery.
- `src/data.ts`: source-linked posts, snapshot date and pure filtering/sorting logic.
- `src/styles.css`: tokens, type, component states and responsive layouts.
- `src/Icon.tsx`: small consistent SVG icon set.
- `public/`: required local runtime assets.
- `scripts/validate.mjs`: production interaction and accessibility checks.
- [DESIGN.md](DESIGN.md): final implemented design system.
- [docs/ASSETS.md](docs/ASSETS.md): asset attribution and generation prompt.

To refresh the collection, verify each original post or public mirror, add exact short excerpts and observed engagement to `src/data.ts`, update `SNAPSHOT_DATE` and `SNAPSHOT_LABEL`, and update the explicit date-range explanation in the About dialog. Record the new observations in `docs/SOURCES.md`. Missing counts must not be invented; extend the data model and UI to say “unavailable” instead. Rebuild and revalidate `dist/` after every source or data change.

## Limits

The collection covers accessible public posts only; it is not an X-wide leaderboard. Counts are frozen and mirrors may be stale. No live social actions are simulated. Native Safari/iOS, a physical touch device, actual screen-reader sessions, native 200% zoom, localization and forced-colors rendering were not tested. Automated accessibility checks do not establish full compliance.

Design guidance attribution and retained licenses: [Better Interface / Impeccable](docs/DESIGN-GUIDANCE-LICENSE.txt). Font license: [Manrope OFL](docs/FONT-LICENSE.txt).
