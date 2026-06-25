# Momeants Production Checklist

Work through this before submitting to the App Store / Play Store.

## 1. Environment & Secrets

- [ ] Copy `apps/mobile/.env.example` → `.env.local`, fill in real Supabase URL + anon key
- [ ] Run `eas init` to get your EAS Project ID, set `EAS_PROJECT_ID` in `.env.local`
- [ ] Fill in real Apple credentials in `eas.json` (`appleId`, `ascAppId`, `appleTeamId`)
- [ ] Create a Google Play Service Account JSON and point `eas.json` `serviceAccountKeyPath` at it
- [ ] Rotate your Supabase service role key — never expose it client-side

## 2. Assets

- [ ] `apps/mobile/assets/icon.png` — 1024×1024 PNG, no transparency, no rounded corners (App Store rounds it)
- [ ] `apps/mobile/assets/splash.png` — 2048×2048 PNG, logo centred on `#050711` background
- [ ] `apps/mobile/assets/adaptive-icon.png` — 1024×1024 PNG foreground layer (Android)
- [ ] `apps/mobile/assets/favicon.png` — 196×196 PNG for Expo Web

## 3. Supabase

- [ ] Run all migrations in order: `001` → `005`
- [ ] Enable Row Level Security on every table — verify with `SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public'`
- [ ] Deploy Edge Functions: `spark-engine`, `resurfacing-cron`, `push-notifications`
- [ ] Set up pg_cron job (from `004_push_tokens.sql`) to run resurfacing daily
- [ ] Create `moments` Storage bucket, set public policy per `003_views_and_functions.sql`
- [ ] Configure Supabase Auth: enable Email, disable sign-ups if invite-only
- [ ] Set `SITE_URL` and `REDIRECT_URLS` in Supabase Auth settings

## 4. Push Notifications

- [ ] Upload APNs key (`.p8`) to Expo: `eas credentials`
- [ ] Upload FCM v1 service account to Expo: `eas credentials`
- [ ] Test push delivery end-to-end in preview build before production

## 5. EAS Build

```bash
# Development build (install on device via Expo Go or dev client)
eas build --platform ios --profile development

# Preview build (TestFlight / internal track)
eas build --platform all --profile preview

# Production build
eas build --platform all --profile production
```

## 6. App Store / Play Store Metadata

- [ ] App name: **Momeants**
- [ ] Subtitle (iOS): *Your private memory keeper*
- [ ] Description: craft from `docs/app-description.md` (to be written)
- [ ] Keywords (iOS): memories, private, family, moments, journal, circle
- [ ] Age rating: 4+ (no objectionable content)
- [ ] Privacy policy URL: required before submission
- [ ] Support URL: required before submission
- [ ] Screenshots: 6.7" iPhone, 12.9" iPad Pro (if tablet supported), Android phone

## 7. Privacy & Compliance

- [ ] GDPR / CCPA: add "Delete my account" flow (deletes all moments, profile, circle data)
- [ ] COPPA: if targeting under-13, add age gate
- [ ] App Store Privacy Nutrition Label: data collected = email, photos, usage data
- [ ] `NSUserTrackingUsageDescription` only needed if you add analytics SDK tracking across apps

## 8. Performance

- [ ] Test cold launch < 3s on iPhone SE (2nd gen) or equivalent low-end device
- [ ] Profile ScrollView performance with React Native DevTools (no dropped frames on timeline)
- [ ] Image upload: confirm `createMoment` doesn't block UI (already async but double-check)

## 9. OTA Updates

- [ ] Set `runtimeVersion.policy: 'appVersion'` in `app.config.js` ✓ (already done)
- [ ] Configure `updates.url` with your real Expo project URL once `eas init` is complete
- [ ] Test OTA update delivery in preview channel before enabling in production
