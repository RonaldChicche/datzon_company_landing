---
name: High-Tech Industrial
colors:
  surface: '#10141a'
  surface-dim: '#10141a'
  surface-bright: '#353940'
  surface-container-lowest: '#0a0e14'
  surface-container-low: '#181c22'
  surface-container: '#1c2026'
  surface-container-high: '#262a31'
  surface-container-highest: '#31353c'
  on-surface: '#dfe2eb'
  on-surface-variant: '#c4c9ae'
  inverse-surface: '#dfe2eb'
  inverse-on-surface: '#2d3137'
  outline: '#8e937a'
  outline-variant: '#444934'
  surface-tint: '#a8d700'
  primary: '#c5f632'
  on-primary: '#273500'
  primary-container: '#aad900'
  on-primary-container: '#465b00'
  inverse-primary: '#4f6600'
  secondary: '#c6c6cb'
  on-secondary: '#2e3034'
  secondary-container: '#47494d'
  on-secondary-container: '#b7b8bd'
  tertiary: '#e3e5ea'
  on-tertiary: '#2d3134'
  tertiary-container: '#c7c9ce'
  on-tertiary-container: '#515458'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#c3f42f'
  primary-fixed-dim: '#a8d700'
  on-primary-fixed: '#161f00'
  on-primary-fixed-variant: '#3b4d00'
  secondary-fixed: '#e2e2e7'
  secondary-fixed-dim: '#c6c6cb'
  on-secondary-fixed: '#1a1c1f'
  on-secondary-fixed-variant: '#45474b'
  tertiary-fixed: '#e1e2e7'
  tertiary-fixed-dim: '#c4c6cb'
  on-tertiary-fixed: '#191c1f'
  on-tertiary-fixed-variant: '#44474b'
  background: '#10141a'
  on-background: '#dfe2eb'
  surface-variant: '#31353c'
typography:
  display-lg:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.08em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 16px
  unit-1: 4px
  unit-2: 8px
  unit-4: 16px
  unit-8: 32px
  unit-12: 48px
---

## Brand & Style
This design system embodies an engineered, high-performance aesthetic tailored for industrial technology and precision logistics. The brand personality is authoritative, resilient, and forward-thinking, targeting technical operators and engineers who require clarity in high-pressure environments.

The visual style is **Corporate / Modern** with a **Technical** edge. It prioritizes functional density and structural integrity, utilizing a rigorous grid and high-contrast accents to guide the eye through complex data sets. The emotional response is one of reliability and "over-engineered" precision, where every UI element feels like a machined component of a larger machine.

## Colors
The palette is rooted in a "Deep Space" industrial dark mode. The primary background (`#10141A`) provides a high-contrast foundation for the **Kinetic Green** (`#AAD900`) accent, which is reserved exclusively for primary actions, status indicators, and critical data points.

Secondary surfaces (`#2B2D31`) are used to define containers and internal modules, creating subtle depth without breaking the dark-theme immersion. Neutral tones are skewed toward cool grays to maintain the metallic, high-tech feel of the interface.

## Typography
The typographic scale is engineered for maximum legibility in technical contexts. **Space Grotesk** is utilized for headlines to echo the wide, geometric, and futuristic signature of the brand's logo, providing a distinct "machined" look.

For body content, **Geist** offers a clean, neutral, and developer-friendly sans-serif that remains legible at smaller sizes. **JetBrains Mono** is used for labels, data values, and metadata to reinforce the technical and precise nature of the system, using uppercase treatments and increased letter spacing for smaller UI elements.

## Layout & Spacing
This design system utilizes a **Fixed Grid** model for desktop, centered within the viewport to maintain a controlled information architecture. 

- **Desktop:** 12-column grid, 1200px max-width, 24px gutters.
- **Tablet:** 8-column fluid grid, 24px margins.
- **Mobile:** 4-column fluid grid, 16px margins.

The spacing rhythm is strictly based on a **4px base unit**. All padding and margins must be multiples of 4, ensuring a mathematical rigor to the layout. Horizontal dividers are used frequently to separate data tiers, reflecting an organized, modular blueprint.

## Elevation & Depth
Depth is achieved through **Tonal Layers** rather than traditional shadows, emphasizing the flat, industrial hardware aesthetic.

1.  **Level 0 (Floor):** `#10141A` - The primary application background.
2.  **Level 1 (Card/Container):** `#2B2D31` - For primary modules and content groupings.
3.  **Level 2 (Interaction/Pop-over):** `#3A3D42` - For elements that float above the main UI, such as tooltips or dropdown menus.

Instead of soft ambient shadows, use **Low-contrast outlines** (1px border, 10% opacity white) to define edges. This maintains a crisp, architectural feel. For "Active" states, a subtle glow effect using the Kinetic Green at 15% opacity can be applied to simulate a powered-on status.

## Shapes
To align with the high-tech, engineered aesthetic, the shape language is **Soft (0.25rem)**. This provides just enough radius to feel modern and intentional without losing the rigid, structural character of an industrial tool.

- **Standard Elements:** 4px radius (buttons, inputs, chips).
- **Large Containers:** 8px radius (cards, modals).
- **Status Indicators:** 0px (sharp) or full pill-shape for specific state badges to differentiate them from functional buttons.

## Components
- **Buttons:** Primary buttons use a solid Kinetic Green (`#AAD900`) background with black text for maximum contrast. Secondary buttons use an outline style with 1px Kinetic Green borders.
- **Inputs:** Fields should have a `#2B2D31` background with a subtle bottom border. Focus states must trigger a 1px solid Kinetic Green border glow.
- **Chips:** Small, rectangular tags using JetBrains Mono. Used for status (e.g., "ONLINE", "IDLE") with background tints corresponding to the status severity.
- **Cards:** No shadows. Use a 1px border of `#3A3D42` to separate from the background. Headers should have a subtle background fill to denote structural hierarchy.
- **Data Tables:** High-density layouts with strictly aligned columns. Use "Geist" for cell content and "JetBrains Mono" for numerical data to ensure tabular alignment.
- **Navigation:** Vertical sidebars are preferred to mimic industrial control panels, using high-contrast icons and Space Grotesk for top-level categories.