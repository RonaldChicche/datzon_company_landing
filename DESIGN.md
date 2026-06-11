---
name: Datzon — Deep Space Industrial v3
colors:
  surface: '#10141a'
  surface-dim: '#0a0e14'
  surface-container-low: '#181c22'
  surface-container: '#1c2026'
  surface-container-high: '#262a31'
  on-surface: '#dfe2eb'
  on-surface-variant: '#9aa1ac'
  on-surface-faint: '#646b76'
  outline: 'rgba(255,255,255,.08)'
  outline-variant: 'rgba(255,255,255,.045)'
  primary: '#aad900'
  primary-bright: '#c5f632'
  primary-dim: 'rgba(170,217,0,.14)'
  on-primary: '#10141a'
  primary-deep: '#5f7d00'
  paper: '#f4f5f1'
  paper-grid: 'rgba(16,24,8,.05)'
  on-paper: '#14171c'
  on-paper-variant: '#555a52'
  on-paper-faint: '#8b9084'
  paper-card: '#ffffff'
  paper-outline: 'rgba(16,24,8,.12)'
  background: '#10141a'
  on-background: '#dfe2eb'
typography:
  display-xl:
    fontFamily: Michroma
    fontSize: clamp(26px, 4.6vw, 58px)
    fontWeight: '400'
    lineHeight: '1.16'
    textTransform: uppercase
  display-lg:
    fontFamily: Michroma
    fontSize: clamp(26px, 4.4vw, 54px)
    fontWeight: '400'
    lineHeight: '1.14'
    textTransform: uppercase
  headline-lg:
    fontFamily: Michroma
    fontSize: clamp(22px, 3vw, 40px)
    fontWeight: '400'
    lineHeight: '1.18'
    textTransform: uppercase
  headline-md:
    fontFamily: Geist
    fontSize: 22px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  data-lg:
    fontFamily: Michroma
    fontSize: clamp(24px, 2.5vw, 34px)
    fontWeight: '400'
    lineHeight: '1.1'
  body-lg:
    fontFamily: Geist
    fontSize: 17.5px
    fontWeight: '400'
    lineHeight: '1.65'
  body-md:
    fontFamily: Geist
    fontSize: 16.5px
    fontWeight: '400'
    lineHeight: '1.65'
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: 0.05em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 11.5px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: 0.2em
    textTransform: uppercase
rounded:
  sm: 4px
  md: 8px
  full: 9999px
spacing:
  base: 4px
  gutter: 28px
  max-width: 1240px
  section-y-desktop: 96px
  section-y-mobile: 64px
  nav-height: 76px
motion:
  ease: cubic-bezier(.2,.7,.2,1)
  hover-lift: translateY(-2px)
  reveal: opacity+translateY(18px), 0.6s, staggered .08s
---

## Brand & Style
Datzon is an industrial automation engineering firm. The system speaks the language of the machines it integrates: **deep-space dark surfaces, one kinetic lime accent, and monospace data labels** — every element should feel like a machined component of a control system.

The voice is authoritative and precise, never decorative. The signature move is restraint: lime (`#aad900`) appears only on primary actions, status LEDs, accent words inside headlines, and live data. Everything else is tonal grays on near-black.

## Colors
Two worlds alternate down every page:

1. **Dark sections (default).** Background `#10141a` (or dimmer `#0a0e14` for hero/contact), tonal containers `#181c22 → #262a31`, hairlines at `rgba(255,255,255,.08)`. Text is `#dfe2eb` with muted tiers `#9aa1ac` and `#646b76`.
2. **Paper sections (light counterpoint).** Warm off-white `#f4f5f1` with a 42px **graph-paper grid** (`rgba(16,24,8,.05)` 1px lines) — the engineering-notebook texture. Ink `#14171c`, white `#ffffff` cards, and the accent shifts to the darker `#5f7d00` so lime never sits on light backgrounds.

`::selection` is lime on dark. Use `primary-bright #c5f632` only for hover states of lime elements; `primary-dim` (lime at 14%) for focus rings and glows.

## Typography
Three voices, strictly cast:

- **Michroma** — display voice for `h1`/`h2` and big stat numerals only. Always uppercase, weight 400, tight 1.12–1.18 line-height. It echoes the techno-geometric logo; never use it for paragraphs or UI labels.
- **Geist** — everything readable: body (16.5px/1.65), leads, `h3`/`h4` at weight 600.
- **JetBrains Mono** — the "machine readout" voice: buttons, chips, kickers, breadcrumbs, nav links, form labels, table/stat metadata. Small sizes (11–13px), uppercase, generous letter-spacing (.05em buttons, .2em chips/kickers).

Accent words inside headlines get a `<span>` in lime (dark sections) or deep green (paper sections).

## Layout & Spacing
- Content max-width **1240px**, 28px side padding (20px mobile).
- Sections breathe: ~96px vertical on desktop, 64px mobile.
- 4px base unit for all padding/margins.
- Stats and data rows are separated by 1px hairlines, not boxes.
- Fixed top nav (76px) over a hero that fills the viewport (`min-height:100vh`) with a full-bleed grayscale photo, dark gradient overlay, and centered content.

## Elevation & Depth
No drop shadows. Depth = **tonal layers + 1px outlines**:
- Dark: containers step `#181c22 → #1c2026 → #262a31`, edges defined by `rgba(255,255,255,.08)` borders.
- Paper: white cards on the graph-paper field with `rgba(16,24,8,.12)` borders.
- "Powered-on" affordance: lime glow ring (`0 0 0 3–4px primary-dim`) on focused inputs and hovered primary buttons; blinking lime LED dots for live status.

## Shapes
Engineered-soft: **4px radius** on buttons, chips, inputs; **8px** on cards and large containers. No pills except status LEDs (circles). Corners never exceed 8px.

## Components
- **Buttons:** JetBrains Mono 13px, 15×26px padding. Primary = solid lime, dark text; hover → `#c5f632`, lift -2px, lime-dim ring. Ghost = 1px `rgba(255,255,255,.4)` border; hover → lime border + lime text. On paper sections use the dark-ink ghost variant. Arrows (`→`) slide 4px right on hover.
- **Chip / kicker:** lime block chip (mono, .2em tracking) for hero badges; text kickers in deep green/lime with .2em tracking elsewhere.
- **Nav:** fixed, translucent dark with blur on scroll; mono links with lime underline-grow on hover/active.
- **Forms:** dark container inputs (`#1c2026`), 1px outline, focus → lime border + lime-dim glow.
- **Stats:** Michroma numerals with lime accent digits, hairline column separators, mono labels.
- **Simulation canvas (robotics):** isometric canvas on `surface-container-low`, mono HUD labels at corners, lime LED "En ciclo" badge, solid-lime play/pause toggle bottom-left that inverts to lime outline when paused.
- **Footer:** `#0a0e14`, hairline top border, mono link columns.

## Motion
One easing curve everywhere: `cubic-bezier(.2,.7,.2,1)`. Scroll-reveals fade+rise 18px over 0.6s with .08s stagger. Hovers lift -2px. Respect `prefers-reduced-motion`: gate all entrance animations so base state is always visible.