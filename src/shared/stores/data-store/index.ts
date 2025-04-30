import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { SERVICES_DATA } from '@/shared/api/data';
import { IApiReturn } from '@/shared/lib/ApiSPA';
import commentsStore from '../comments-store';

interface Author {
  id: string;
  username: string;
  avatar: string;
}

export interface Comment {
  id: string;
  author: Author;
  likes: number;
  text: string;
  timestamp: string;
  liked?: boolean;
}

export interface RealComment {
  author: string;
  avatar_pic: string;
  date: string;
  dislikes: string;
  is_disliked: string;
  is_liked: string;
  is_published: string;
  is_secret: string;
  likes: string;
  parent_id: string;
  post_id: string;
  post_path: string;
  saved: string;
  text: string;
  title: string;
}

export interface RealNews {
  post_id: number;
  post_path: string;
  is_secret: string;
  is_published: string;
  likes: string;
  title: string;
  author: string;
  text: string;
  dislikes: string;
  parent_id: string;
  is_liked: string;
  is_disliked: string;
  saved: string;
  avatar_pic: string;
  saved_count: string;
}
export interface RealMedia {
  is_pic: string;
  media: string;
  post_id: string;
}

export interface CurrentNews {
  news: RealNews[];
  media: string[];
}

export interface NewsData {
  news: RealNews[];
  subjects: string[];
  saved: RealNews[];
}

export type Params = {
  limit: number;
  skip: number;
};

export type Titles = {
  post_id: string;
  title: string;
};

export type TDataStoreState = {
  loading: boolean;
  error: string;
  data: {
    avatars: string[];
    newsBySubject?: RealNews[];
    filteredNews?: RealNews[];
    newsTitles: Titles[];
    comments: Comment[];
    realNews: { news: RealNews; media: string[] }[];
    savedNews: Record<string, any>;
    normalizedNews: Record<string, any>;
    postIds: string[];
  };
  currentNewsState: Record<string, any>;
  selectedNews: RealNews[];
  openComments: string;
  getAvatars: () => Promise<void>;
  getSavedNews: () => Promise<void>;
  getTitles: () => Promise<void>;
  getNewsBySubject: () => Promise<void>;
  getFilteredNews: () => Promise<void>;
  addComment: (comment: string) => Promise<void>;
  likeNewsOrComment: (post_id: string, action: string) => Promise<void>;
  dislikeNews: (post_id: string, action: string) => Promise<void>;
  getLimitNewsComments: (post_id: number, start: number, size: number) => Promise<void>;
  getLimitNews: (start: number, size: number) => Promise<void>;
  saveNews: (id: string, action: 'save' | 'delete') => Promise<any>;
  setCurrentNewsState: (state: any) => void;
};

const dataState = {
  avatars: [],
  news: [],
  newsTitles: [],
  realNews: [],
  savedNews: [],
};

const initialState = {
  loading: false,
  error: undefined,
  data: dataState,
  currentNewsState: { default: true, saved: false, selectedNews: undefined },
};

