# Performance Improvements Plan

Based on Lighthouse audit findings. Work through these in priority order.

---

## 1. Dynamic Imports (Biggest impact — bundle reduction + LCP + user timings)

- [x] Lazy-load `LineGraph` in `app/build/[id]/page.tsx` using `next/dynamic` with `ssr: false`
- [x] Lazy-load `ChatPanel` in `app/build/[id]/page.tsx` using `next/dynamic` with `ssr: false`

**Why:** `recharts` (~400 KiB) and AI chat code are bundled into the initial JS payload. Deferring them removes the bulk of the unused JS Lighthouse flagged (836 KiB est. savings). Also eliminates the 4,236 recharts `performance.mark()` user timing noise.

---

## 2. Debounce API Effects (Fixes long main-thread tasks)

- [x] Debounce the `syncBlocks` `useEffect` in `app/build/[id]/page.tsx` (500ms delay)
- [x] Debounce the `calculateMetrics` `useEffect` in `app/build/[id]/page.tsx` (500ms delay)

**Why:** Both effects fire on every block/settings change, meaning every keystroke triggers 2 simultaneous API calls. Lighthouse flagged 2 long main-thread tasks — these are the source.

---

## 3. Reserve Graph Container Height (Fixes layout shift + forced reflow)

- [ ] Give the graph wrapper div in `app/build/[id]/page.tsx` an explicit `min-h` so space is reserved before recharts measures the DOM
- [ ] Pass an explicit `height` number to `ResponsiveContainer` in `LineGraph.tsx` instead of relying on CSS `flex-1` measurement

**Why:** `ResponsiveContainer` reads `offsetWidth`/`offsetHeight` on mount, forcing a layout reflow. No reserved space = layout shift.

---

## 4. Remove Debug console.logs (Minor perf + cleanliness)

- [x] Guard `console.log` in `syncBlocks` behind `NEXT_PUBLIC_DEBUG_LOGS === "true"` check
- [x] Guard `console.log` in `calculateMetrics` behind `NEXT_PUBLIC_DEBUG_LOGS === "true"` check
- [x] Document `NEXT_PUBLIC_DEBUG_LOGS` in `.env.example`

**Why:** These run on every block change in production, serializing large objects to the console on every keystroke.

---

## 5. bfcache Fix (Back/forward cache restoration)

- [ ] Audit `app/build/[id]/page.tsx` for any pending async work on unmount (ensure `autoSave` effect has proper cleanup)
- [ ] Confirm no `beforeunload` listeners are attached anywhere in the component tree

**Why:** Lighthouse flagged 1 bfcache failure reason. Pages with pending fetch calls or `beforeunload` listeners are blocked from bfcache. Likely resolves after debouncing reduces in-flight requests.

---

## 6. Modern Browser Targeting (8 KiB savings — low priority)

- [ ] Add `browserslist` config to `package.json` targeting modern browsers only (drop IE 11 / old Safari)

**Why:** Next.js may be transpiling legacy syntax unnecessarily. Small savings but easy win.
