# Momeants Visual Style

## One-Line Direction

Momeants should feel like a cinematic memory box: dark, glossy, emotional, intimate, premium, and photographic.

The generated screenshot captured the right style language: glowing purple accents, soft glass, deep navy-black backgrounds, emotional imagery, elegant type, and a magical-but-grown-up feel. Keep that style. The screenshot layout itself was too crowded and dashboard-like in places, so the final app must be calmer, more focused, and more memory-first.

## Brand Feel

Momeants is about capturing life and reliving feelings.

The UI should feel:

- emotional, not noisy
- premium, not corporate
- cinematic, not gamer
- intimate, not influencer-focused
- magical, not childish
- modern, not generic
- calm, not overloaded

Avoid:

- flat SaaS dashboards
- crowded grids
- overuse of cards
- generic Instagram clone layouts
- crypto/neon-gaming aesthetics
- too much purple glow everywhere
- dark mode that feels harsh or cold

## Core Visual Principles

### 1. Photo First

Photos are the soul of the app. UI elements should support the image, not compete with it.

Rules:

- Every major screen should have one dominant image or visual anchor.
- Text should sit comfortably over gradients or glass surfaces.
- Do not cram multiple unrelated cards above the fold.
- Memory cards should feel like premium keepsakes.

### 2. Dark Cinematic Base

The base should be dark navy/black, not pure black.

Use soft radial gradients and blurred color blooms to keep the app warm.

### 3. Glass, Glow, and Depth

The screenshot style worked because surfaces felt layered and luminous.

Use:

- translucent panels
- subtle border highlights
- backdrop blur on web
- soft shadows
- radial glow behind important actions
- gradient borders sparingly

Do not use glass everywhere. Primary surfaces only.

### 4. Emotional Color, Not Loud Color

The app can use purple, pink, blue, peach, and warm sunset colors, but they should feel atmospheric.

Colors should feel like:

- sunset afterglow
- city lights at night
- film grain softness
- candlelight
- aurora glow

Not:

- neon casino
- gaming RGB
- harsh gradients
- candy UI

## Color System

### Base Colors

```ts
export const colors = {
  // Core dark surfaces
  ink900: '#050711',
  ink850: '#090C18',
  ink800: '#0E1324',
  ink700: '#151B31',

  // Elevated translucent surfaces
  glass900: 'rgba(12, 16, 32, 0.72)',
  glass800: 'rgba(22, 28, 50, 0.58)',
  glass700: 'rgba(255, 255, 255, 0.08)',

  // Text
  textPrimary: '#F8F4FF',
  textSecondary: 'rgba(248, 244, 255, 0.72)',
  textMuted: 'rgba(248, 244, 255, 0.48)',

  // Brand glow accents
  auraPurple: '#B57CFF',
  auraPink: '#FF7AC8',
  auraBlue: '#78A7FF',
  auraLavender: '#D8C2FF',

  // Warm emotional accents
  sunsetPeach: '#FFB38A',
  emberRose: '#FF6E91',
  candleGold: '#FFD28A',

  // Semantic colors
  love: '#FF6E91',
  private: '#9CE6D3',
  safe: '#7BE7C8',
  warning: '#FFD28A',
  danger: '#FF6B7A',
};
```

### Background Gradient

The app background should never be plain black.

Recommended mobile background:

```ts
const appBackground = {
  backgroundColor: '#050711',
};
```

Use gradient overlays in screen wrappers:

```tsx
<LinearGradient
  colors={['#151B31', '#090C18', '#050711']}
  start={{ x: 0.1, y: 0 }}
  end={{ x: 0.9, y: 1 }}
  style={StyleSheet.absoluteFill}
/>
```

Add subtle glow blobs:

```tsx
<View style={styles.purpleGlow} />
<View style={styles.blueGlow} />
```

