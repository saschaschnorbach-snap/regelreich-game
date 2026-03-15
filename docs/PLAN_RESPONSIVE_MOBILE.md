# Plan: Responsive & Mobile Redesign (Game Anna)

> *Estimated costs for executing this plan:*
> **Current Model**: ~25k input / ~8k output | **$0.08 – $0.15**
> **Auto Model**: (same token usage) | **$0.05 – $0.10**

---

## 1. Goals (from requirements)

| Goal | Description |
|------|-------------|
| **Background images** | Scale up/down with screen size; always **fully visible** (no cropping). |
| **Status bar** | Text and images (progress, badges, gear) scale with screen size. |
| **Mobile layout** | On mobile browser: dialog box in **bottom half**; **upper half** = full scaled background. |
| **Small phones** | Game usable on small mobile viewports, not only laptops. |

---

## 2. Current state (brief)

- **App shell**: `App.jsx` – fixed header (`.app__header`), main (`.app__main` with `padding-top`).
- **Status bar**: Progress label/value, progress bar, award badges, settings button – mostly fixed `rem`/px sizes; one breakpoint at **980px** reflows nav/progress.
- **Scene**: `Scene.jsx` + `SceneBackground.jsx` + `ChatPanel` in `.scene__chat-wrap`.
- **Background**: `SceneBackground` uses `background-size: cover` (or `contain` only for `einzelbuero_tablet` / Willkommen) → on narrow/tall viewports the image is cropped.
- **Chat/dialog**: `.scene__chat-wrap` is `position: absolute`, right side, `width: min(36vw, 520px)`, `min-width: 360px`. At **980px** it already moves to bottom with `height: min(68vh, 620px)` and full width – close to “bottom half” but not explicitly “top = background, bottom = dialog”.
- **Viewport**: No explicit “mobile” detection; layout is purely CSS breakpoint (980px).

---

## 3. Redesign options

### Option A: CSS-first (recommended baseline)

**Idea:** Achieve all goals with responsive CSS and one “mobile” breakpoint; no JS for layout.

- **Background “always fully visible”**  
  - In `SceneBackground.jsx` (or shared CSS): use `background-size: contain` (and `background-position: center`) for all scene backgrounds, or introduce a small variant (e.g. data-attr or class) so only specific scenes can use `cover` if needed.  
  - Ensure the scene container allows the image to show: e.g. give the background layer a defined area (flex or grid) so “upper half” on mobile is exactly 50vh (or 50% of main content area).

- **Status bar scaling**  
  - Replace fixed `rem`/px with **fluid typography** and **relative units**:  
    - `clamp(0.75rem, 2vw + 0.5rem, 1rem)` for labels, similar for values and icon size.  
    - Progress bar height and badge size in `em` or `clamp(...)` so they scale with font.  
  - Optional: use `transform: scale(...)` on a wrapper for the whole status bar, driven by a container query or `vw`, so everything scales together (simpler but can blur text if overdone).

- **Mobile = “top background, bottom dialog”**  
  - At a **mobile breakpoint** (e.g. `max-width: 640px` or `480px`):  
    - `.app__main` (or a new wrapper) becomes a **column flex**: **one child 50vh** (or `50%`) for the “scene/background” area, **one child 50vh** (or `50%`) for the dialog.  
    - `.scene` in the top half: `min-height: 100%` and `overflow: hidden`; `SceneBackground` fills that area with `background-size: contain` so the image is fully visible in the top half.  
    - `.scene__chat-wrap` in the bottom half: `position: static` (or relative), `width: 100%`, `height: 100%`, so the dialog occupies the bottom half and scrolls internally.  
  - Adjust `.scene__player-dock` so the avatar sits above the dialog (e.g. in the top-half area, bottom of that column) or overlaps the boundary with correct z-index.

**Pros:** No JS, works everywhere, good for performance and SEO.  
**Cons:** “Mobile” is defined by width only (e.g. narrow tablet in portrait might get same layout).

---

### Option B: CSS + mobile detection (optional refinement)

**Idea:** Keep Option A as the main layout, but add a **mobile-capability flag** (e.g. from `navigator.userAgent` or a simple touch-capability check) and set a **data attribute or class on `<html>` or `#root`** (e.g. `data-mobile="true"`).

- Use that in CSS: e.g. `[data-mobile="true"] .scene__chat-wrap { ... }` to force bottom-half layout even on wider viewports (e.g. when user resizes desktop to a narrow window but we still consider it “mobile”).
- Alternatively use the flag to switch between “desktop” and “mobile” layout variants (e.g. different breakpoints or different class on main container).

**Pros:** Can treat “phone browser” differently from “narrow desktop” if you want.  
**Cons:** User-agent is not 100% reliable; risk of layout flip on resize; more code paths to test.

---

### Option C: Container queries for status bar

**Idea:** Make the status bar scale with **its own container width** instead of viewport.

- Wrap the header content in a container and use `@container` (e.g. `container-type: inline-size`) so that font sizes, progress bar height, and badge size are defined with `cqw` or container query breakpoints.
- Combines well with Option A: viewport breakpoints for “mobile layout”, container queries for “dense header on small screens”.

