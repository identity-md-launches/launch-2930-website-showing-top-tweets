# Asset register

All required assets are bundled in `public/` and copied into `dist/`. No image CDN or font service is contacted at runtime.

## AI Pepe illustration

`public/assets/pepe-squad.webp` is an original project illustration generated with the built-in imagegen tool. It depicts three Pepes with an AI chip blaster, laptop and drone. The full generated composition is preserved; WebP compression is the only change to the hero asset. `public/assets/share.jpg` is a 1200 × 630 crop of the same illustration for link previews. The uncompressed generator output is not needed at runtime and is not bundled.

Exact generation prompt:

> Use case: stylized-concept. Asset type: panoramic website header illustration, 1536 by 1024 landscape. Primary request: a squad of three Pepe the Frog characters armed with AI in a dark green digital swamp. Make premium hand-drawn editorial comic art with bold confident near-black ink lines, painterly textured shading, strong silhouette and a little retro print grain, not a 3D render. Center-right a charismatic classic Pepe with large sleepy eyes, wide reddish lips, green face, dark tactical jacket, slim luminous green cybernetic visor pushed above his eyes and neural headset. He holds a chunky futuristic non-real laser rifle with a bright AI chip inset, muzzle pointed downward. Behind him a smaller Pepe with a laptop and another with a small hovering AI drone. Forest green and almost-black background, deep emerald shadows, limited acid-lime highlights, warm muted copper lips. Tall swamp reeds, cables and a few tiny glowing network-node symbols. Friendly confident mischievous squad, no violence. Composition: subjects occupy the right two thirds, left third quiet almost-black green negative space fading naturally into the scene, waist-up medium shot, enough headroom. Wide cinematic composition suitable for cropping to a shallow horizontal banner. No lettering, no logos, no watermark, no UI, no border.

## UI assets

- `public/favicon.svg`: original compact frog mark, drawn as a simple SVG for this site; reused in the header.
- `src/Icon.tsx`: project-local outline SVG icons. No remote icon library or raster icon dependency.
- `public/assets/manrope-latin.woff2`: Manrope Latin variable font from `@fontsource-variable/manrope` 5.3.0. The original SIL Open Font License is retained in `docs/FONT-LICENSE.txt`.

## Profile images

These small identifying avatars belong to their respective public authors. They were downloaded from the profile image URLs linked by each sourced post on 3 November 2026, resized to 96 × 96, and compressed as WebP. Cards preserve author/profile attribution; a failed image displays the author's initial.

| Local file | Author | Observed image URL |
| --- | --- | --- |
| `adam.webp` | @surfcoderepeat | https://pbs.twimg.com/profile_images/1707558009776242688/Mu8g3JM2_400x400.jpg |
| `radar.webp` | @imdradar | https://pbs.twimg.com/profile_images/2106733399335395328/6hNeyMSu_400x400.jpg |
| `damian.webp` | @damian_et | https://pbs.twimg.com/profile_images/2049158425582723072/1TKsp3pZ_400x400.jpg |
| `infer.webp` | @imdusd | https://pbs.twimg.com/profile_images/2107530965304176640/7Y4RNshV_400x400.jpg |
| `nitro.webp` | @nitroslaveth | https://pbs.twimg.com/profile_images/1887518196736897025/3NTpux3x_400x400.jpg |
| `miyagod.webp` | @yadfarms | https://pbs.twimg.com/profile_images/1982656466663211008/LSbU2QAT_400x400.jpg |

These assets are attributed for identification, not relicensed as original Swarmfeed artwork. Tweet text and author identities remain the authors' material. Source post URLs and observation dates are in `docs/SOURCES.md`.

## Design guidance

Better Interface is by Jakub Krehel, MIT, pinned at `267330e1adfc66a718fb65fa6918c1f06d0a689e`. The documentation method derives from Paul Bakaus's Impeccable, Apache-2.0, pinned at `9d715cc4f5564a990ca8345abfdd5df6dc9b41c8`. The combined supplied notices and full license texts are retained in `docs/DESIGN-GUIDANCE-LICENSE.txt`.

Runtime React, React DOM and Scheduler notices are preserved in `docs/RUNTIME-LICENSES.txt`.
