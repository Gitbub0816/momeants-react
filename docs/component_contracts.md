# Momeants Component Contracts

## Purpose

This document defines the component names, responsibilities, and interaction contracts for the first React Native / Expo build.

Components should be visually premium but product-focused. Do not create a pile of decorative cards unless the component directly supports capture, memory viewing, timeline browsing, close-circle sharing, or resurfacing.

## Design Foundation Components

### `ScreenShell`

Wraps every primary screen.

Responsibilities:

- provides dark cinematic background
- adds safe area handling
- optionally renders glow blobs
- controls horizontal padding
- owns screen-level scroll behavior

Props:

```ts
interface ScreenShellProps {
  children: React.ReactNode;
  padded?: boolean;
  scroll?: boolean;
  glow?: 'none' | 'soft' | 'hero';
}
```

### `GlassCard`

Reusable translucent surface.

Use for:

- memory metadata
- profile panels
- privacy controls
- moment action panels

Do not use for every item.

Props:

```ts
interface GlassCardProps {
  children: React.ReactNode;
  variant?: 'subtle' | 'standard' | 'strong';
  radius?: 'md' | 'lg' | 'xl' | 'full';
}
```

### `GradientText`

Used sparingly for emotional headings.

Use for:

- onboarding hero line
- capture prompt
- special resurfaced memory line

Do not use for normal labels.

### `MomeantsButton`

Primary button component.

Variants:

```ts
type ButtonVariant = 'primary' | 'glass' | 'quiet' | 'danger';
```

Rules:

- `primary` uses aura gradient.
- `glass` uses translucent panel.
- `quiet` is text-only.
- `danger` is only for destructive actions.

### `IconPill`

Small rounded action control.

Use for:

- Mood
- People
- Place
- Music
- Privacy

## Navigation Components

### `MomeantsTabBar`

Floating bottom tab bar.

Tabs:

```txt
Home
Timeline
Capture
Circle
You
```

Rules:

- Capture is centered and larger.
- Active tab uses soft purple glow.
- Inactive tabs are muted.
- The tab bar should not cover important content.

### `CaptureButton`

The main plus button.

Responsibilities:

- starts capture flow
- triggers haptic feedback
- glows softly
- animates press scale

Props:

```ts
interface CaptureButtonProps {
  size?: 'tab' | 'hero';
  onPress: () => void;
}
```

## Memory Components

### `MemoryHeroCard`

The dominant image card on Home.

Use for:

- today’s featured memory
- resurfaced memory
- recent close-circle memory

Props:

```ts
interface MemoryHeroCardProps {
  moment: Moment;
  label?: string;
  onPress: () => void;
}
```

Rules:

- Must be image-first.
- Must include gradient overlay.
- Must show date and emotional title/caption.
- Mood tags are optional but recommended.
- Do not show too many metrics.

### `MemoryMiniCard`

Smaller horizontal card for recent moments.

Props:

```ts
interface MemoryMiniCardProps {
  moment: Moment;
  compact?: boolean;
  onPress: () => void;
}
```

### `MomentDetailView`

Full-screen moment reliving screen.

Responsibilities:

- render image as main background
- render content overlays
- show date, caption, moods, people, location
- support reactions and comments
- keep engagement secondary

### `MoodPill`

Single mood tag.

Props:

```ts
interface MoodPillProps {
  mood: MoodTag;
  selected?: boolean;
  onPress?: () => void;
}
```

### `MoodSelector`

Horizontal or wrapped mood picker.

Rules:

- Must feel fun and easy.
- Selection should haptic tick.
- Allow multiple moods but keep UI simple.
- Do not require mood selection to save a moment unless product decides otherwise.

## Capture Components

### `CaptureComposer`

Container for the full capture/save flow.

Responsibilities:

- manages selected image
- coordinates mood, people, place, privacy
- handles validation
- hands off upload/save

### `ImageCaptureSurface`

Full-screen camera or selected image preview.

Rules:

- full image should be the focus
- overlay controls should be minimal
- do not block the photo with large panels

### `MomentPromptInput`

Caption/prompt input.

Tone examples:

```txt
What's this moment about?
What feeling should this remember?
Give this memory a few words.
```

### `MomentPrivacyPicker`

Privacy selector.

Options:

```txt
Private
Close Circle
Selected People
```

Rules:

- Must be visible before final save.
- Default must not be public.
- Include plain-language explanation.

### `PeoplePicker`

Select people attached to a moment.

Rules:

- People tagging is optional.
- Do not make it feel like tagging for exposure.
- Support close-circle people first.

### `PlacePicker`

Optional location context.

Rules:

- Ask permission gracefully.
- Allow manual place labels.
- Do not require precise coordinates for display.

## Circle Components

### `CircleAvatar`

Avatar with optional emotional/new-memory ring.

Rules:

- Avoid copying Instagram story pressure.
- Ring means meaningful new memory, not generic activity.

### `CloseCircleStrip`

Small row of close people.

Use on Home and Circle.

### `CircleMomentCard`

Moment card from someone in the user’s circle.

Rules:

- Include person context.
- Keep warm and private.
- Avoid public metrics.

## Timeline Components

### `TimelineDateRail`

Horizontal control for day/week/month/year browsing.

### `TimelineMomentRow`

Memory row grouped by date.

### `MonthJumpPicker`

Optional selector for jumping across months/years.

Rules:

- Timeline should be easy to browse over long periods.
- It should not become an infinite addictive feed.

## Profile Components

### `ProfileHeader`

Shows avatar, display name, username, and short tagline.

### `MemoryStats`

Stats should be memory-centered.

Good:

```txt
Moments
Days remembered
People close
```

Use likes as secondary only.

### `MoodSummary`

Shows top moods.

### `PeopleMemoryStrip`

Shows people who appear often in moments.

## Resurfacing Components

### `ResurfacedMemoryCard`

Special card for old moments brought back.

Language examples:

```txt
One year ago today
A quiet moment from last summer
You saved this feeling before
```

### `ResurfacingControls`

Allows user to hide people, places, or time periods from resurfacing.

## Animation Components

### `FloatingHearts`

Small emotional reaction effect.

Rules:

- Use sparingly.
- Duration under 2 seconds.
- Do not loop.
- Do not block interaction.

### `SparkleBurst`

Used when saving a moment.

Rules:

- Subtle, premium, not cartoon confetti.

### `ParallaxImageHeader`

Used for detail screens and hero cards.

## Component Naming Rules

Use clear product names, not generic dashboard names.

Good:

```txt
MemoryHeroCard
MomentPrivacyPicker
CloseCircleStrip
ResurfacedMemoryCard
CaptureComposer
```

Bad:

```txt
Card1
FeedItem
DashboardWidget
ContentTile
GenericPanel
```

## Final Component Rule

Every component should answer one question:

Does this help the user capture, relive, organize, or share a meaningful memory?

If not, do not build it yet.
