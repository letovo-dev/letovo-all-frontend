import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { SERVICES_DATA } from '@/shared/api/data';
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
  is_secret: string;
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

interface GetLimitNewsParams {
  start: number;
  size: number;
}

interface SearchNewsParams {
  search_query: string;
}

type GetSavedNewsParams = Record<string, never>;

interface FetchNewsParams {
  type: 'getLimitNews' | 'getSavedNews' | 'searchNews';
  start?: number;
  size?: number;
  searchQuery?: string;
}

interface RequestConfig {
  method: (params: any) => Promise<any>;
  params: GetLimitNewsParams | GetSavedNewsParams | SearchNewsParams;
  newsField: keyof TDataStoreState['data'];
  commentsField: string;
  updatePostIds: boolean;
}

interface NewsItem {
  media: any[];
  comments: RealComment[];
  news: RealNews;
}

export type TDataStoreState = {
  loading: boolean;
  error: string;
  data: {
    avatars: string[];
    newsBySubject?: RealNews[];
    filteredNews?: RealNews[];
    newsTitles: Titles[];
    comments: Comment[];
    savedNews: Record<string, any>;
    searchedNews: Record<string, any>;
    normalizedNews: Record<string, any>;
    postIds: string[];
    allAuthors: string[];
    lastValidData: NewsItem[] | null;
  };
  currentNewsState: Record<string, any>;
  selectedNews: RealNews[];
  openComments: string;
  getAvatars: () => Promise<void>;
  getTitles: () => Promise<void>;
  getNewsBySubject: () => Promise<void>;
  getFilteredNews: () => Promise<void>;
  addComment: (comment: string) => Promise<void>;
  likeNewsOrComment: (post_id: string, action: string) => Promise<void>;
  dislikeNews: (post_id: string, action: string) => Promise<void>;
  getLimitNewsComments: (post_id: number, start: number, size: number) => Promise<void>;
  saveNews: (id: string, action: 'save' | 'delete') => Promise<any>;
  setCurrentNewsState: (state: any) => void;
  fetchNews: (params: FetchNewsParams) => Promise<any>;
  createNews: (news: Partial<RealNews>) => void;
  editNews: (news: RealNews) => void;
  // "/post/update": {
  //   "method": "put",
  //   "body_fields": {
  //       "post_id": "Int",
  //       "is_secret": "Bool",
  //       "likes": "Int",
  //       "dislikes": "Int",
  //       "saved": "Int",
  //       "title": "String",
  //       "author": "String",
  //       "text": "String",
  //       "category": "String"
  //   },
  deleteNews: (news_id: string) => void;
  // '/post/delete': {
  //   function: 'delete_post';
  //   method: 'delete';
  //   body_fields: {
  //     post_id: 'Int';
  //   };
  //   header_fields: ['Bearer'];
  // };
};

const dataState = {
  avatars: [],
  news: [],
  newsTitles: [],
  savedNews: [],
};

const initialState = {
  loading: false,
  error: undefined,
  data: dataState,
  currentNewsState: { default: true, saved: false, selectedNews: undefined },
};

