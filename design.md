# 🎨 Design System: World Cup 2026 Tracking Application

*Author: Principal Designer*

---

## 1. Design Philosophy
Our goal is to build an immersive, content-first interface that channels the electric atmosphere of the World Cup while maintaining a premium, clean, and highly readable experience. The design avoids overwhelming tabular interfaces by grouping data into card-based widgets with modern visual aesthetics: smooth gradients, subtle depth, high contrast accessibility, and responsive density.

---

## 2. Design Token Inventory
These core design tokens are defined in `src/app/globals.css` to drive the application's look and feel:

### 2.1 Color Palette
We utilize a tailored slate/indigo theme with a high-contrast dark default state.

```
Light Theme Colors:
  --background: #f8fafc (Slate 50)
  --foreground: #0f172a (Slate 900)
  --card-bg: rgba(255, 255, 255, 0.7)
  --card-border: rgba(15, 23, 42, 0.08)
  --primary: #4f46e5 (Indigo 600)
  --text-muted: #64748b (Slate 500)

Dark Theme Colors (Default):
  --background: #0b0f19 (Rich Dark Slate)
  --foreground: #f8fafc (Slate 50)
  --card-bg: rgba(15, 23, 42, 0.6)
  --card-border: rgba(255, 255, 255, 0.08)
  --primary: #6366f1 (Indigo 500)
  --text-muted: #94a3b8 (Slate 400)
```

### 2.2 Typography
*   **Font Family**: `Outfit`, sans-serif (imported from Google Fonts).
*   **Weights**:
    *   `300`: Light (labels, metadata)
    *   `400`: Regular (body text)
    *   `600`: Semi-Bold (subheadings, card titles)
    *   `800`: Extra-Bold (hero headings, numbers)

### 2.3 Spacing, Borders, & Shadows
*   **Base Spacing**: Multiples of 8px (gaps are generally 16px or 24px).
*   **Border Radius**: `16px` for cards (`--radius-card`), `8px` for badges/buttons.
*   **Elevation**:
    *   Glassmorphism card shadow: `0 8px 32px 0 rgba(0, 0, 0, 0.2)`
    *   Card backdrop filter: `blur(12px)`

---

## 3. Component Catalog

*   **Glass Panel (Card Container)**: The fundamental layout element. Uses backdrop-filter blur and semi-transparent backgrounds with a subtle border to create depth.
*   **Match Results Card**: Highlights scores in extra-bold typography. The winning team's text color is styled as `font-weight: 600`, while the losing team is set to a muted opacity.
*   **Daily Schedule Row**: Shows upcoming match times. Contains a "Live Soon" pulse badge when kickoff is imminent.
*   **Group Standings Table**: Structured grid featuring team logos, stats (played, won, points), and visual separators.
*   **Highlights Carousel**: Horizontal scrolling media gallery holding YouTube video embeds with rounded corners and consistent aspect ratios (`16 / 9`).

---

## 4. Layout Architecture & Responsiveness
The dashboard uses a 1200px maximum width container centered on the screen.
*   **Grid System**: We avoid fixed columns. The dashboard uses CSS Grid:
    ```css
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    ```
    This automatically changes from a 3-column layout on desktop to a single column on mobile.
*   **Breakpoints**:
    *   Mobile: `< 640px` (single column, full width padding)
    *   Tablet: `640px` to `1024px` (dual columns)
    *   Desktop: `> 1024px` (three columns, max 1200px width)

---

## 5. Theming & Theme Switching
The application is **Dark Mode first**. The theme is switched via the `ThemeProvider` context using a CSS class (`.light` or `.dark`) attached to the `<html>` or `<body>` element.
To prevent the "light-flash" during server-side hydration:
1.  The `ThemeProvider` checks local storage and matches user preferences.
2.  Transitions are disabled on initial render and enabled afterwards via a smooth 0.3s transition:
    ```css
    transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
    ```

---

## 6. Accessibility (a11y) Audit & Remediation

### 6.1 Current Audit Gaps
*   **ARIA Labels**: The only `aria-label` present is on the theme toggle button.
*   **Keyboard Navigation**: Tab indexing on cards and video carousel needs refinement. Focus outlines are currently suppressed.
*   **Color Contrast**: The muted text color (`--text-muted`) in light mode (`#64748b` on `#f8fafc`) has a contrast ratio of ~4.1:1, which falls short of the WCAG AA minimum of 4.5:1 for small text.
*   **Semantic HTML**: Standings tables are structured with divs instead of `<table>` elements, preventing screen readers from navigating the table structure natively.

### 6.2 Remediation Plan
1.  **Contrast Fix**: Adjust light mode `--text-muted` to `#475569` (Slate 600) to achieve a safe 5.2:1 contrast ratio.
2.  **Focus States**: Ensure focus outline transitions are visible when using keyboard navigation (`:focus-visible`).
3.  **Semantic Standings**: Refactor `GroupStandings` component to use semantic `<table>`, `<thead>`, `<tbody>`, `<th>`, and `<td>` markup.
4.  **Descriptive Labels**: Add `aria-label` and `aria-live` regions for live score updates and form inputs.

---

## 7. Known Design Debt
1.  **Unused Next.js Boilerplate**: `src/app/page.module.css` is still present and contains unused Next.js styles. It should be deleted.
2.  **Scattered Inline Styles**: Clean up remaining inline styles (e.g. `style={{ width: ... }}` or padding) into clean reusable CSS utility classes in `globals.css`.
