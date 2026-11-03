# Swarmfeed design system

## Overview

Swarmfeed is an independent reader for the IdentityMD conversation. Its visual idea is a dark green reading surface with one illustrated squad of Pepes equipped with AI. Bright lime marks the main action, selected feed order and saved state. A compact illustrated header leads directly into the tweet collection.

The implementation lives in `src/styles.css`, `src/App.tsx` and `src/Icon.tsx`. A warm, slightly playful headline is paired with plain product copy. Source notes and errors use literal language. The interface distinguishes recorded metrics from interactive controls; likes, reposts and replies are display-only.

## Colors

The canonical format is hexadecimal. Primitives and semantic tokens are declared at the top of `src/styles.css`.

| Semantic token | Value | Role |
| --- | --- | --- |
| `--color-bg` | `#09110e` | Page and inputs in dialogs |
| `--color-surface` | `#101c16` | Tweet cards, search, dialog |
| `--color-hover` | `#14231b` | Hover and selected topic surface |
| `--color-selected` | `#1d3024` | Selected order, secondary buttons, sidebar feature |
| `--color-border` | `#304436` | Form, dialog and section structure |
| `--color-text` | `#ecf2e9` | Primary text |
| `--color-muted` | `#91a597` | Handles, metadata, secondary copy |
| `--color-accent` | `#bcf66f` | Primary fill, selected controls, saved icon |
| `--color-accent-hover` | `#d1ff98` | Primary hover fill |
| `--color-on-accent` | `#09110e` | Text on lime |
| `--color-focus` | `#bcf66f` | 2px focus outline, offset 4px |

The hero uses a component-specific `#112218` base and a dark green gradient overlay, with a stronger overlay at 360px and below. This keeps the image subordinate to text without flattening the entire illustration. The small desktop art caption is `#d9e7c8` on `#0e1a13`. Cards use `#273a2e` borders, changing to `#40563e` on hover. The sidebar feature uses `#b2c1b5` supporting text and a `#41523b` divider. Avatar outlines use white at 10% opacity. The dialog backdrop is `rgba(2,8,4,.8)`.

There is one dark theme. No unused status palette or theme toggle is shipped. Selected state also has a shape, underline, filled bookmark or `aria-pressed`; color is not the only cue. The lime display heading is a deliberate brand treatment, not a link. Measured contrast and the artwork sampling method are recorded in `artifacts/validation.md`.

## Typography

Manrope is locally bundled as `public/assets/manrope-latin.woff2`; fallback is Arial, then sans-serif. The variable file provides weights 200–800. The UI uses only 400, 600 and 700. `font-display: swap`, root font smoothing and `font-synthesis: none` are implemented.

| Token | Base size | Use |
| --- | --- | --- |
| `--text-xs` | 12px / .75rem | Dates, handles, counts, category labels |
| `--text-sm` | 14px / .875rem | Author names, buttons, explanatory UI copy |
| `--text-body` | 16px / 1rem | Tweet text and mobile search input |
| `--text-title` | 20px / 1.25rem | Compact headings, empty states |
| `--text-heading` | 24px / 1.5rem | Desktop section heading and wordmark |
| `--text-display` | 56px / 3.5rem | Hero; changes to 32px / 2rem at 580px |

The display line height is 1.05 with −.055em tracking. Section headings use 1.3 and −.035em; small headings use 1.4. Tweet copy uses 1.65, explanatory copy 1.7, and general text 1.5. Normal body tracking remains zero. Headings balance their lines; short paragraphs use `text-wrap: pretty`.

Rank, engagement and saved counts use tabular numerals. Author handles and tweet text can wrap; important content is never ellipsized by CSS. The ellipsis in an excerpt is actual content and explicitly leads to the original full tweet. Text is selectable. The body is English; quoted authors retain their original text and spelling.

## Layout

The default `.page-shell` and `.header-inner` have a 1280px maximum width with 40px horizontal padding, yielding a 1200px content area. Header height is at least 82px. The desktop hero is at least 310px tall. The default content grid has a flexible tweet region, a 270px sidebar, and a 32px gap. The tweet grid uses two equal columns with 16px gaps.

The declared spacing tokens are 4, 8, 12, 16, 24, 32 and 48px (`--space-1` through `--space-7`). Existing component rules use explicit pixel values from that rhythm, with 18/20/28/40px optical or density adjustments. Adjacent control gaps are smaller than section gaps. Cards use 18px top and 20px inline padding; mobile cards use 16px top and 18px inline padding.

| Breakpoint | Implemented behavior |
| --- | --- |
| 1500px and above | Shell grows to 1360px; sidebar 280px; gap 40px; hero at least 330px |
| 1100px and below | Outer padding 28px; sidebar 230px; one tweet column |
| 800px and below | Sidebar removed; feed uses the full width and two tweet columns |
| 580px and below | Padding 16px; one tweet column; hero at least 212px; header at least 68px; search moves below order controls; mobile About control appears |
| 360px and below | Padding 12px; stronger art overlay; date filter wraps to its own row; compact heading and brand roles |

