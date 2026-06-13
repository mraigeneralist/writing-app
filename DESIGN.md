# DESIGN.md

The visual and interaction system for Loom. Read this before building any UI.
Mirror these tokens into `tailwind.config` and a small set of CSS variables so
light and dark mode both work from one source.

## Principles

- **Calm and writerly.** This is a tool for thinking and writing, not a
  dashboard. Generous whitespace, quiet color, text takes center stage.
- **Flat.** No gradients, no drop shadows beyond a hairline focus ring, no
  decorative glows. Surfaces are separated by 1px borders and spacing.
- **Two type personalities.** A serif for everything the user *reads and writes*
  (note bodies, document prose, focus mode). A sans for *interface* chrome
  (labels, buttons, nav, metadata).
- **Mobile and desktop are equal citizens.** Design every screen to work at
  ~380px and scale up. Touch targets ≥ 44px.

---

## Color

Define as CSS variables; Tailwind reads them. Every token has a light and dark
value. Background is warm paper, not stark white.

| Token            | Light      | Dark       | Use                              |
| ---------------- | ---------- | ---------- | -------------------------------- |
| `--bg`           | `#FAF9F6`  | `#16151A`  | page background                  |
| `--surface`      | `#FFFFFF`  | `#211F26`  | cards, inputs, editor sheet      |
| `--surface-2`    | `#F2F0EA`  | `#2A2832`  | sidebars, secondary fills        |
| `--border`       | `#E7E4DC`  | `#34323C`  | hairline borders (1px)           |
| `--text`         | `#1C1B19`  | `#ECEAE3`  | primary text                     |
| `--text-2`       | `#6B6A66`  | `#A6A39B`  | secondary / metadata             |
| `--text-3`       | `#9A988F`  | `#75736C`  | hints, placeholders              |
| `--accent`       | `#5B57C7`  | `#8B86E6`  | primary action, links, selection |
| `--accent-soft`  | `#ECEBFA`  | `#2E2B52`  | accent tint (idea bubbles)       |
| `--focus-warn`   | `#C2603B`  | `#E0805C`  | focus-mode timer + fade warning  |

Use `--accent` sparingly — a single confident action color. Most of the UI is
neutral.

## Category color palette (fixed swatches)

Users pick a category color from this set only (keeps the board harmonious).
Store the base hex on the category. Derive the pill: background = base at ~14%
opacity in light / ~22% in dark; text = base shifted darker (light) or the base
itself (dark). Always pair a colored pill background with text from the *same*
hue — never plain black/gray on a colored fill.

```
slate     #64748B
indigo    #6366F1
teal      #14B8A6
green     #22A06B
amber     #D9920B
terracotta#C2603B
rose      #D6537E
plum      #8B5CF6
```

---

## Typography

Load from Google Fonts (free).

- **Serif (reading/writing):** "Source Serif 4", Georgia, serif
- **Sans (interface):** "Inter", system-ui, sans-serif
- **Weights:** 400 and 500 only. Never 600/700 — it reads heavy here.

| Role                    | Family | Size | Line height |
| ----------------------- | ------ | ---- | ----------- |
| Document / note prose   | serif  | 18px | 1.7         |
| Focus mode text         | serif  | 19px | 1.7         |
| UI body                 | sans   | 15px | 1.5         |
| Labels / metadata       | sans   | 13px | 1.4         |
| Section titles          | sans   | 17px / weight 500 |   |
| Screen titles           | sans   | 22px / weight 500 |   |

Sentence case everywhere. Never Title Case, never ALL CAPS.

## Spacing, radius, motion

- Spacing scale (px): 4, 8, 12, 16, 24, 32, 48.
- Radius: cards & editor sheet `12px`; inputs & buttons `8px`; pills/chips
  `999px`. No rounded corners on single-side borders.
- Borders: always `1px solid var(--border)`.
- Motion: 120–180ms ease for hovers/taps. The only slow transition in the app is
  the focus-mode fade (see below).
- Icons: a single outline icon set (e.g. Tabler/Lucide). 18–20px inline.

---

## Components

