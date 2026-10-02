---
name: Kinetic
colors:
  primary: "#FFDC2B"
  secondary: "#133865"
  tertiary: "#ECECF4"
  neutral: "#F6F6FC"
  success: "#15A34A"
  warning: "#F97316"
  danger: "#BE123C"
  surface: "#FFFFFF"
  text: "#0E1312"
typography:
  h1:
    fontFamily: "JetBrains Mono"
    fontSize: 2.75rem
  body-md:
    fontFamily: "JetBrains Mono"
    fontSize: 0.875rem
  label-caps:
    fontFamily: "JetBrains Mono"
    fontSize: 0.75rem
  sourceScale: "11/12/14/16/18/20/22/25/28/32/36/40/45/72"
  weights: "400, 500, 600, 700"
rounded:
  xs: 1px
  sm: 2px
  md: 4px
  lg: 8px
  full: 9999px
spacing:
  sm: 4px
  md: 8px
  sourceScale: "4/8/12/16/20/24/32/40/48/64/80/96"
---

## Overview

Kinetic is a dense, technical design system built for interfaces that need speed, clarity, and operational focus. It pairs **JetBrains Mono** typography with a **kinetic yellow** primary brand (`#FFDC2B`), **deep navy** foreground accents (`#133865`), flat uniform surfaces (`#F6F6FC`), borderless lifted cards (`#FFFFFF`), and compact `4px` geometry.

The system avoids softness and visual clutter. Every section shares one uniform surface, cards lift through a lighter derivative of that surface, and inputs read through contrasting fills and crisp `1px` structural borders. Separators are precise hairlines, not heavy rules, and the brand focus ring makes active states feel sharp and deliberate.

## Visual Language

Kinetic uses `4px` corners (`--radius-xxl`) for box-shaped shells, with `1px–2px` for compact chips/checkboxes and `9999px` pill shapes for toggles, radios, and badges where component semantics call for it. It has no drop shadows in resting surfaces, no bordered cards, and no decorative status colors unless a real state needs them.

Use Kinetic for engineering dashboards, sports/manager control planes, trading and finance tools, logistics products, infrastructure interfaces, command centers, data-heavy SaaS, and operations screens that should feel fast, technical, and controlled.

## Style Foundations

- **Visual style:** Dense, technical, flat, operational high-contrast
- **Typography scale:** `11 / 12 / 14 / 16 / 18 / 20 / 22 / 25 / 28 / 32 / 36 / 40 / 45 / 72` (`px`)
- **Typography fonts:** `primary=JetBrains Mono`, `display=JetBrains Mono`, `mono=JetBrains Mono`
- **Typography weights:** `400, 500, 600, 700`
- **Color palette:** Kinetic Yellow brand ramp, Deep Navy accents, cool-tinted neutral surfaces, semantic status hues
- **Spacing scale:** `4px` base (`4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64 / 80 / 96` `px`)

## Colors

- **Brand Primary (`#FFDC2B`):** Kinetic Yellow for primary actions, active tabs, selected segments, and key highlights. Always paired with `#0E1312` text.
- **Brand Ramp:** `brand-medium` (`#FCE588`), `brand-strong` (`#D4A017` hover/active), `brand-soft` (`#FFEFAE`), `brand-softer` (`#FFF8DB` featured cards/soft badges).
- **Deep Navy Accent (`#133865`):** Foreground brand links, secondary dark buttons, code syntax keywords, and technical accents (`dark-soft: #1C4D8A`, `dark-strong: #0C2546`).
- **Canvas Surface (`#F6F6FC`):** Uniform background surface (`--color-neutral-secondary-soft`) shared across page sections.
- **Lifted Card Surface (`#FFFFFF`):** Borderless elevated surface (`--color-neutral-primary-soft`) for cards, modals, drawers, and form controls.
- **Tertiary Fill (`#ECECF4`):** Hover states, terminal panes, neutral badges, and shortcut keycaps.
- **Structural Border (`#DDDDE8`):** `1px` hairline dividers, table grids, and input borders.
- **Text Hierarchy:** Heading (`#0E1312`), Body (`#3D4543`), Subtle (`#6B726F`), Disabled (`#9AA09E`).
- **Status Hues:** Success (`#15A34A` / soft `#ECFDF3` / fg `#15803D`), Warning (`#F97316` / soft `#FFFAEB` / fg `#7C2D12`), Danger (`#BE123C` / soft `#FFF1F2` / fg `#C81E1E`).
