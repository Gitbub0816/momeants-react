# Momeants React / Expo Specification

Momeants is a visually premium, cross-platform memory-sharing app built around single-photo moments, real-world relationships, and emotional resurfacing. The app should feel cinematic, intimate, soft, and modern without becoming a generic social feed or a discovery-first network.

This repository starts with product, visual, layout, and implementation rules for building Momeants with React Native / Expo and a companion web app.

## Recommended Stack

```txt
Mobile: Expo React Native
Web: Next.js / React
Language: TypeScript
Navigation: Expo Router
Animation: React Native Reanimated + Gesture Handler
Advanced visuals: React Native Skia where needed
Micro-animations: Rive or Lottie
Images: Expo Image
Camera: Expo Camera / Image Picker
Backend: Firebase initially, or TypeScript API with Postgres later
Storage: Firebase Storage or Cloudflare R2 later
Design: shared tokens package
```

## Core Product Idea

Momeants is not Instagram, BeReal, Snapchat, or a public discovery app. It is a memory product.

The product should optimize for:

- one meaningful photo at a time
- close friends and family
- private-by-default posting
- emotional tagging
- resurfacing memories later
- real-world connection, not endless browsing
- beautiful capture and relive moments

## Documents

- [`docs/visual_style.md`](docs/visual_style.md) — exact visual direction, colors, layout language, code examples, and styling rules.
- [`docs/app_structure.md`](docs/app_structure.md) — recommended repo/app structure for Expo + web.
- [`docs/screen_rules.md`](docs/screen_rules.md) — screen-by-screen layout rules based on the correct Momeants product direction.
- [`docs/component_contracts.md`](docs/component_contracts.md) — component names, responsibilities, and interaction contracts.
- [`docs/build_rules.md`](docs/build_rules.md) — engineering rules, performance rules, animation rules, and what not to build.

## Most Important Direction

The screenshot style is right. The screenshot layout is not final.

Keep the styling:

- dark cinematic background
- soft purple / pink / blue glow
- glassy surfaces
- emotionally warm photography
- premium spacing
- subtle gradients
- large photo-first cards
- gentle haptics and motion

Fix the layout:

- do not make it feel like a crowded dashboard
- do not show too many mini screens or dense cards
- do not turn Momeants into an Explore-first social network
- keep the primary experience centered on capture, close-circle moments, timeline, and resurfacing

Momeants should feel like opening a beautiful memory box, not checking another social media app.
