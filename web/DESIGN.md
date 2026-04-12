# Design System Document: The Editorial Marketplace

## 1. Overview & Creative North Star
### The Creative North Star: "The Digital Curator"
To elevate a regional marketplace into a premium commercial experience, we move away from the cluttered "digital bazaar" look and toward **The Digital Curator**. This system prioritizes clarity, authority, and high-end editorial layouts. 

We break the "template" mold by utilizing **Intentional Asymmetry** and **Tonal Depth**. Instead of rigid, boxed-in grids, we use breathing room (whitespace) as a functional element. Large-scale typography acts as a structural anchor, while overlapping elements—such as product images breaking the bounds of their containers—create a sense of movement and modernity. The goal is to make the user feel they are browsing a high-end magazine that just happens to be a world-class marketplace.

---

## 2. Colors & Surface Philosophy
The palette is rooted in **Petroleum Blue (`primary`)** for authority and **Vibrant Orange (`secondary`)** for commercial energy. However, the sophistication lies in how we layer these tones.

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to define sections. Traditional dividers are forbidden. Boundaries must be defined through:
- **Background Color Shifts:** Transitioning from `surface` (#FAF8FF) to `surface-container-low` (#F2F3FF).
- **Subtle Tonal Transitions:** Using the hierarchy of surfaces to imply containment.

### Surface Hierarchy & Nesting
We treat the UI as a series of physical layers—stacked sheets of fine paper.
- **Level 0 (Base):** `background` (#FAF8FF) - The canvas.
- **Level 1 (Sections):** `surface-container-low` (#F2F3FF) - Wide sections to group content.
- **Level 2 (Cards/Modules):** `surface-container-lowest` (#FFFFFF) - Floating elements that demand attention.
- **Level 3 (Interactive):** `surface-container-highest` (#DAE2FD) - Active states or "pop-out" details.

### The "Glass & Gradient" Rule
To avoid a flat, "out-of-the-box" appearance:
- **Glassmorphism:** For floating navigation bars or filter overlays, use `surface` colors at 80% opacity with a `backdrop-blur` of 12px.
- **Signature Textures:** Use subtle gradients for Hero CTAs, transitioning from `primary` (#00376C) to `primary_container` (#1D4E89) at a 135-degree angle. This adds "soul" and prevents the UI from feeling sterile.

---

## 3. Typography
The system utilizes a dual-font strategy to balance character with readability.

*   **Display & Headlines (Plus Jakarta Sans):** Chosen for its modern, slightly geometric flair. Use `display-lg` and `headline-lg` with generous letter-spacing (-0.02em) to create an authoritative, editorial voice.
*   **Titles & Body (Inter):** The workhorse. Inter provides exceptional legibility for product descriptions and shop management interfaces.

**Hierarchy as Identity:**
- **Promotional Power:** Use `display-md` for seasonal sales, paired with `secondary` (#904D00) to grab immediate attention.
- **Information Density:** Use `body-md` for commerce data, ensuring a line-height of 1.5x to maintain a "premium" feel even in data-heavy shop owner dashboards.

---

## 4. Elevation & Depth
We convey hierarchy through **Tonal Layering** rather than structural lines.

*   **The Layering Principle:** Depth is achieved by "stacking." A `surface-container-lowest` card placed on a `surface-container-low` background creates a natural lift.
*   **Ambient Shadows:** For "floating" elements (like Modals or Cart Drawers), use ultra-diffused shadows: `box-shadow: 0 12px 32px -4px rgba(19, 27, 46, 0.08)`. The shadow color is a tint of `on_surface` to mimic natural light.
*   **The "Ghost Border":** If a border is required for accessibility, use `outline_variant` (#C3C6D1) at **20% opacity**. Never use a 100% opaque border.
*   **Corner Radii:** Use the `md` (0.75rem / 12px) scale for product cards and the `xl` (1.5rem / 24px) scale for hero containers to create a soft, inviting environment.

---

## 5. Components

### Buttons
- **Primary:** Gradient fill (`primary` to `primary_container`). `md` (12px) roundedness. Use `on_primary` text.
- **Secondary:** `secondary_container` (#FFA454) background with `on_secondary_container` (#713B00) text. No border.
- **Tertiary (Ghost):** No background. Text in `primary`. Underline only on hover.

### Input Fields
- **Container:** Use `surface_container_low`. On focus, transition background to `surface_container_lowest` and add a "Ghost Border" of `primary` at 40% opacity.
- **Labels:** Use `label-md` in `on_surface_variant`. Always positioned above the field, never floating inside.

### Cards & Lists
- **The Rule:** No divider lines. Separate list items using 16px of vertical white space or alternating backgrounds of `surface` and `surface-container-low`.
- **Commerce Cards:** Use `surface-container-lowest` with a `DEFAULT` (8px) radius. Product images should have a slight "overhang" or bleed to the edge to feel bespoke.

### Specialized Marketplace Components
- **Trust Badges:** Small chips using `surface_container_high` with `on_surface` text to denote "Verified Shop" or "Regional Seller."
- **Inventory Status:** Use `success` (#16A34A) for "In Stock" but apply it as a small dot or subtle text color—avoid large, loud green boxes.

---

## 6. Do's and Don'ts

### Do
- **Do** use white space to separate unrelated content.
- **Do** overlap elements (e.g., a product price tag slightly overlapping the product image).
- **Do** use `surface-dim` for "scrims" or background overlays to maintain the color story.
- **Do** prioritize the `primary` blue for headers to instill trust.

### Don't
- **Don't** use black (#000000) for shadows or text. Use `on_surface` (#131B2E).
- **Don't** use 1px solid borders to create "grids." Let the content breathe.
- **Don't** use the `secondary` orange for large background areas; it is a high-energy "action" color only.
- **Don't** use standard 4px "web-default" border radii. Stick to the `md` (12px) and `lg` (16px) tokens to maintain the high-end look.