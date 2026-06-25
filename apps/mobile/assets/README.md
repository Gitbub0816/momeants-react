# App Assets

## ✅ Icon provided
The final app icon has been delivered (dark cosmic background, purple/orange neon M arc, heart + petal mark, star sparkles).

Save it as:
- `icon.png` — 1024×1024 PNG (provided icon, no additional rounding needed)
- `adaptive-icon.png` — 1024×1024 PNG (same, Android crops to circle automatically)
- `splash.png` — center the mark on `#050711` background, 2048×2048

| File | Size | Purpose |
|------|------|---------|
| `icon.png` | 1024×1024 | App icon — **place provided icon here** |
| `splash.png` | 2048×2048 | Splash screen — icon centered on #050711 |
| `adaptive-icon.png` | 1024×1024 | Android adaptive icon foreground |
| `favicon.png` | 48×48 | Web favicon |

## Icon description
Dark glossy rounded square. Cosmic #050711 background with subtle star field.
Purple neon arc (left, `#B57CFF`) + orange neon arc (right, `#FF8C42`) forming an M shape.
Center: heart shape with two leaf petals below, gradient purple→orange.
Star sparkles in corners.

## Generate variants with
```bash
npx expo-image-utils icon icon.png
```
or use [Expo's asset guide](https://docs.expo.dev/develop/user-interface/splash-screen/).