- **Note card** — `--surface`, 1px border, radius 12, padding 14px.
  Top-left: category pill (colored). Body: 2–4 lines of the note (serif, 15px on
  the board). Footer: small source line (`book · author · location`, `--text-3`)
  and a tags row (neutral chips). Cards sit in a responsive grid that wraps from
  1 column (mobile) to 3 (desktop).
- **Filter chip** — pill. Default: bordered, `--text-2`. Selected: filled with
  `--text`, label in `--bg`. Show a count, e.g. `notes · 3`.
- **Category combobox** — a text input. As the user types it filters existing
  categories (shown with their color dot). If no exact match, the last row is
  "create '<typed text>'" which opens a small color picker (the 8 swatches).
  Selected state shows the colored pill inside the field.
- **Idea bubble** — right-aligned, `--accent-soft` background, `--text` color,
  radius 12, max-width ~78%. Timestamp below in `--text-3`, 11px.
- **Bottom nav (mobile)** — 3 tabs: ideas, notes, write. Icon + 11px label.
  Active tab uses `--accent`. On desktop, promote to a left rail or top bar.
- **Buttons** — primary: filled `--accent`, text `--bg`. Secondary: bordered,
  transparent fill, `--text`. Active state `scale(0.98)`.
- **Inputs** — `--surface` fill, 1px border, radius 8, 44px tall on mobile;
  focus ring = 2px `--accent` at ~40% opacity.

---

## Surface-by-surface UX

### Ideas (capture)

A vertical chat thread, newest at the bottom, auto-scrolled. A single text input
pinned to the bottom with a send action; pressing send appends a bubble with a
timestamp and clears the field. No title, no category, no friction. Each bubble
has a quiet overflow action: **promote to note** (opens the note form
pre-filled with the idea body) and **archive**. (Voice capture is a later
addition — leave room for a mic affordance in the input bar but don't build it.)

### Notes (organize)

A card board. Top: a row of filter chips (`all` + one per category, each with a
count) and a search field that does case-insensitive matching on body, source,
and tags. Below: the responsive card grid. A prominent "new note" action opens
the **note form**: a serif body field (placeholder nudges "in your own words"),
three small source fields (title, author, location), the **category combobox**,
and a tags input. Saving drops a new card onto the board.

### Write (create)

Two views.
- **Library** — a list (not cards) of documents: title, a one-line snippet,
  category pill, word count, and last-edited time. Sortable by recent. A "new
  document" action.
- **Editor** (`/write/:id`) — a centered serif writing sheet on `--surface`,
  comfortable measure (~680px max line length), minimal toolbar (bold, italic,
  heading, list, quote, link). A collapsible **notes sidebar** on the right
  (a drawer on mobile): searchable list of the user's note cards, each with an
  **insert** action that drops the note's text into the document at the cursor
  as a blockquote with its source. Autosave the TipTap JSON to `documents.content`
  and recompute `word_count`.

### Focus mode (the "most dangerous" sprint)

Entered as a toggle from the editor.
1. **Start screen** — pick a duration (3 / 5 / 10 / 15 / 20 min). Show a clear
   warning: *if you stop typing for 3 seconds, your text fades and is erased.*
2. **Running** — full-bleed serif writing area, distractions hidden. A small
   timer counts down `mm:ss` in `--focus-warn`. Every keystroke resets a 3000ms
   idle timer.
3. **Idle fires (3s of no typing)** — apply `transition: opacity 2400ms linear`
   and animate the text to `opacity: 0`; show a subtle warning cue.
4. **Recovery** — any keystroke during the fade cancels it and snaps opacity
   back to 1 instantly.
5. **Fade completes** — clear the editor content. The sprint is gone. (That is
   the point — it forces forward motion.)
6. **Timer reaches 0** — stop the fade mechanic, reveal the surviving text, and
   offer to save it into a document.

Implementation notes: drive the fade with CSS opacity on the editor container,
not by deleting characters. Keep two timers (idle → start-fade, then
fade-duration → clear) and clear both on every input event. Show a one-time
confirmation before the first sprint so erasure is never a surprise. Honor
`prefers-reduced-motion` by shortening the fade, but keep the erase behavior —
it is the core feature.