```ts
const styles = StyleSheet.create({
  purpleGlow: {
    position: 'absolute',
    top: -90,
    right: -80,
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: 'rgba(181, 124, 255, 0.20)',
    opacity: 0.8,
    transform: [{ scale: 1.2 }],
  },
  blueGlow: {
    position: 'absolute',
    bottom: 120,
    left: -120,
    width: 260,
    height: 260,
    borderRadius: 999,
    backgroundColor: 'rgba(120, 167, 255, 0.14)',
  },
});
```

## Typography

### Type Personality

The screenshot worked because the wordmark and headers felt elegant. Use a refined serif or high-contrast display face for major emotional moments, paired with a clean modern sans for UI.

Recommended:

- Brand / large emotional headers: `Cormorant Garamond`, `Playfair Display`, or similar elegant serif.
- UI / body: `Inter`, `SF Pro`, or system sans.

React Native practical approach:

```txt
Heading display: Playfair Display or Cormorant Garamond
UI text: system font / Inter if bundled
```

### Type Scale

```ts
export const typography = {
  displayXL: {
    fontSize: 44,
    lineHeight: 50,
    letterSpacing: -0.8,
  },
  display: {
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -0.4,
  },
  title: {
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.2,
  },
  section: {
    fontSize: 19,
    lineHeight: 25,
    fontWeight: '600',
  },
  body: {
    fontSize: 16,
    lineHeight: 23,
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
  },
  micro: {
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.2,
  },
};
```

## Logo / Wordmark Treatment

The word `Momeants` should feel refined and emotional.

Rules:

- Use the wordmark sparingly.
- Pair it with the tagline: `Capture life. Relive feelings.`
- A small sparkle can work, but do not overdo star icons.
- The wordmark should usually sit over a calm dark background, not a busy feed.

Example:

```tsx
<View style={styles.brandLockup}>
  <Text style={styles.wordmark}>Momeants ✦</Text>
  <Text style={styles.tagline}>Capture life. Relive feelings.</Text>
</View>
```

## Layout Language

### Correct Layout Direction

The screenshot’s style is correct. The final layout should be less crowded.

Primary mobile layout:

```txt
Top: calm header / greeting / current emotional context
Middle: one dominant memory or capture action
Lower: close circle / resurfacing / timeline preview
Bottom: simple tab bar with centered capture button
```

Do not show six different panels at once. Momeants should breathe.

### Spacing

Use large spacing and fewer elements.

```ts
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  huge: 48,
};
```

Rules:

- Horizontal screen padding: 20px on mobile.
- Card gap: 14–18px.
- Big vertical sections: 28–40px.
- Never jam story avatars, cards, and timeline widgets all into the first screen.

## Surface Styles

### Glass Card

```tsx
export function GlassCard({ children, style }: PropsWithChildren<{ style?: ViewStyle }>) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.075)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.13)',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    overflow: 'hidden',
  },
});
```

On web, add backdrop blur:

```css
.momeants-glass {
  background: rgba(255, 255, 255, 0.075);
  border: 1px solid rgba(255, 255, 255, 0.13);
  backdrop-filter: blur(24px);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.34);
}
```

### Memory Card

Memory cards should use image-first design.

```tsx
<View style={styles.memoryCard}>
  <Image source={{ uri: imageUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
  <LinearGradient
    colors={['rgba(0,0,0,0.05)', 'rgba(5,7,17,0.35)', 'rgba(5,7,17,0.82)']}
    style={StyleSheet.absoluteFill}
  />
  <View style={styles.memoryContent}>
    <Text style={styles.memoryDate}>MAY 20</Text>
    <Text style={styles.memoryTitle}>Golden hour hikes with the best company</Text>
    <MoodPills moods={['Peaceful', 'Grateful']} />
  </View>
</View>
```

```ts
const styles = StyleSheet.create({
  memoryCard: {
    height: 420,
    borderRadius: 34,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: '#101423',
  },
  memoryContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 22,
  },
  memoryDate: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  memoryTitle: {
    color: '#F8F4FF',
    fontSize: 28,
    lineHeight: 33,
    marginTop: 8,
  },
});
```

## Buttons

### Primary Capture Button

The centered capture button should be iconic. It is the emotional action of the app.

