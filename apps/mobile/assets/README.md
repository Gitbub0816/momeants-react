# App Assets

Replace these placeholder references with your actual assets before submitting to stores.

| File | Size | Purpose |
|------|------|---------|
| `icon.png` | 1024×1024 | App icon (no transparency, no rounded corners — iOS adds them) |
| `splash.png` | 1284×2778 | Splash screen image |
| `adaptive-icon.png` | 1024×1024 | Android adaptive icon foreground |
| `favicon.png` | 48×48 | Web favicon |

## Brand guidance
- Background: `#050711` (ink900)
- Icon: the ✦ sparkle mark in aura gradient (`#78A7FF` → `#B57CFF` → `#FF7AC8`)
- No text on icon — the mark alone
- Splash: wordmark "momeants" in Playfair Display on `#050711` background

## Generate with
```bash
npx expo-image-utils icon icon.png
```
or use [Expo's asset guide](https://docs.expo.dev/develop/user-interface/splash-screen/).
