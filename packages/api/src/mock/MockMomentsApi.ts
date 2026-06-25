import type {
  MomentsApi,
  Moment,
  CreateMomentInput,
  TimelineGroup,
  TimelineParams,
  UserProfile,
  OnboardingData,
  CircleMember,
  CircleMoment,
} from '@momeants/types';
import {
  MOCK_MOMENTS,
  MOCK_CIRCLE_MEMBERS,
  MOCK_CIRCLE_MOMENTS,
  MOCK_PROFILE,
} from './data';

function delay(ms = 400): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class MockMomentsApi implements MomentsApi {
  private moments: Moment[] = [...MOCK_MOMENTS];

  async createMoment(input: CreateMomentInput): Promise<Moment> {
    await delay();
    const moment: Moment = {
      id: String(Date.now()),
      authorId: 'me',
      imageUri: input.imageUri,
      caption: input.caption,
      moods: input.moods,
      visibility: input.visibility,
      people: input.people,
      location: input.location,
      musicTitle: input.musicTitle,
      musicArtist: input.musicArtist,
      reactions: [],
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.moments.unshift(moment);
    return moment;
  }

  async getMoment(id: string): Promise<Moment> {
    await delay(200);
    const moment = this.moments.find((m) => m.id === id);
    if (!moment) throw new Error(`Moment ${id} not found`);
    return moment;
  }

  async listHomeMoments(): Promise<{ hero: Moment; recent: Moment[]; resurfaced?: Moment }> {
    await delay();
    const sorted = [...this.moments].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const resurfaced = sorted.find((m) => m.isResurfaced);
    const regular = sorted.filter((m) => !m.isResurfaced);
    return { hero: regular[0], recent: regular.slice(1, 5), resurfaced };
  }

  async listTimeline(params: TimelineParams): Promise<TimelineGroup[]> {
    await delay();
    const sorted = [...this.moments].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const groups = new Map<string, Moment[]>();
    for (const moment of sorted) {
      const date = new Date(moment.createdAt);
      const key = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(moment);
    }
    return Array.from(groups.entries()).map(([label, moments]) => ({
      dateLabel: label,
      isoDate: moments[0].createdAt,
      moments,
    }));
  }

  async reactToMoment(momentId: string, emoji: string): Promise<void> {
    await delay(100);
    const moment = this.moments.find((m) => m.id === momentId);
    if (!moment) return;
    const existing = moment.reactions.find((r) => r.emoji === emoji);
    if (existing) {
      existing.reactedByMe = !existing.reactedByMe;
      existing.count += existing.reactedByMe ? 1 : -1;
    } else {
      moment.reactions.push({ emoji, count: 1, reactedByMe: true });
    }
  }

  async commentOnMoment(momentId: string, text: string): Promise<void> {
    await delay(200);
    const moment = this.moments.find((m) => m.id === momentId);
    if (!moment) return;
    moment.comments.push({
      id: String(Date.now()),
      authorId: 'me',
      authorName: MOCK_PROFILE.displayName,
      authorAvatarUri: MOCK_PROFILE.avatarUri,
      text,
      createdAt: new Date().toISOString(),
    });
  }

  async listCircleMembers(): Promise<CircleMember[]> {
    await delay();
    return MOCK_CIRCLE_MEMBERS;
  }

  async listCircleMoments(): Promise<CircleMoment[]> {
    await delay();
    return MOCK_CIRCLE_MOMENTS;
  }

  async getProfile(_userId?: string): Promise<UserProfile> {
    await delay(200);
    return MOCK_PROFILE;
  }

  async updateProfile(data: Partial<OnboardingData>): Promise<UserProfile> {
    await delay(300);
    return { ...MOCK_PROFILE, ...data };
  }

  async signInWithEmail(_email: string, _password: string): Promise<{ userId: string }> {
    await delay(600);
    return { userId: 'me' };
  }

  async signUpWithEmail(_email: string, _password: string): Promise<{ userId: string }> {
    await delay(800);
    return { userId: 'me' };
  }

  async signOut(): Promise<void> {
    await delay(200);
  }

  async completeOnboarding(_data: OnboardingData): Promise<UserProfile> {
    await delay(500);
    return MOCK_PROFILE;
  }
}
