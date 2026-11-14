# Project Direction

## Interface defaults

| Property | Current decision |
|---|---|
| Primary viewport | Mobile first |
| Default component size | Medium |
| Interface language | English |
| Layout direction | LTR |
| Themes | Light and Dark |
| Primary palette | Black, White and Neutral Gray |

## Component sizing

Use only the semantic component sizes Small, Medium and Large.

Keep equivalent inputs, outputs, buttons and cards consistent in size at each responsive breakpoint. Content length must not resize standard components; wrap, truncate or scroll content within defined dimensions. Responsive layout changes may adapt to viewport width.

## Architecture direction

- Use reusable components and clear separation of concerns.
- Keep the architecture ready for future RTL support through CSS logical properties, inherited direction and direction-aware reusable components.
- Do not activate an RTL/LTR switch or language-based direction switching without explicit approval.

See [Design System](../design/design-system.md) and [Responsive Layout](../design/responsive-layout.md).
