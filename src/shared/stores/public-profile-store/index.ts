import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { SERVICES_USERS } from '@/shared/api/user';
import { SERVICES_ACHIEVEMENTS } from '@/shared/api/achievements';
import { SERVICES_DATA } from '@/shared/api/data';
import type { IUserData, IUserAchNew, IUserAchData } from '@/shared/stores/user-store';
import type { RealNews, RealMedia } from '@/shared/stores/data-store';
import dataStore from '@/shared/stores/data-store';

export interface ProfilePost {
  news: RealNews;
  media: string[];
}

// The per-user career tree (IUserAchNew) carries each achievement's `stage`/`stages`,
// unlike the viewer-scoped catalog. Flatten it into IUserAchData[] (deduped, keeping the
// highest stage) so the achievements grid can render and filter completed ones.
const flattenCareerAchievements = (
  career: IUserAchNew | undefined,
  username: string,
): IUserAchData[] => {
  const byId = new Map<string, IUserAchData>();
  career?.achivements?.forEach(role => {
    role?.achivements?.forEach((a: any) => {
      const id = String(a.id);
      const mapped: IUserAchData = {
        id,
        username,
        achivement_id: id,
        datetime: a.datetime ?? '',
        stage: String(a.stage ?? 0),
        achivement_pic: a.achivement_pic ?? '',
        achivement_name: a.achivement_name ?? '',
        achivement_decsription: a.achivement_decsription ?? '',
        achivement_tree: '',
        level: String(a.stage ?? 0),
        stages: String(a.stages ?? 0),
      };
      const existing = byId.get(id);
      if (!existing || Number(mapped.level) > Number(existing.level)) {
        byId.set(id, mapped);
      }
    });
  });
  return Array.from(byId.values());
};

export type TPublicProfileState = {
  loading: boolean;
  error?: string;
  userData?: IUserData;
  career?: IUserAchNew;
  achievements: IUserAchData[];
  posts: ProfilePost[];
  loadProfile: (username: string) => Promise<void>;
  reset: () => void;
};

const initialState: {
  loading: boolean;
  error?: string;
  userData?: IUserData;
  career?: IUserAchNew;
  achievements: IUserAchData[];
  posts: ProfilePost[];
} = {
  loading: false,
  error: undefined,
  userData: undefined,
  career: undefined,
  achievements: [],
  posts: [],
};

const publicProfileStore = create<TPublicProfileState>()(
  immer((set: (partial: Partial<any>) => void) => ({
    ...initialState,
    reset: () => set({ ...initialState }),
    loadProfile: async (username: string) => {
      set({ ...initialState, loading: true });
      try {
        const [userRes, careerRes, postsRes] = await Promise.all([
          SERVICES_USERS.UsersData.getUserData(username),
          SERVICES_ACHIEVEMENTS.AchievementsData.user(username),
          SERVICES_DATA.Data.getPostsByAuthor(username),
        ]);

        let userData: IUserData | undefined;
        if (userRes?.success && userRes.code === 200) {
          const { result } = userRes.data as { result: IUserData[] };
          userData = result?.[0];
        }

        if (!userData) {
          set({ loading: false, error: 'Пользователь не найден' });
          return;
        }

        const career =
          careerRes?.success && careerRes.code === 200
            ? (careerRes.data as IUserAchNew)
            : undefined;

        // Derive the target user's achievements from their career tree (user-specific,
        // unlike the viewer-scoped /achivements/no_dep list). The grid filters completed ones.
        const achievements = flattenCareerAchievements(career, username);

        let posts: ProfilePost[] = [];
        if (postsRes?.success && postsRes.code === 200) {
          const rawPosts = (postsRes.data as { result: RealNews[] }).result ?? [];
          posts = await Promise.all(
            rawPosts.map(async news => {
              const mediaRes = await SERVICES_DATA.Data.getNewsMedia(news.post_id);
              const media = ((mediaRes?.data as { result: RealMedia[] })?.result ?? []).map(
                m => m.media,
              );
              return { news, media };
            }),
          );
        }

        // Inject posts into dataStore.normalizedNews so NewsActionPanel can read like/dislike state.
        const normalizedPosts = posts.reduce<Record<string, any>>(
          (acc, p) => ({ ...acc, [p.news.post_id]: p }),
          {},
        );
        dataStore.setState(s => ({
          data: {
            ...s.data,
            normalizedNews: { ...(s.data.normalizedNews ?? {}), ...normalizedPosts },
          },
        }));

        set({ userData, career, achievements, posts, loading: false, error: undefined });
      } catch (error) {
        console.error(error);
        set({ loading: false, error: 'Network or system error' });
      }
    },
  })),
);

export default publicProfileStore;
