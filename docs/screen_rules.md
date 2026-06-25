# Momeants Screen Rules

## Important Note About the Screenshot

The generated screenshot nailed the style but not the final layout.

Keep:

- dark glossy cinematic styling
- purple / pink / blue glow
- glass surfaces
- emotional photography
- refined typography
- floating capture button
- premium mood tags

Fix:

- too many panels on one screen
- too much dashboard density
- Explore appearing too important
- too many cards above the fold
- too many competing content types at once

The final app should be simpler, calmer, and more memory-centered.

## App Navigation

Primary tabs:

```txt
Home
Timeline
Capture
Circle
You
```

Do not make `Explore` a primary early tab. Momeants is not a discovery-first app.

Optional later:

```txt
Explore / Discover / Public Moments
```

This should only exist after the private memory experience works.

## Home Screen

Purpose: show the user what matters today.

Home should answer:

- Do I have a memory to capture?
- Did someone close to me share something meaningful?
- Is there a past memory worth resurfacing today?
- What is my emotional thread right now?

Recommended layout:

```txt
Status bar
Header:
  Momeants wordmark or greeting
  notification icon
  small profile shortcut

Hero section:
  Today / Recently / Resurfaced memory
  one dominant photo card

Close circle strip:
  small row of meaningful people, not Instagram-style story pressure

Secondary section:
  recent moments OR resurfaced memories

Bottom glass tab bar
```

Rules:

- One hero card dominates.
- Secondary cards should be horizontal and limited.
- Never show more than 2 major content sections above the fold.
- Avoid public trending content on Home.

## Capture Flow

Purpose: make saving a memory feel beautiful and fast.

Capture should not feel like posting content for attention. It should feel like preserving a feeling.

Recommended steps:

```txt
1. Select/capture photo
2. Add feeling/mood
3. Add optional caption
4. Add people/place/music if desired
5. Choose privacy
6. Save/share
```

The generated screenshot’s capture screen was visually strong. Keep the full-screen image, soft overlay, and side metadata controls.

Better final layout:

```txt
Top:
  close button
  save/next button

Center:
  full image preview

Lower overlay:
  What's this moment about?
  caption or mood prompt

Side/bottom controls:
  Mood
  People
  Place
  Music
  Privacy

Bottom:
  capture/save action
```

Rules:

- Mood should be easier than typing.
- Caption is optional.
- Privacy must be visible before final save.
- Do not require too many fields.
- Never make the user feel like they are filling out a form.

## Moment Detail Screen

Purpose: relive one moment.

Layout:

```txt
Full-screen photo background
Gradient overlay
Top controls: back, options
Content overlay:
  title/caption
  date/time
  mood tags
  people
  location if provided
Bottom:
  reactions
  comments/input
  save/share controls
```

Rules:

- The photo should be the screen.
- Reactions should be gentle and emotional, not noisy.
- Hearts can float, but only briefly.
- Comments should feel intimate.
- Avoid engagement-chasing UI.

## Timeline Screen

Purpose: chronological memory browsing.

Timeline should feel like a life thread, not a feed.

Layout:

```txt
Header:
  Timeline
  month/year selector

Date rail:
  subtle day/week/month control

Memory list:
  grouped by date
  large image thumbnails
  emotional tags
  short captions

Optional:
  yearly recap / resurfaced memories
```

Rules:

- Use chronological grouping.
- Use generous whitespace.
- Avoid masonry chaos at first.
- Make it easy to jump by month/year.
- Let the user feel time passing.

## Circle Screen

Purpose: manage close relationships and view meaningful updates.

This is not a follower count screen.

Layout:

```txt
Header:
  Circle
  invite/add person

Close people:
  family/friends avatars
  relationship context

Shared moments:
  recent close-circle moments

Controls:
  manage privacy
  groups/lists
```

Rules:

- Language should be warm: Circle, People, Close Friends, Family.
- Avoid influencer language: followers, fans, reach.
- Show trust and privacy clearly.

## Profile / You Screen

Purpose: personal memory identity.

Profile should not feel like a social status page.

Layout:

```txt
Header:
  avatar with soft ring
  display name
  username
  short emotional tagline

Stats:
  Moments
  Days remembered
  People close

Top moods:
  mood distribution

Favorite people:
  close-circle avatars

Memory albums:
  trips, family, milestones, ordinary days
```

Rules:

- Avoid vanity metrics as primary.
- Likes can exist but should not dominate.
- Prioritize moments, days, and relationships.

## Onboarding

Final onboarding fields:

```txt
phone or email, one required
full name
DOB / age confirmation
avatar
username / display name
city/state/province/country
optional connect step
legal consent
```

Onboarding tone:

- warm
- simple
- premium
- not childish
- not corporate

Screens:

```txt
Welcome
Create account
Your name
Birthday
Username
Avatar
Location
Privacy promise
Connect people
Notification permission
```

Rules:

- Ask for only what is needed.
- Show privacy reassurance before location/contacts.
- Username should be unique with suggestions.
- Avatar can be uploaded or generated.

## Resurfacing Memories

Purpose: bring old moments back at the right time.

Resurfacing should feel magical and considerate.

Examples:

```txt
A year ago today
This weekend last summer
A peaceful moment you saved
You and Ava, three months ago
A memory from your mountain trip
```

Rules:

- Let users hide specific people, places, or date ranges from resurfacing.
- Let users mark resurfacing as sensitive or unwanted.
- Do not force resurfacing into push notifications.
- Make resurfacing adjustable and easy to turn off.

## Empty States

Empty states should encourage capture, not shame the user.

Examples:

```txt
Your first momeant is waiting.
Start with one photo that feels like today.
```

```txt
Nothing to relive yet.
Save a moment now, and we’ll bring it back when it matters.
```

## Notification Style

Notifications should be gentle.

Good:

```txt
A memory from last summer is glowing again.
Ava shared a quiet moment with you.
You saved this feeling one year ago today.
```

Bad:

```txt
You’re missing out!
10 people liked your post!
Go viral now!
```

## Layout Anti-Patterns

Do not build:

- crowded dashboard home
- Explore-first homepage
- endless public feed as core UX
- leaderboard mechanics
- follower-count obsession
- too many animated glows at once
- cards on cards on cards
- all screens looking identical

## Final Screen Rule

Every screen should have one clear emotional job.

If a screen has more than two competing jobs, split it or simplify it.
