import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { SERVICES_USERS } from '@/shared/api/user';
import { SERVICES_ACHIEVEMENTS } from '@/shared/api/achievements';
import { SERVICES_DATA } from '@/shared/api/data';
import type { IUserData, IUserAchNew, IUserAchData } from '@/shared/stores/user-store';
import type { RealNews, RealMedia } from '@/shared/stores/data-store';

export interface ProfilePost {
  news: RealNews;
  media: string[];
}

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
        const [userRes, careerRes, achRes, postsRes] = await Promise.all([
          SERVICES_USERS.UsersData.getUserData(username),
          SERVICES_ACHIEVEMENTS.AchievementsData.user(username),
          SERVICES_ACHIEVEMENTS.AchievementsData.list(),
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

        let achievements: IUserAchData[] = [];
        if (achRes?.success && achRes.code === 200) {
          achievements = (achRes.data as { result: IUserAchData[] }).result ?? [];
        }

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

        set({ userData, career, achievements, posts, loading: false, error: undefined });
      } catch (error) {
        console.error(error);
        set({ loading: false, error: 'Network or system error' });
      }
    },
  })),
);

export default publicProfileStore;
