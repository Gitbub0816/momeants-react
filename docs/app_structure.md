# Momeants App Structure

## Recommended Architecture

Momeants should be one product with shared logic and platform-specific shells.

```txt
apps/
  mobile/          Expo React Native app
  web/             Next.js web app
  admin/           Next.js internal/admin app

packages/
  core/            product logic, memory scoring, validation, utility functions
  api-client/      typed API client used by mobile and web
  types/           shared TypeScript types
  design/          colors, typography, spacing, icons, motion tokens
  media/           upload, compression, image helpers
  animations/      shared Rive/Lottie files and animation wrappers
  config/          env parsing, feature flags, shared constants
```

For an early repo, it is acceptable to start with only `apps/mobile` and `packages/design`, then expand.

## Mobile App

Use Expo for cross-platform velocity.

```txt
apps/mobile/
  app/
    _layout.tsx
    index.tsx
    (auth)/
    (tabs)/
    capture/
    moment/[id].tsx
    onboarding/
  src/
    components/
    features/
    hooks/
    lib/
    providers/
    styles/
```

### Expo Router Layout

```txt
app/
  _layout.tsx
  (auth)/
    sign-in.tsx
    create-account.tsx
  onboarding/
    welcome.tsx
    identity.tsx
    birthday.tsx
    username.tsx
    location.tsx
    avatar.tsx
    permissions.tsx
    connect.tsx
  (tabs)/
    _layout.tsx
    home.tsx
    timeline.tsx
    circle.tsx
    profile.tsx
  capture/
    index.tsx
    edit.tsx
    details.tsx
    privacy.tsx
    share.tsx
  moment/
    [id].tsx
```

## Web App

The web app should not simply be a stretched mobile feed. It should support viewing, onboarding, landing pages, shared memories, account settings, and marketing.

```txt
apps/web/
  app/
    page.tsx
    login/
    signup/
    m/[id]/
    u/[username]/
    settings/
  src/
    components/
    features/
    lib/
```

Web should use the same brand language but less mobile-specific bottom navigation.

## Admin App

Admin is not core social UX. Keep it clean and practical.

Possible admin responsibilities:

- moderation queue
- user reports
- content flags
- feature flags
- seed content management
- invite controls
- analytics summaries
- support tools

## Shared Types

```ts
export type MomentVisibility = 'private' | 'close_circle' | 'selected_people';

export type MoodTag =
  | 'peaceful'
  | 'grateful'
  | 'loved'
  | 'excited'
  | 'nostalgic'
  | 'proud'
  | 'free'
  | 'cozy'
  | 'adventurous';

export interface Moment {
  id: string;
  ownerId: string;
  imageUrl: string;
  caption?: string;
  capturedAt: string;
  createdAt: string;
  visibility: MomentVisibility;
  moodTags: MoodTag[];
  peopleIds: string[];
  place?: MomentPlace;
  resurfacingEligible: boolean;
  likeCount: number;
  commentCount: number;
}

export interface MomentPlace {
  label: string;
  city?: string;
  region?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}
```

## Feature Modules

Recommended feature folders:

```txt
features/
  auth/
  onboarding/
  capture/
  moments/
  timeline/
  circle/
  resurfacing/
  profile/
  privacy/
  notifications/
  media/
```

Each feature should own:

```txt
components/
hooks/
screens/
services/
types.ts
```

Example:

```txt
features/capture/
  components/
    CaptureButton.tsx
    MoodSelector.tsx
    MomentPrivacyPicker.tsx
    PeoplePicker.tsx
  screens/
    CaptureScreen.tsx
    EditMomentScreen.tsx
    MomentDetailsScreen.tsx
  services/
    uploadMoment.ts
    compressImage.ts
  types.ts
```

## Design Package

```txt
packages/design/
  tokens/
    colors.ts
    typography.ts
    spacing.ts
    radii.ts
    shadows.ts
    motion.ts
  components/
    GlassCard.tsx
    GradientText.tsx
    MomeantsButton.tsx
    MomeantsTabBar.tsx
  index.ts
```

The design package should be the single source of truth for colors and spacing.

Do not hard-code random purples and card styles across the app.

## Data Model Concepts

Initial collections/tables:

```txt
users
profiles
moments
moment_reactions
moment_comments
close_circle_memberships
notifications
media_assets
reports
blocks
feature_flags
```

## Privacy Defaults

Momeants should be private by default.

Rules:

- New moments default to `close_circle` or `private`, not public.
- Public discovery is not a default core mechanic.
- User should understand exactly who can see each memory.
- Location should be optional and clearly controlled.
- People tagging should respect consent and privacy.

## Platform-Specific Code

Use platform-specific native code only when needed.

Good reasons:

- camera edge cases
- haptics
- permissions
- share sheet
- image/video processing
- push notifications
- local media indexing

Bad reasons:

- ordinary buttons
- ordinary screens
- ordinary layouts
- business logic

## Native Modules Later

If needed later:

```txt
Swift/Kotlin: camera, permissions, platform polish
Rust/C++: heavy image processing, compression, ML, encryption
TypeScript: product logic and UI orchestration
```

Do not introduce C++ or Rust until Expo/React Native cannot reasonably handle the task.

## Environment Rules

Never store secrets in app code.

Use:

```txt
EXPO_PUBLIC_API_BASE_URL=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
```

Only expose public client config through `EXPO_PUBLIC_*`.

Private keys belong in server functions or backend services.

## Development Order

Build in this order:

1. Design tokens and base components
2. Auth and onboarding
3. Capture flow
4. Moment detail screen
5. Home memory surface
6. Timeline
7. Close circle
8. Profile
9. Notifications
10. Resurfacing
11. Web share pages
12. Admin moderation

Do not start with Explore or public discovery. That would distort the product.