```tsx
<Pressable style={styles.captureButton}>
  <LinearGradient
    colors={['#78A7FF', '#B57CFF', '#FF7AC8']}
    style={StyleSheet.absoluteFill}
  />
  <Text style={styles.capturePlus}>+</Text>
</Pressable>
```

```ts
const styles = StyleSheet.create({
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 999,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#B57CFF',
    shadowOpacity: 0.75,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 0 },
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.55)',
  },
  capturePlus: {
    color: 'white',
    fontSize: 40,
    lineHeight: 44,
    fontWeight: '300',
  },
});
```

### Secondary Buttons

Use glass pills.

```ts
secondaryButton: {
  minHeight: 44,
  paddingHorizontal: 16,
  borderRadius: 999,
  backgroundColor: 'rgba(255,255,255,0.08)',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.12)',
}
```

## Mood Tags

Mood tags should be small, soft, and tactile.

Examples:

- Peaceful
- Grateful
- Loved
- Excited
- Nostalgic
- Proud
- Free
- Cozy
- Adventurous

```tsx
const moodColors = {
  Peaceful: ['rgba(123, 231, 200, 0.22)', '#9CE6D3'],
  Grateful: ['rgba(181, 124, 255, 0.22)', '#D8C2FF'],
  Loved: ['rgba(255, 110, 145, 0.22)', '#FF9EB6'],
  Excited: ['rgba(255, 210, 138, 0.22)', '#FFD28A'],
};
```

## Avatar Rings

Close-circle avatars can use glowing rings, but they should not turn into Instagram stories.

Rules:

- Use rings for meaningful new memories, not attention farming.
- Ring colors can indicate emotional category, not urgency.
- Keep avatar rows small and intentional.

```ts
avatarRing: {
  width: 66,
  height: 66,
  borderRadius: 999,
  padding: 2,
  backgroundColor: '#B57CFF',
  shadowColor: '#B57CFF',
  shadowOpacity: 0.45,
  shadowRadius: 14,
}
```

## Bottom Navigation

The tab bar should feel like floating glass.

Tabs:

```txt
Home
Timeline
Capture
Circle
You
```

Avoid an Explore-first tab as the core app. Discovery should be limited or optional.

```tsx
<View style={styles.tabBar}>
  <TabIcon label="Home" />
  <TabIcon label="Timeline" />
  <CaptureButton />
  <TabIcon label="Circle" />
  <TabIcon label="You" />
</View>
```

```ts
const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 20,
    height: 78,
    borderRadius: 34,
    backgroundColor: 'rgba(10, 13, 27, 0.82)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.11)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
});
```

## Motion Style

Motion should feel soft and alive.

Use:

- gentle spring cards
- slow parallax on image headers
- fade/scale transitions
- small heart float animations
- subtle sparkle when a memory is saved
- haptic tick on capture, save, like, and tag selection

Avoid:

- bouncy cartoon motion
- confetti spam
- constant pulsing
- aggressive autoplay animations

Animation timing:

```ts
export const motion = {
  fast: 160,
  normal: 260,
  slow: 420,
  spring: {
    damping: 18,
    stiffness: 160,
    mass: 0.9,
  },
};
```

## Image Treatment

Use warm, photographic treatment.

Rules:

- Prefer large images with soft gradient overlays.
- Use blur only for background ambience, not main photos.
- Keep faces natural.
- Do not over-filter user memories.
- Use AI/image enhancements only as optional and transparent features.

## Light Mode

Initial product should primarily use the dark cinematic style because it matches the Momeants emotional brand. A light mode can exist later, but it should feel like warm parchment / cream, not sterile white.

Possible light palette later:

```ts
cream: '#FFF8F1'
softRose: '#FFE6EC'
softLavender: '#EFE6FF'
inkText: '#201927'
mutedText: '#776B82'
```

## Final Visual North Star

The app should look expensive without feeling arrogant. It should make the user want to save memories because the app itself treats those memories as valuable.

When in doubt, remove UI and let the photo breathe.
