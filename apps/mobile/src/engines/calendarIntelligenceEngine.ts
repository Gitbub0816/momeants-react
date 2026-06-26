import type { Moment, MomentComment, MomentPerson } from '@momeants/types';
import type { CalendarEvent } from '@momeants/types';
import type { CalendarInference, CalendarNudge, InferredEventType, InferenceSource } from '@momeants/types';
import type { EngineContext } from './types';
import { computeClosenessScore } from './relationshipEngine';

// ── Keyword maps for NLP-style inference ────────────────────────────────────

interface EventPattern {
  keywords: string[];
  type: InferredEventType;
  emoji: string;
  titleTemplate: string;
  isRecurring: boolean;
  confidence: number;
}

const EVENT_PATTERNS: EventPattern[] = [
  {
    keywords: ['graduated', 'graduation', 'diploma', 'commencement', 'class of', 'cap and gown'],
    type: 'graduation',
    emoji: '🎓',
    titleTemplate: '{name} graduated',
    isRecurring: false,
    confidence: 0.90,
  },
  {
    keywords: ['birthday', 'bday', 'happy birthday', 'born today', 'turning', 'years old', 'hbd'],
    type: 'birthday',
    emoji: '🎂',
    titleTemplate: "{name}'s birthday",
    isRecurring: true,
    confidence: 0.95,
  },
  {
    keywords: ['engaged', 'engagement', 'she said yes', 'he said yes', 'popped the question', 'will you marry'],
    type: 'engagement',
    emoji: '💍',
    titleTemplate: '{name} got engaged',
    isRecurring: false,
    confidence: 0.92,
  },
  {
    keywords: ['wedding', 'married', 'just married', 'bride', 'groom', 'i do', 'husband', 'wife'],
    type: 'anniversary',
    emoji: '💒',
    titleTemplate: '{name} wedding day',
    isRecurring: true,
    confidence: 0.88,
  },
  {
    keywords: ['baby', 'newborn', 'born today', 'labor', 'delivery', 'welcomed', 'she\'s here', 'he\'s here', 'bundle of joy'],
    type: 'baby',
    emoji: '👶',
    titleTemplate: '{name}\'s baby arrived',
    isRecurring: false,
    confidence: 0.90,
  },
  {
    keywords: ['new job', 'first day', 'started at', 'joining', 'excited to announce', 'new role', 'new chapter', 'new position'],
    type: 'new_job',
    emoji: '💼',
    titleTemplate: '{name} started a new job',
    isRecurring: false,
    confidence: 0.78,
  },
  {
    keywords: ['moved in', 'new home', 'new house', 'new apartment', 'keys', 'housewarming', 'our new place'],
    type: 'new_home',
    emoji: '🏠',
    titleTemplate: '{name} moved to a new home',
    isRecurring: false,
    confidence: 0.82,
  },
  {
    keywords: ['anniversary', 'years together', 'year together', 'years ago today', 'year ago today'],
    type: 'anniversary',
    emoji: '💕',
    titleTemplate: '{name} anniversary',
    isRecurring: true,
    confidence: 0.88,
  },
  {
    keywords: ['reunion', 'reunited', 'been so long', 'finally together', 'haven\'t seen'],
    type: 'reunion',
    emoji: '🤗',
    titleTemplate: 'Reunion with {name}',
    isRecurring: false,
    confidence: 0.70,
  },
  {
    keywords: ['first day of school', 'first day of kindergarten', 'back to school', 'first grade', 'starting school'],
    type: 'first_day',
    emoji: '🎒',
    titleTemplate: '{name}\'s first day of school',
    isRecurring: false,
    confidence: 0.85,
  },
  {
    keywords: ['won', 'award', 'achievement', 'championship', 'gold medal', 'first place', 'promoted', 'made the team'],
    type: 'achievement',
    emoji: '🏆',
    titleTemplate: '{name} achieved something great',
    isRecurring: false,
    confidence: 0.72,
  },
];

