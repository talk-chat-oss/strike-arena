---
name: kinetic
description: >-
  Kinetic design system skill for AI coding agents. Dense technical design
  system with JetBrains Mono typography, kinetic yellow primary brand (#FFDC2B),
  deep navy foreground accents (#133865), flat uniform surfaces (#F6F6FC /
  #FFFFFF), compact 4px geometry, and borderless lifted cards. Use when building
  or styling UI, dashboards, forms, components, or layouts in the Kinetic style.
metadata:
  author: typeui.sh
---

<!-- TYPEUI_SH_MANAGED_START -->
# Kinetic Design System Skill (Universal)

## Mission
You are an expert design-system guideline author and UI engineer for **Kinetic**.
Create practical, implementation-ready UI and guidance that can be directly used by engineers and designers.

## Brand
Kinetic is a dense, technical design system built for interfaces that need speed, clarity, and operational focus. It pairs **JetBrains Mono** typography across all text tiers with a **kinetic yellow** primary brand (`#FFDC2B`), **deep navy** foreground accents (`#133865`), flat uniform surfaces (`#F6F6FC`), borderless lifted cards (`#FFFFFF`), and compact `4px` geometry.

The system avoids softness and visual clutter. Every section shares one uniform surface (`--color-neutral-secondary-soft: #F6F6FC`), cards lift through a lighter derivative of that surface (`--color-neutral-primary-soft: #FFFFFF`) without drop shadows or borders, and inputs read through contrasting fills and crisp `1px` structural borders (`#DDDDE8`). Separators are precise hairlines, not heavy rules, and the brand focus ring (`4px` `#FCE588` / `2px` `#FFDC2B`) makes active states feel sharp and deliberate.

Use Kinetic for engineering dashboards, sports/manager control planes, trading and finance tools, logistics products, infrastructure interfaces, command centers, data-heavy SaaS, and operations screens that should feel fast, technical, and controlled.

## Style Foundations
- **Visual style:** Dense, technical, flat, high-clarity operational UI
- **Typography scale:** `11 / 12 / 14 / 16 / 18 / 20 / 22 / 25 / 28 / 32 / 36 / 40 / 45 / 72` (`px`) | **Fonts:** `primary=JetBrains Mono`, `display=JetBrains Mono`, `mono=JetBrains Mono` | **Weights:** `400, 500, 600, 700`
- **Color palette:** Kinetic Yellow brand ramp, Deep Navy accents, cool-tinted neutral surfaces, semantic status hues (`success`, `warning`, `danger`)
- **Spacing scale:** `4px` base (`2 / 4 / 6 / 8 / 10 / 12 / 16 / 20 / 24 / 28 / 32 / 36 / 40 / 44 / 48 / 56 / 64 / 80 / 96` `px`)
- **Corner geometry:** `0px` (none), `1px` (`xs` chips/checkboxes), `2px` (`sm` compact controls/keys), `4px` (`xxl` standard buttons, inputs, cards, panels, modals), `8px` (`xxxl` hero mockup shells), `9999px` (`full` pills, badges, toggles, radios)

## Design Tokens (CSS Custom Properties)

```css
:root {
  /* Typography & Text Colors */
  --color-heading: #0e1312;
  --color-body: #3d4543;
  --color-body-subtle: #6b726f;
  --color-white: #ffffff;
  --color-fg-disabled: #9aa09e;

  /* Brand & Accent Foregrounds (Deep Navy) */
  --color-fg-brand: #133865;
  --color-fg-brand-strong: #0c2546;
  --color-fg-brand-subtle: #c7d4e4;
  --color-dark: #133865;
  --color-dark-soft: #1c4d8a;
  --color-dark-strong: #0c2546;

  /* Primary Brand Ramp (Kinetic Yellow) */
  --color-brand: #ffdc2b;
  --color-brand-softer: #fff8db;
  --color-brand-soft: #ffefae;
  --color-brand-medium: #fce588;
  --color-brand-strong: #d4a017;

  /* Surfaces & Neutrals */
  --color-neutral-primary-soft: #ffffff;     /* Lifted cards, modals, controls */
  --color-neutral-secondary-soft: #f6f6fc;   /* Uniform page & section canvas */
  --color-neutral-secondary-medium: #f6f6fc;
  --color-neutral-tertiary: #ececf4;         /* Subtle fills, hover states, code/terminal blocks */
  --color-neutral-tertiary-soft: #ececf4;
  --color-neutral-tertiary-medium: #ececf4;
  --color-neutral-quaternary: #dddde8;       /* Dots, subtle structural accents */
  --color-gray: #c7c7d3;
  --color-disabled: #ececf4;

  /* Borders */
  --color-border-default: #dddde8;
  --color-border-default-medium: #dddde8;
  --color-border-brand-subtle: #fce588;

  /* Status Tokens (State only, never decoration) */
  --color-fg-success: #15803d;
  --color-success: #15a34a;
  --color-success-soft: #ecfdf3;

  --color-fg-warning: #7c2d12;
  --color-warning: #f97316;
  --color-warning-soft: #fffaeb;

  --color-fg-danger: #c81e1e;
  --color-danger: #be123c;
  --color-danger-soft: #fff1f2;

  /* Border Radius */
  --radius-none: 0;
  --radius-xs: 1px;
  --radius-sm: 2px;
  --radius-xxl: 4px;
  --radius-xxxl: 8px;
  --radius-full: 9999px;

  /* Typography */
  --font-family: "JetBrains Mono", ui-monospace, "SFMono-Regular", Menlo, Monaco, Consolas, monospace;
  --font-size-xxs: 0.6875rem; /* 11px */
  --font-size-xs: 0.75rem;    /* 12px */
  --font-size-sm: 0.875rem;   /* 14px - default body */
  --font-size-md: 1rem;       /* 16px */
  --font-size-lg: 1.125rem;   /* 18px */
  --font-size-xl: 1.25rem;    /* 20px */
  --font-size-2xl: 1.375rem;  /* 22px */
  --font-size-3xl: 1.5625rem; /* 25px */
  --font-size-4xl: 1.75rem;   /* 28px */
  --font-size-5xl: 2rem;      /* 32px */
  --font-size-6xl: 2.25rem;   /* 36px */
  --font-size-7xl: 2.5rem;    /* 40px */
  --font-size-8xl: 2.8125rem; /* 45px */
  --font-size-hero: 4.5rem;   /* 72px */

  --line-height-display: 1;
  --line-height-heading: 1.3;
  --line-height-component: 1.3;
  --line-height-body: 1.5;
  --line-height-code: 1.5;

  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  --letter-spacing-tight: -0.5px;

  /* Spacing (4px base grid) */
  --spacing-0-5: 0.125rem; /* 2px */
  --spacing-1: 0.25rem;    /* 4px */
  --spacing-1-5: 0.375rem; /* 6px */
  --spacing-2: 0.5rem;     /* 8px */
  --spacing-2-5: 0.625rem; /* 10px */
  --spacing-3: 0.75rem;    /* 12px */
  --spacing-4: 1rem;       /* 16px */
  --spacing-5: 1.25rem;    /* 20px */
  --spacing-6: 1.5rem;     /* 24px */
  --spacing-7: 1.75rem;    /* 28px */
  --spacing-8: 2rem;       /* 32px */
  --spacing-10: 2.5rem;    /* 40px */
  --spacing-12: 3rem;      /* 48px */
  --spacing-16: 4rem;      /* 64px */
  --spacing-20: 5rem;      /* 80px */
  --spacing-24: 6rem;      /* 96px */

  /* Interaction */
  --focus-ring: 0 0 0 4px var(--color-brand-medium);
  --control-height: 2.5rem;
}
```

## Component Specifications

### 1. Actions (Buttons & Button Groups)
- **Geometry & Sizing:** `border-radius: 4px` (`--radius-xxl`), `font-size: 14px` (`--font-size-sm`), `font-weight: 500`, `gap: 6px`.
  - Small (`.btn--sm`): `min-height: 36px` (`2.25rem`), `padding: 8px 12px`, `14px` icons.
  - Base (`.btn`): `min-height: 44px` (`2.75rem`), `padding: 10px 16px`, `16px` icons.
  - Large (`.btn--lg`): `min-height: 48px` (`3rem`), `padding: 12px 20px`, `font-size: 16px`.
- **Variants:**
  - **Primary:** `background: #FFDC2B`, `color: #0E1312`, transparent border. Hover: `background: #D4A017`.
  - **Secondary:** `background: #FFFFFF`, `color: #3D4543`, `border: 1px solid #DDDDE8`. Hover: `background: #ECECF4`, `color: #0E1312`.
  - **Outline Brand:** `background: transparent`, `color: #133865`, `border: 1px solid #FFDC2B`. Hover: `background: #FFDC2B`, `color: #0E1312`.
  - **Ghost:** `background: transparent`, `color: #3D4543`. Hover: `background: #ECECF4`, `color: #0E1312`.
  - **Dark:** `background: #133865`, `color: #FFFFFF`. Hover: `background: #0C2546`.
- **Icon Buttons:** Square `40px × 40px`, `border: 1px solid #DDDDE8`, `border-radius: 4px`, `background: #FFFFFF`, `18px` glyph, no text label (must include `aria-label`).
- **Button Groups / Segmented Controls:** Single outer container (`border: 1px solid #DDDDE8`, `border-radius: 4px`, `overflow: hidden`) with `1px` internal inline dividers (`#DDDDE8`). Active segment (`aria-pressed="true"`) uses `background: #FFDC2B`, `color: #0E1312`.

### 2. Forms (Inputs, Selects, Textareas, Steppers, OTP, Range)
- **Field Shell:** `background: #FFFFFF`, `border: 1px solid #DDDDE8`, `border-radius: 4px`, `padding: 12px 14px`, `font-size: 14px`, `color: #0E1312`, placeholder `#6B726F`.
- **Focus State:** `border-color: #FFDC2B`, `box-shadow: 0 0 0 4px color-mix(in srgb, #FFDC2B 45%, transparent)`, `outline: none`.
- **Validation States:**
  - Error: `border-color: #BE123C`, focus ring `4px` `color-mix(in srgb, #BE123C 45%, transparent)`, helper message with warning icon in `#C81E1E`.
  - Success: `border-color: #15A34A`, helper message with check icon in `#15803D`.
  - Disabled: `opacity: 0.5`, `cursor: not-allowed`.
- **OTP / Verification Input:** `44px × 44px` square cells, `font-variant-numeric: tabular-nums`, `font-size: 18px`, `gap: 8px`.

### 3. Selection (Checkbox, Radio, Toggle)
- **Checkbox:** `16px × 16px`, `border-radius: 1px` (`--radius-xs`), `border: 1.5px solid #DDDDE8`. Checked: `background: #FFDC2B`, `border-color: #FFDC2B`, dark stroke checkmark (`#0E1312`).
- **Radio:** `16px × 16px`, `border-radius: 999px`, `border: 1.5px solid #DDDDE8`. Checked: `border-color: #D4A017` with `#FFDC2B` inner dot.
- **Toggle Switch:** Pill track `40px × 22px` (`border-radius: 9999px`, `padding: 2px`), unchecked `background: #6B726F`, checked `background: #FFDC2B`, white `18px` thumb translating `18px`. Commits immediately without a save button.

### 4. Feedback (Alerts, Badges, Tooltips)
- **Rule:** Status color means state, never decoration. Color never carries meaning alone—always pair with an icon and explicit text.
- **Alerts:** In-flow banners (`border-radius: 4px`, `padding: 16px`, `gap: 12px`, `font-size: 14px`) with `1px` tonal `color-mix` border:
  - Info/Brand: `background: #FFF8DB`, `color: #0C2546`
  - Success: `background: #ECFDF3`, `color: #15803D`
  - Warning: `background: #FFFAEB`, `color: #7C2D12`
  - Danger: `background: #FFF1F2`, `color: #C81E1E`
- **Badges:** Compact status pills (`border-radius: 9999px` or `4px` in dense tables, `padding: 2px 6px` or `3px 9px`, `font-size: 12px`, `font-weight: 500`) using soft semantic fills (`#FFF8DB`, `#ECFDF3`, `#FFFAEB`, `#FFF1F2`, `#ECECF4`) and tonal `1px` borders.

### 5. Navigation (Header, Breadcrumbs, Tabs, Pagination)
- **Sticky Header:** `background: #F6F6FC`, `min-height: 56px`, compact nav links (`12px`, `padding: 6px 8px`, `border-radius: 4px`) with optional keyboard shortcut badges (`18px × 18px`, `2px` radius, `background: #ECECF4`, `color: #133865`, `11px` bold).
- **Tabs:**
  - Filled Tabs: `min-height: 42px`, `padding: 10px 16px`, `border-radius: 4px`. Selected (`aria-selected="true"`): `background: #FFDC2B`, `color: #0E1312`.
  - Underline Tabs: Bottom border `1px solid #DDDDE8`, active tab has `2px solid #FFDC2B` bottom indicator and `color: #133865`.

### 6. Surfaces & Data Display (Cards, Tables, Code Panels, Accordions)
- **Cards:** Lifted flat surface (`background: #FFFFFF`) on `#F6F6FC` page canvas, `border-radius: 4px` (`--radius-xxl`), `padding: 24px` (`--spacing-6`), no resting drop shadow, no outer border.
- **Tables:** `background: #FFFFFF`, `border: 1px solid #DDDDE8`, `border-radius: 4px`, `border-collapse: collapse`. Headers: `12px` uppercase, `letter-spacing: 0.04em`, `color: #6B726F`, `padding: 12px 16px`, `border-bottom: 1px solid #DDDDE8`. Cells: `14px`, `padding: 12px 16px`, `white-space: nowrap`, `border-bottom: 1px solid #DDDDE8`.
- **Code & Terminal Panels:** Split or stacked `4px`-radius containers. Code pane uses `#FFFFFF` with `#133865` keywords, `#1C4D8A` functions, and `#15803D` strings; terminal output pane uses `#ECECF4`.

### 7. Overlays (Modal & Drawer)
- **Scrim:** `background: rgba(0, 0, 0, 0.45)` (`#00000073`), `position: fixed; inset: 0`. Closes on `Escape` or outside click.
- **Modal:** `width: min(440px, 100vw - 32px)`, `background: #FFFFFF`, `border: 1px solid #DDDDE8`, `border-radius: 4px`, `padding: 24px`.
- **Drawer:** Right-docked (`width: min(360px, 100vw)`), `background: #FFFFFF`, `border-left: 1px solid #DDDDE8`, `padding: 24px`.

## Accessibility
- **Standard:** WCAG 2.2 AA compliance across all surfaces.
- **Keyboard-first interactions:** Visible focus states are mandatory (`--focus-ring: 0 0 0 4px #FCE588` or `2px solid #FFDC2B` with `2px–3px` offset) and must never be removed.
- **Reduced motion:** Respect `@media (prefers-reduced-motion: reduce)` by disabling sweep/marquee animations.
- **Semantic states:** Never rely on color alone for status; always pair status colors with icons and descriptive text labels.

## Writing Tone
Concise, technical, confident, operational, direct. Avoid marketing fluff; state metrics, actions, and constraints plainly.

## Rules: Do
- Use `JetBrains Mono` across headings, body, controls, and numeric data (`font-variant-numeric: tabular-nums` for metrics and codes).
- Keep the page canvas uniform (`#F6F6FC`) and lift cards via `#FFFFFF` fill with `4px` corners (`--radius-xxl`).
- Pair Kinetic Yellow (`#FFDC2B`) primary fills with dark ink text (`#0E1312`) for high contrast, and use Deep Navy (`#133865`) for brand links, inline accents, and secondary dark actions.
- Keep spacing strictly on the `4px` base scale.
- Design explicit default, hover, focus-visible, active, disabled, loading, and error states for every interactive control.

## Rules: Don't
- Do not add resting drop shadows to cards, inputs, or sections.
- Do not use large rounded corners (`12px+`) on cards, buttons, or inputs; box shells must stay at `4px` (`--radius-xxl`), reserving `9999px` strictly for semantic pills, badges, toggles, and radios.
- Do not use status colors (`success`, `warning`, `danger`) for decorative flair.
- Do not place white text on `#FFDC2B` (Kinetic Yellow); always use `#0E1312` on yellow surfaces.
- Do not hide field constraints (like file size or format limits) inside tooltips; place them in visible helper text.

## Quality Gates
- All colors, radii, font sizes, and spacing values map to defined Kinetic tokens.
- Primary buttons and active tabs pass contrast checks (`#0E1312` on `#FFDC2B`).
- Every interactive element has a visible `:focus-visible` indicator and minimum `36px–44px` hit target.
- Layout remains dense, scannable, and free of decorative clutter or unrequested gradients/shadows.
<!-- TYPEUI_SH_MANAGED_END -->