**Pros:** Status bar scales cleanly when the header is narrow (e.g. when nav wraps).  
**Cons:** Slightly more complex CSS; browser support is good but worth noting for very old targets.

---

## 4. Recommended approach (concise)

1. **Adopt Option A** for:  
   - Background: **always fully visible** via `contain` (and optional class for rare `cover` scenes).  
   - Status bar: **fluid typography and relative sizing** (clamp + em/cqw).  
   - Mobile breakpoint (e.g. **640px or 480px**): **two-row layout** – top 50% = scene + background, bottom 50% = dialog; chat wrap full width, scrollable.

2. **Optionally add Option B** only if you need “mobile browser” vs “narrow desktop” behavior (e.g. different breakpoint or layout when `data-mobile="true"`).

3. **Optionally add Option C** later to make the status bar scale with header width instead of viewport.

---

## 5. Implementation checklist

### 5.1 Background always fully visible

- [ ] **SceneBackground.jsx** (or shared CSS): Default to `background-size: contain` and `background-position: center` for scene backgrounds. Optionally allow a prop/class for `cover` where design requires it.
- [ ] Ensure the scene container (e.g. `.scene` or the background wrapper) has a clear height (e.g. `height: 100%` in the mobile top-half so the image fits in 50vh).

### 5.2 Status bar scales with screen

- [ ] **index.css** (or dedicated header CSS):  
  - Progress label/value: use `clamp(0.7rem, 1.5vw + 0.5rem, 1rem)` (tune to taste).  
  - Progress bar: height in `em` (e.g. `0.5em`) or `clamp(0.35rem, 1.2vw, 0.6rem)`.  
  - Award badges: width/height in `em` or `clamp(...)` so they scale with header.  
  - Settings button: min-width/height in `em` or clamp so it stays tappable but scales down on small screens.
- [ ] Optionally wrap the header in a container and use **container queries** (Option C) for finer control.

### 5.3 Mobile: top = background, bottom = dialog

- [ ] Introduce a **mobile breakpoint** (e.g. `@media (max-width: 640px)` or `480px`).
- [ ] **Layout**:  
  - `.app__main` (or a wrapper around scene + chat) becomes `display: flex; flex-direction: column; height: 50vh` (or two children with `flex: 1 1 50%` and `min-height: 0` so they share space).  
  - First child: scene container; **only** the background (and optional player dock) in that area; `SceneBackground` with `contain` so the image is fully visible in this top half.  
  - Second child: dialog container (`.scene__chat-wrap` or a wrapper); `flex: 1 1 50%`, `min-height: 0`, `overflow: auto` so the chat scrolls inside the bottom half.
- [ ] **Scene.jsx**: Ensure DOM order or CSS (order / position) places the chat in the second flex child on mobile (might require a wrapper div or reordering for mobile only).
- [ ] **Player dock**: Position in the top-half area (e.g. bottom of first flex child) or with negative margin so it doesn’t cover the dialog; ensure z-index and touch targets are OK.
- [ ] Remove or relax `min-width` on `.scene__chat-wrap` on mobile so it doesn’t force horizontal scroll; use `width: 100%` and internal padding.

### 5.4 Mobile detection (optional, Option B)

- [ ] In **App.jsx** (or a small hook): On mount, set a “mobile” flag (e.g. narrow viewport + touch, or simple UA check for “Mobile”/“Android”/“iPhone”).
- [ ] Set `document.documentElement.dataset.mobile = 'true'` (or a class).
- [ ] Add CSS that uses `[data-mobile="true"]` (or `.mobile`) to apply the “bottom-half dialog” layout at a wider breakpoint if desired, or to adjust touch targets.

### 5.5 Testing and polish

- [ ] Test at 320px, 375px, 414px width (portrait) and at 640px–980px.
- [ ] Verify: background always fully visible; status bar readable and tappable; dialog in bottom half with scroll; no horizontal overflow.
- [ ] Check **MonitorActivityScene** and **start/transition screens**: same “contain” and mobile layout rules so they don’t break.

---

## 6. Files to touch (summary)

| File | Changes |
|------|--------|
| `src/components/scene/SceneBackground.jsx` | Default to `contain`; optional prop for `cover`. |
| `src/index.css` | Fluid typography/sizing for header; new mobile breakpoint; flex layout for main (top/bottom split); `.scene__chat-wrap` and `.scene__player-dock` overrides for mobile. |
| `src/App.jsx` | Optional: mobile detection and `data-mobile` on `<html>`. |
| `src/components/scene/Scene.jsx` | Optional: wrapper or class for mobile so chat is in the “bottom half” container (if structure needs to change). |

---

## 7. Breakpoint suggestion

- **Mobile layout (top/bottom split):** `max-width: 640px` (or `480px` for “small phone first”).  
- **Existing 980px:** Keep for header reflow (nav/progress stacking); can tune after testing so it doesn’t conflict with the new 640px rules.

This plan gives you a clear path to “background always visible”, “status bar scales”, and “on mobile: top = background, bottom = dialog”, with optional mobile detection and container queries for later refinement.