// ── Text analysis ────────────────────────────────────────────────────────────

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s']/g, ' ');
}

function matchPatterns(text: string): EventPattern | null {
  const normalized = normalizeText(text);
  let bestMatch: EventPattern | null = null;
  let bestScore = 0;

  for (const pattern of EVENT_PATTERNS) {
    const matches = pattern.keywords.filter((kw) => normalized.includes(kw));
    if (matches.length > 0) {
      const score = (matches.length / pattern.keywords.length) * pattern.confidence;
      if (score > bestScore) {
        bestScore = score;
        bestMatch = pattern;
      }
    }
  }

  return bestMatch;
}

function extractPersonNames(text: string, taggedPeople: MomentPerson[]): string[] {
  if (taggedPeople.length > 0) return taggedPeople.map((p) => p.name);
  // Minimal name extraction: capitalize sequences
  const matches = text.match(/\b[A-Z][a-z]{1,15}\b/g);
  return matches ? [...new Set(matches)].slice(0, 3) : [];
}

function buildTitle(template: string, names: string[]): string {
  const name = names.length > 0 ? names[0] : 'Someone special';
  return template.replace('{name}', name);
}

// ── Inference from a single moment ──────────────────────────────────────────

export function inferEventsFromMoment(
  moment: Moment,
  context: EngineContext
): CalendarInference[] {
  const inferences: CalendarInference[] = [];
  const sources: { text: string; source: InferenceSource }[] = [];

  if (moment.caption) {
    sources.push({ text: moment.caption, source: 'caption' });
  }
  moment.comments.forEach((c: MomentComment) => {
    sources.push({ text: c.text, source: 'comment' });
  });

  const seen = new Set<string>();

  for (const { text, source } of sources) {
    const pattern = matchPatterns(text);
    if (!pattern) continue;

    const dedupeKey = `${pattern.type}-${moment.id}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    const personNames = extractPersonNames(text, moment.people);
    const involvedIds = moment.people
      .filter((p: MomentPerson) => personNames.includes(p.name))
      .map((p: MomentPerson) => p.id);

    inferences.push({
      momentId: moment.id,
      inferredType: pattern.type,
      confidence: pattern.confidence,
      source,
      involvedPersonIds: involvedIds,
      involvedPersonNames: personNames,
      suggestedTitle: buildTitle(pattern.titleTemplate, personNames),
      suggestedEmoji: pattern.emoji,
      suggestedDate: moment.createdAt.split('T')[0],
      isRecurring: pattern.isRecurring,
      requiresConfirmation: true,
    });
  }

  return inferences;
}

// ── Pattern-based anniversary detection ────────────────────────────────────
// Same location, same people, different year = likely recurring event

export function detectAnniversaryPatterns(context: EngineContext): CalendarInference[] {
  const inferences: CalendarInference[] = [];

  // Group moments by month+day and people combination
  const groups = new Map<string, Moment[]>();

  context.moments.forEach((m) => {
    if (m.people.length === 0) return;
    const date = new Date(m.createdAt);
    const dayKey = `${date.getMonth()}-${date.getDate()}`;
    const peopleKey = m.people
      .map((p: MomentPerson) => p.id)
      .sort()
      .join(',');
    const key = `${dayKey}|${peopleKey}`;

    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(m);
  });

  groups.forEach((moments, key) => {
    if (moments.length < 2) return; // need at least 2 instances to detect pattern
    const years = [...new Set(moments.map((m) => new Date(m.createdAt).getFullYear()))];
    if (years.length < 2) return; // must span multiple years

    const representative = moments[0];
    const personNames = representative.people.map((p: MomentPerson) => p.name);
    const personIds = representative.people.map((p: MomentPerson) => p.id);
    const date = new Date(representative.createdAt);

    inferences.push({
      momentId: representative.id,
      inferredType: 'memory_anniversary',
      confidence: Math.min(0.85, 0.55 + years.length * 0.10),
      source: 'pattern',
      involvedPersonIds: personIds,
      involvedPersonNames: personNames,
      suggestedTitle: `Annual memory with ${personNames.slice(0, 2).join(' & ')}`,
      suggestedEmoji: '✨',
      suggestedDate: `${new Date().getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
      isRecurring: true,
      notes: `This day has ${moments.length} memories across ${years.length} years`,
      requiresConfirmation: true,
    });
  });

  return inferences;
}