const controllers: { [key: string]: AbortController } = {};

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
      set(() => ({
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
          }));
        } else {
          set((s: TDataStoreState) => ({
            data: {
              ...s.data,
              newsTitles: [],
            },
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
    createNews: async (news: Partial<RealNews>): Promise<any> => {
      set({ loading: true, error: undefined });
      try {
        const response = await SERVICES_DATA.Data.createNews(news);
        if (response.success && response.code === 200) {
          const savedNews = (response?.data as { result: RealNews[] })?.result;
          const { result } =
            (await commentsStore.getState().getCurrentNewsPics(savedNews[0].post_id)) ?? [];
          const updatedNormalizedNews = {
            [savedNews[0].post_id]: {
              news: savedNews[0],
              media: (result && result?.map((media: RealMedia) => media.media)) ?? [],
              comments: [],
            },
            ...get().data.normalizedNews,
          };
          const updatedPostIds = [...get().data.postIds, savedNews[0].post_id.toString()];
          const updatedNewsTitles = [
            { post_id: savedNews[0].post_id.toString(), title: savedNews[0].title },
            ...get().data.newsTitles,
          ];
          set((state: TDataStoreState) => {
            return {
              data: {
                ...state.data,
                normalizedNews: updatedNormalizedNews,
                postIds: updatedPostIds,
                newsTitles: updatedNewsTitles,
              },
              error: undefined,
              loading: false,
            };
          });
        } else {
          set({ loading: false, error: response.codeMessage });
        }
      } catch (error) {
        console.error(error);
        set({ loading: false, error: 'Network or system error' });
      }
    },
    editNews: async (news: Partial<RealNews>): Promise<any> => {
      set({ loading: true, error: undefined });
      try {
        const response = await SERVICES_DATA.Data.editNews(news);
        console.log(response);

        if (response.success && response.code === 200) {
          const editedNews = (response?.data as { result: RealNews[] })?.result;
          const { result } = await commentsStore
            .getState()
            .getCurrentNewsPics(editedNews[0].post_id);
          const updatedTitles = get().data.newsTitles.map((title: Titles) =>
            String(title.post_id) === String(editedNews[0].post_id) ? editedNews[0].title : title,
          );
          set((state: TDataStoreState) => {
            const updatedNormalizedNews = {
              ...state.data.normalizedNews,
              [editedNews[0].post_id]: {
                news: editedNews[0],
                media: result.map((media: RealMedia) => media.media),
                comments: state.data.normalizedNews[editedNews[0].post_id]?.comments || [],
              },
            };
            return {
              data: {
                ...state.data,
                normalizedNews: updatedNormalizedNews,
                newsTitles: updatedTitles,
              },
              error: undefined,
              loading: false,
            };
          });
        } else {
          set({ loading: false, error: response.codeMessage });
        }
      } catch (error) {
        console.error(error);
        set({ loading: false, error: 'Network or system error' });
      }
    },
    deleteNews: async (news_id: string): Promise<any> => {
      set({ loading: true, error: undefined });
      try {
        const response = await SERVICES_DATA.Data.deleteNews(news_id);
        console.log(
          'response.success && response.code === 200',
          response.success && response.code === 200,
        );

        console.log('get().state.data,', get().data);

        if (response.success && response.code === 200) {
          console.log('get().state.data.newsTitles', get().data.newsTitles);

          const updatedTitles = get().data.newsTitles.filter(
            (title: Titles) => title.post_id !== news_id,
          );
          console.log('updatedTitles', updatedTitles);

          const updatedIds = get().data.postIds.filter((id: string) => id !== news_id);
          console.log('updatedIds', updatedIds);

          set((state: TDataStoreState) => {
            const updatedNormalizedNews = { ...state.data.normalizedNews };
            delete updatedNormalizedNews[news_id];
            console.log('updatedNormalizedNews', updatedNormalizedNews);

            return {
              data: {
                ...state.data,
                normalizedNews: updatedNormalizedNews,
                newsTitles: updatedTitles,
                postIds: updatedIds,
              },
              error: undefined,
            };
          });
        } else {
          set({ loading: false, error: response.codeMessage });
        }
      } catch (error) {
        console.error(error);
        set({ loading: false, error: 'Network or system error' });
      } finally {
        set({ loading: false });
      }
    },
    saveNews: async (id: string, action: 'save' | 'delete'): Promise<any> => {
      set({ error: undefined });
      try {
        const response = await SERVICES_DATA.Data.saveNews(id, action);
        if (response.code === 200) {
          set((state: TDataStoreState) => {
            const currentSavedNews = state.data.normalizedNews[id];
            const { news } = currentSavedNews;
            let updatedSavedNews;
            let updatedNormalizedNews;

            if (action === 'save') {
              const updatedNewsEntry = {
                [id]: {
                  ...currentSavedNews,
                  news: { ...news, saved: 't', saved_count: String(Number(news.saved_count) + 1) },
                },
              };
              updatedSavedNews = {
                ...state.data.savedNews,
                ...updatedNewsEntry,
              };
              updatedNormalizedNews = {
                ...state.data.normalizedNews,
                ...updatedNewsEntry,
              };
            } else {
              updatedSavedNews = { ...state.data.savedNews };
              delete updatedSavedNews[id];
              updatedNormalizedNews = {
                ...state.data.normalizedNews,
                [id]: {
                  ...currentSavedNews,
                  news: { ...news, saved: 'f', saved_count: String(Number(news.saved_count) - 1) },
                },
              };
            }

            return {
              data: {
                ...state.data,
                savedNews: updatedSavedNews,
                normalizedNews: updatedNormalizedNews,
              },
              error: undefined,
            };
          });
        } else {
          set(() => ({
            error: undefined,
          }));
          return response;
        }
      } catch (error) {
        console.error(error);
        set({ ...initialState, error: 'Network or system error' });
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
    fetchNews: async (params: FetchNewsParams): Promise<any> => {
      const { type, start, size, searchQuery } = params;

      const requestConfig: Record<FetchNewsParams['type'], RequestConfig> = {
        getLimitNews: {
          method: SERVICES_DATA.Data.getLimitNews,
          params: { start: start, size: size } as GetLimitNewsParams,
          newsField: 'normalizedNews',
          commentsField: 'normalizedComments',
          updatePostIds: true,
        },
        getSavedNews: {
          method: SERVICES_DATA.Data.getSavedNews,
          params: {} as GetSavedNewsParams,
          newsField: 'savedNews',
          commentsField: 'normalizedSavedComments',
          updatePostIds: false,
        },
        searchNews: {
          method: SERVICES_DATA.Data.searchNews,
          params: { search_query: searchQuery! } as SearchNewsParams,
          newsField: 'searchedNews',
          commentsField: 'normalizedSearchedComments',
          updatePostIds: false,
        },
      };

      const config = requestConfig[type];

      if (type === 'getLimitNews' && (start === undefined || size === undefined)) {
        throw new Error('start and size are required for getLimitNews');
      }
      if (type === 'searchNews' && searchQuery === undefined) {
        throw new Error('searchQuery is required for searchNews');
      }

      set({ error: undefined, loading: true });

      try {
        const response = await config.method(config.params);
        if (!response || !response.data) {
          set({ error: 'No data received', loading: false });
          return response;
        }

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
            error: 'Не удалось загрузить новости',
            loading: false,
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

        commentsStore.setState((state: any) => {
          const currentComments = state[config.commentsField] || {};
          const mergedComments = {
            ...currentComments,
            ...normalizedComments,
          };

          return {
            [config.commentsField]: mergedComments,
          };
        });

        const normalizedNews = news.reduce(
          (acc, item) => ({
            ...acc,
            [item.news.post_id]: item,
          }),
          {},
        );

        const updatedData: Partial<TDataStoreState['data']> = {
          [config.newsField]: {
            ...get().data[config.newsField],
            ...normalizedNews,
          },
        };

        if (config.updatePostIds) {
          const postIds = news.map(item => item.news.post_id);
          const prevPostIds = get().data.postIds || [];
          updatedData.postIds = [...prevPostIds, ...postIds];
        }

        set({
          data: {
            ...get().data,
            ...updatedData,
          },
          loading: false,
        });

        return response;
      } catch (error) {
        console.error(`Error in fetchNews (${type}):`, error);
        set({
          error: error instanceof Error ? error.message : 'Network or system error',
          loading: false,
        });
        return null;
      }
    },

    likeNewsOrComment: async (post_id: string, action: string): Promise<any> => {
      set({ error: undefined });
      if (controllers[post_id]) {
        controllers[post_id].abort();
      }

      const controller = new AbortController();
      controllers[post_id] = controller;
      try {
        await SERVICES_DATA.Data.setLike(post_id, action, { signal: controller.signal });
      } catch (error) {
        console.error(error);
      } finally {
        if (controllers[post_id] === controller) {
          delete controllers[post_id];
        }
      }
    },
    dislikeNews: async (post_id: string, action: string): Promise<any> => {
      set({ error: undefined });
      try {
        await SERVICES_DATA.Data.setDislike(post_id, action);
      } catch (error) {
        console.error(error);
      }
    },
    resetState: () => {
      set(() => ({
        ...initialState,
      }));
    },
  })),
);

export default dataStore;