const dataStore = create<TDataStoreState>()(
  immer((set: (partial: Partial<any>) => void, get: () => any) => ({
    ...initialState,
    getAvatars: async (): Promise<any> => {
      set({ error: undefined, loading: true });
      try {
        const response = await SERVICES_DATA.Data.getAvatars();
        if (response.success && response.code === 200) {
          const { result } = response?.data as { result: string[] };
          //   dataStore.setState((draft: TDataStoreState) => {
          //     draft.data.avatars = result;
          //   });
          set((s: TDataStoreState) => ({
            data: {
              ...s.data,
              avatars: result,
            },
            error: undefined,
          }));
        } else {
          set({ ...initialState, error: response.codeMessage });
        }
      } catch (error) {
        console.error(error);
        set({ ...initialState, error: 'Network or system error' });
      } finally {
        set({ loading: false });
      }
    },
    setCurrentNewsState: (state: Record<string, any>): void => {
      set((s: TDataStoreState) => ({
        currentNewsState: state,
      }));
    },
    getTitles: async (): Promise<any> => {
      set({ error: undefined });
      try {
        const response = await SERVICES_DATA.Data.getTitles();
        if (response.success && response.code === 200) {
          const { result } = response?.data as { result: string[] };
          set((s: TDataStoreState) => ({
            data: {
              ...s.data,
              newsTitles: result,
            },
            error: undefined,
          }));
        } else {
          set((s: TDataStoreState) => ({
            data: {
              ...s.data,
              newsTitles: [],
            },
            error: undefined,
          }));
        }
      } catch (error: any) {
        console.error(error);
        set((s: TDataStoreState) => ({
          data: {
            ...s.data,
            newsTitles: [],
          },
          error: error.message,
        }));
      }
    },
    getSavedNews: async (): Promise<any> => {
      set({ error: undefined });
      try {
        const response = await SERVICES_DATA.Data.getSavedNews();
        if (response && response.data) {
          const newsData = (response.data as { result: RealNews[] })?.result;
          let data;
          try {
            const promises = newsData.map(async news => {
              const media = await commentsStore.getState().getCurrentNewsPics(news.post_id);
              const comments = await commentsStore
                .getState()
                .getLimitNewsComments(news.post_id, 0, 500);
              return { media, comments, news };
            });
            data = await Promise.all(promises);
          } catch (error) {
            console.error('Error in Promise.all:', error);
            set({
              error: 'Failed to load media or comments',
            });
            return response;
          }

          const news = data.map(post => {
            const newsComments =
              (post.comments ?? []).filter(
                (comment: RealComment) => comment.parent_id === String(post.news.post_id),
              ) ?? [];
            const newsMedia = post.media.map((media: RealMedia) => media.media);
            return { ...post, comments: newsComments, media: newsMedia };
          });

          const normalizedComments = news.reduce(
            (acc, item) => ({
              ...acc,
              [item.news.post_id]: item.comments,
            }),
            {},
          );

          commentsStore.setState((s: any) => ({
            normalizedSavedComments: normalizedComments,
          }));

          const normalizedNews = news.reduce(
            (acc, item) => ({
              ...acc,
              [item.news.post_id]: item,
            }),
            {},
          );

          set((s: TDataStoreState) => ({
            data: {
              ...s.data,
              savedNews: {
                ...s.data.savedNews,
                ...normalizedNews,
              },
            },
            error: undefined,
          }));

          return response;
        } else {
          set((s: TDataStoreState) => ({
            error: undefined,
          }));
          return response;
        }
      } catch (error) {
        console.error(error);
        set({ error: 'Network or system error' });
      }
    },
    saveNews: async (id: string, action: 'save' | 'delete'): Promise<any> => {
      set({ error: undefined, loading: true });
      try {
        const response = await SERVICES_DATA.Data.saveNews(id, action);
        if (response.code === 200) {
          set((state: TDataStoreState) => {
            const news = get().data.realNews.find((n: any) => String(n.news.post_id) === id);
            const updatedSavedNews =
              action === 'save'
                ? [news.news, ...get().data.savedNews]
                : state.data.savedNews.filter((n: any) => String(n.post_id) !== id);
            return {
              data: {
                ...state.data,
                savedNews: updatedSavedNews,
              },
              error: undefined,
            };
          });
        } else {
          set((s: TDataStoreState) => ({
            error: undefined,
          }));
          return response;
        }
      } catch (error) {
        console.error(error);
        set({ ...initialState, error: 'Network or system error' });
      } finally {
        set({ loading: false });
      }
    },
    getCurrentNewsPics: async (id: number): Promise<any> => {
      try {
        const response = await SERVICES_DATA.Data.getNewsMedia(id);
        if (response) {
          const result = (response?.data as { result: any[] })?.result;
          return result;
        } else {
          return [];
        }
      } catch (error) {
        console.error(error);
      } finally {
        set({ loading: false });
      }
    },
    getLimitNewsComments: async (post_id: number, start: number, size: number): Promise<any> => {
      try {
        const response = await SERVICES_DATA.Data.getLimitNewsComments({ post_id, start, size });
        if (response) {
          const result = (response?.data as { result: Comment[] })?.result;
          return result;
        } else {
          return [];
        }
      } catch (error) {
        console.error(error);
      }
    },
    getLimitNews: async (start: number, size: number, type: string): Promise<any> => {
      set({ error: undefined, loading: true });
      try {
        const method = type === 'news' ? 'getLimitNews' : 'getLimitSavedNews';
        const response = await SERVICES_DATA.Data.getLimitNews({ start, size });
        if (response && response.data) {
          const newsData = (response.data as { result: RealNews[] })?.result;
          let data;
          try {
            const promises = newsData.map(async news => {
              const media = await commentsStore.getState().getCurrentNewsPics(news.post_id);
              const comments = await commentsStore
                .getState()
                .getLimitNewsComments(news.post_id, 0, 500);
              return { media, comments, news };
            });
            data = await Promise.all(promises);
          } catch (error) {
            console.error('Error in Promise.all:', error);
            set({
              error: 'Failed to load media or comments',
              loading: false, // Сбрасываем loading при ошибке в Promise.all
            });
            return response; // Возвращаем основной ответ
          }

          const news = data.map(post => {
            const newsComments =
              (post.comments ?? []).filter(
                (comment: RealComment) => comment.parent_id === String(post.news.post_id),
              ) ?? [];
            const newsMedia = post.media.map((media: RealMedia) => media.media);
            return { ...post, comments: newsComments, media: newsMedia };
          });

          const normalizedComments = news.reduce(
            (acc, item) => ({
              ...acc,
              [item.news.post_id]: item.comments,
            }),
            {},
          );

          commentsStore.setState((s: any) => ({
            normalizedComments: normalizedComments,
          }));

          const normalizedNews = news.reduce(
            (acc, item) => ({
              ...acc,
              [item.news.post_id]: item,
            }),
            {},
          );
          const postIds = news.map(item => item.news.post_id);

          set((s: TDataStoreState) => ({
            data: {
              ...s.data,
              normalizedNews: {
                ...s.data.normalizedNews,
                ...normalizedNews,
              },
              postIds: postIds,
              realNews: [...s.data.realNews, ...news],
            },
            error: undefined,
            loading: false, // Сбрасываем loading после всех операций
          }));

          return response;
        } else {
          set((s: TDataStoreState) => ({
            error: undefined,
            loading: false,
          }));
          return response;
        }
      } catch (error) {
        console.error('Error in getLimitNews:', error);
        set({
          error: error instanceof Error ? error.message : 'Failed to load news',
          loading: false,
        });
        return null;
      }
    },
    likeNewsOrComment: async (post_id: string, action: string): Promise<any> => {
      try {
        const response = await SERVICES_DATA.Data.setLike(post_id, action);
        console.log('likeNewsOrCommentResponse', response);
      } catch (error) {
        console.error(error);
      }
    },
    dislikeNews: async (post_id: string, action: string): Promise<any> => {
      set({ error: undefined, loading: true });
      try {
        const response = await SERVICES_DATA.Data.setDislike(post_id, action);
        console.log('dislikeNewsResponse', response);
      } catch (error) {
        console.error(error);
      } finally {
        set({ loading: false });
      }
    },
    resetState: () => {
      set((s: TDataStoreState) => ({
        ...initialState,
      }));
    },
  })),
);

export default dataStore;