The sidebar duplicates optional topic navigation and source context available elsewhere, so hiding it does not remove required actions. The mobile header keeps the brand at the leading edge and Saved / About at the trailing edge. Header and order controls can wrap for enlarged text. Date select width uses `em` on mobile. The entire page scrolls naturally, without sticky controls covering posts. There are no horizontal carousels.

At 390 × 844, the product description, Explore action, search, topics and first tweet with its original link are visible on the first screen. Layout was checked at 320, 390, 580, 768, 1024 and 1440px. Root text was enlarged to 200% at 320, 390 and 1440px; this was a text-reflow check rather than browser-native zoom.

## Elevation & depth

The page is flat: tonal surfaces and one-pixel structural borders, with no box shadows. Cards are not nested inside bordered cards. The hero is isolated for its decorative layers; those layers do not accept pointer events. A native modal dialog enters the browser top layer with a dim backdrop and a scrollable interior, limited to `100dvh - 40px`.

## Shapes

`--radius-sm` is 6px for controls, `--radius-md` is 12px for cards, and `--radius-lg` is 16px for the desktop hero and dialogs. The mobile hero uses 12px. Avatars are 42px circles; the 34px desktop brand mark has 10px rounding and shrinks to 30px with 8px rounding on mobile. Only images and the decorative hero crop use hidden overflow; content cards do not clip text.

## Components

- **`PostCard`, `src/App.tsx`:** accepts a sourced `Post`, rank, saved state and save/copy/source callbacks. Contains author identity, original quotation, recorded date and metrics, direct X links and Snapshot details. `Avatar` loads a local image and falls back to an initial on failure.
- **`Icon`, `src/Icon.tsx`:** one 24-unit SVG set, 1.6px rounded strokes using `currentColor`. Decorative SVGs are hidden from assistive technology. Filled bookmarks identify the saved state.
- **Action styles, `src/styles.css`:** `.button-primary` has lime fill; `.button-secondary` uses the selected surface; `.icon-button` is neutral with an accessible name. Actions have hover, focus and pressed treatments. Main actions are at least 44px high. Smaller secondary links meet the probe's 24px or spacing criterion.
- **Feed controls, `App`:** plain native button groups with `aria-pressed`, a labeled native search input, and a labeled native select. Search, topic, order and date can compose. “Reset filters” restores all filter defaults while preserving the selected feed view. Switching through the header or Explore action clears filters and focuses search.
- **Feedback, `App`:** a stable polite status region shows result counts or save/copy feedback. Recoverable empty states identify the reason and offer a clear next action. Search input remains in place while results change.
- **Native `dialog`, `App`:** About, source detail, and clipboard fallback variants share the same shell. Opening moves focus inside, traps Tab and Shift+Tab at the ends, makes the background inert via `showModal`, and locks body scrolling. Escape, close and backdrop clicks dismiss. Focus returns to the opener.
- **Bookmark persistence, `App`:** `swarmfeed.saved.v1` in local storage. Stored IDs are validated against actual posts; malformed or unavailable storage gets visible recovery text. Storage events keep tabs synchronized. Saving never changes a tweet's recorded likes.
- **Clipboard, `App`:** success follows the resolved browser API call. If denied or unavailable, a dialog provides the original X URL in a read-only selectable input.

There are no artificial loading screens because feed data is bundled. No likes, remote submissions or wallet interactions are simulated. No theme or localization variants are implemented.

Motion is restricted to 150ms background/color/border transitions using `cubic-bezier(.2,0,0,1)`, and a .96 press scale on primary/secondary/icon actions. These occur only under `prefers-reduced-motion: no-preference`. Hover rules are gated by hover capability. There is no autoplay or infinite animation. Forced-colors rules preserve system focus and control borders; rendered forced-colors behavior remains unverified.

## Do's and don'ts

- Start a new section inside `.page-shell`; reuse the existing grid edges, color roles and type tokens.
- Keep tweet quotations separate from editorial or source context. Keep counts tied to the recorded snapshot and retain a direct source link.
- Use the primary fill for the main action, and shape plus text/icon state for selections.
- Keep new input text at 16px on mobile and allow labels to grow. Use native buttons, links, inputs and dialogs.
- Do not add live-looking counters, fabricated accounts, sticky overlays, card shadows or a second icon family.
- For another view, reuse the feed heading, toolbar, `PostCard`, empty state and dialog shell. Add a new visual token only when the existing role cannot express the new component.

## Guidance attribution

Applied the pinned Better Interface reference by Jakub Krehel, commit `267330e1adfc66a718fb65fa6918c1f06d0a689e` (MIT). Documentation method adapted from Paul Bakaus's Impeccable, commit `9d715cc4f5564a990ca8345abfdd5df6dc9b41c8` (Apache-2.0). Both notices and license texts are retained in `docs/DESIGN-GUIDANCE-LICENSE.txt`.
