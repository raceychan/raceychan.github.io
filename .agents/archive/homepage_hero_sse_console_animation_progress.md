# Feature: Homepage Hero SSE Console Animation

## Plan

### Technical Analysis
- Current homepage hero: `src/components/home/hero.tsx:175` renders a left column with title/CTA and a right column with a single `CodeBlock` showing SSE server code.
- Goal: Add an animated "frontend console" to the right side of the existing code block to simulate receiving SSE events in the browser console, matching the sequence provided:
  - `event: open`
  - `event: token\ndata: {"text":"Hello"}`
  - `event: token\ndata: {"text":" world"}`
  - `event: token\ndata: {"text":"!"}`
  - `event: close`
- Constraints: Keep styles consistent with current MUI usage and dark/light themes via `useColorMode`. Ensure mobile responsiveness: stack vertically on small screens.

### Proposed Solution
- Create a reusable React component `SSEConsole` at `src/components/home/SSEConsole.tsx`:
  - Props: `loop: boolean` (default true), `speedMs: number` (delay between lines, default 900ms).
  - Internals: an array of console lines, a `useEffect` that appends lines at intervals, auto-resets when `loop` is true. Use `Paper` + `Box` for a terminal-like look, with monospace font and subtle border.
  - Visuals: prefix `event:` lines with a colored badge, render `data:` JSON with slight syntax coloring. Provide a small control row ("Replay") optionally hidden on mobile.
- Integrate into Hero section:
  - In `src/components/home/hero.tsx`, wrap the right column contents in a responsive flex container; place the existing `CodeBlock` on the left and `SSEConsole` on the right.
  - On `md+` screens: two columns (e.g., `flex: 1 1 55%` code, `flex: 1 1 45%` console). On `xs`: stack with spacing.
- Accessibility/Perf: prefer CSS for blinking caret; keep animation state local and isolated; avoid heavy re-renders.

### Implementation Steps (pending approval)
1) Scaffold `src/components/home/SSEConsole.tsx` with the animation logic and theme-aware styles.
2) Update `src/components/home/hero.tsx` right column layout to render `CodeBlock` and `SSEConsole` side-by-side (responsive).
3) Tune timings and sizing to avoid layout shifts; ensure smooth overflow and scroll when lines exceed height.
4) Verify dark/light theme parity and mobile stacking; adjust paddings for consistency with `CodeBlock`.
5) Optional: add `Replay` button and ARIA attributes; ensure no console warnings.

### Success Criteria
- Hero's right area shows an animated console that prints the exact SSE sequence above, line by line.
- Animation loops smoothly (or provides replay) without jank; no layout shift.
- Works in both light and dark themes; matches the site's look-and-feel.
- Responsive: stacked on `xs`, side-by-side on `md+`.
- No errors in the browser console; Lighthouse accessibility unaffected.

### References
- Docusaurus pages: https://docusaurus.io/docs/creating-pages
- Styling & theme: https://docusaurus.io/docs/styling-layout
- MDX/code blocks (context): https://docusaurus.io/docs/markdown-features/code-blocks

## Implementation
2025-10-10
- Added animated SSE console component.
  - File added: `src/components/home/SSEConsole.tsx`
    - Props: `loop`, `speedMs`, `title`.
    - Animates lines: `event: open`, token/data pairs for Hello, world, !, then `event: close`.
    - Theme-aware styling via `useColorMode`; monospace font; minimal JSON highlighting.
    - Includes a Replay button and an animated cursor.
- Integrated into Hero section alongside code block.
  - Modified: `src/components/home/hero.tsx`
    - Right column now uses a responsive flex container with fixed height (xs: 300px, md: 360px).
    - Code block (`fixedHeight`) at ~55% width, SSE console at ~45% on md+; stacked on xs.
    - Updated `CodeBlock` title to `api/v1/agent.py` and passed content via `openai_example.code`.
- Added global keyframes for cursor blink.
  - Modified: `src/css/custom.css` → added `@keyframes sseBlink`.

2025-10-10 (Update: move below hero and letter-by-letter printing)
- Adjusted hero layout to restore full-width code block on the right column; removed in-hero console to avoid squeezing.
  - Modified: `src/components/home/hero.tsx` → removed `SSEConsole` and responsive split container.
- Added a new below-hero printing widget that types out longer sentences letter by letter (not a console UI).
  - File added: `src/components/home/SSEPrinter.tsx` with props `text`, `charDelayMs`, `loop` and a Replay button.
  - Integrated on homepage below the hero:
    - Modified: `src/pages/index.tsx` → import and render `<SSEPrinter />` inside a `Container` right after `<HeroSection />`.

2025-10-10 (Refinement: disable auto replay, SSE popover)
- Changed default behavior to not auto-replay the printer.
  - Modified: `src/components/home/SSEPrinter.tsx` → default `loop={false}`.
- Added a top-right widget to reveal the actual SSE events used to produce the printed text.
  - `SSEPrinter` now includes a Terminal icon opening a Popover listing lines:
    - `event: open`, repeated `event: token` + `data: {"text":...}` entries, and `event: close`.
  - Replaced deprecated `PaperProps` with `slotProps.paper` on Popover; set `maxHeight: 800` and `overflow: auto` to constrain size and enable scrolling.

Validation checklist:
- [x] Animation loops smoothly without layout shift
- [x] Works in light/dark themes
- [x] Responsive layout on xs/md+
- [x] No SSR errors; effect runs client-side only

## Experience (notes during/after implementation)
2025-10-10
- Kept the console animation state isolated to avoid re-rendering the hero parent; used `setTimeout` sequencing for precise pacing.
- Added a small JSON tokenizer for simple syntax color without heavy libraries.
- Introduced a global `@keyframes` in `src/css/custom.css` to keep cursor animation simple and reliable across themes.
2025-10-10
- Based on feedback, switched from a Chrome-like console to a simple “printing” surface with letter-by-letter typing to better convey streaming feel.
- Placed the printer under the hero to preserve code block space and improve readability on mobile.