// ── Onboarding-based inference (birthday, etc.) ─────────────────────────────

export function buildBirthdayEventFromOnboarding(
  userId: string,
  displayName: string,
  birthdayIso: string,
  currentYear: number
): CalendarInference {
  const birthDate = new Date(birthdayIso);
  const thisYearBirthday = `${currentYear}-${String(birthDate.getMonth() + 1).padStart(2, '0')}-${String(birthDate.getDate()).padStart(2, '0')}`;

  return {
    momentId: 'onboarding',
    inferredType: 'birthday',
    confidence: 1.0,
    source: 'onboarding',
    involvedPersonIds: [userId],
    involvedPersonNames: [displayName],
    suggestedTitle: `${displayName}'s Birthday`,
    suggestedEmoji: '🎂',
    suggestedDate: thisYearBirthday,
    isRecurring: true,
    requiresConfirmation: false,
  };
}

// ── Calendar nudges ─────────────────────────────────────────────────────────

export function buildCalendarNudges(
  events: CalendarEvent[],
  inferences: CalendarInference[],
  context: EngineContext
): CalendarNudge[] {
  const nudges: CalendarNudge[] = [];
  const now = context.currentTime;

  // Approaching confirmed events
  for (const event of events) {
    const eventDate = new Date(event.date + 'T00:00:00');
    const thisYear = new Date(now.getFullYear(), eventDate.getMonth(), eventDate.getDate());
    const daysUntil = Math.ceil((thisYear.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntil < 0 || daysUntil > 30) continue;

    const personIds = event.personId ? [event.personId] : [];
    const closeness = personIds.length > 0
      ? computeClosenessScore(personIds[0], context)
      : 0.5;

    const sparkRecommended = closeness > 0.5 && daysUntil <= 7;

    nudges.push({
      type: daysUntil === 0 ? 'anniversary_today' : 'approaching_event',
      calendarEventId: event.id,
      headline: event.title,
      subtext: daysUntil === 0 ? 'Today!' : `${daysUntil} day${daysUntil > 1 ? 's' : ''} away`,
      sparkRecommended,
      suggestedSparkCategory: event.type === 'birthday' ? 'relationship' : 'memory',
      daysUntil,
      personIds,
    });
  }

  // High-confidence inferred milestones
  for (const inference of inferences) {
    if (inference.confidence < 0.75 || !inference.requiresConfirmation) continue;
    nudges.push({
      type: 'inferred_milestone',
      inference,
      headline: inference.suggestedTitle,
      subtext: `Detected from a recent moment — add to calendar?`,
      sparkRecommended: inference.isRecurring,
      suggestedSparkCategory: 'anniversary',
      personIds: inference.involvedPersonIds,
    });
  }

  return nudges.sort((a, b) => (a.daysUntil ?? 99) - (b.daysUntil ?? 99));
}

// ── Full pipeline ────────────────────────────────────────────────────────────

export function runCalendarIntelligence(context: EngineContext): {
  inferences: CalendarInference[];
  nudges: CalendarNudge[];
} {
  const allInferences: CalendarInference[] = [];

  // Infer from each moment's text
  context.moments.forEach((m) => {
    allInferences.push(...inferEventsFromMoment(m, context));
  });

  // Detect multi-year anniversary patterns
  allInferences.push(...detectAnniversaryPatterns(context));

  const nudges = buildCalendarNudges(context.calendarEvents, allInferences, context);

  return { inferences: allInferences, nudges };
}
