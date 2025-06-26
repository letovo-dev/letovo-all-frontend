import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist, createJSONStorage } from 'zustand/middleware';
import { SERVICES_DATA } from '@/shared/api/data';
import { jsonrepair } from 'jsonrepair';

export interface OneArticle {
  post_id: string;
  post_path: string;
  is_secret: string;
  likes: string;
  title: string;
  author: string;
  text: string;
  dislikes: string;
  parent_id: string;
  date: string;
  saved_count: string;
  category: string;
  category_name: string;
}
interface ApiResponse {
  success: boolean;
  data: string; // Ожидаем строку, содержащую JSON
  code: number;
  codeMessage: string;
  statusText: string;
  meta?: any;
}

export interface ArticleCategory {
  category: string;
  category_name: string;
}

export type TArticlesStoreState = {
  normalizedArticles: Record<string, OneArticle[]> | null;
  articlesCategories: ArticleCategory[];
  article: OneArticle | undefined;
  isEditArticle: boolean;
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
  getArticlesCategories: () => Promise<ArticleCategory[]>;
  renameArticleCategory: (
    categoryId: string,
    newName: string,
    oldName: string,
  ) => Promise<ArticleCategory[]>;
  deleteArticleCategory: (id: string) => Promise<ArticleCategory[]>;
  deleteArticle: (id: string, categoryId: string) => void;
  renameArticle: (categoryId: string, articleId: string, newName: string) => OneArticle;
  getOneArticle: (id: string, categoryId: string) => OneArticle;
  getArticleMd: (fileName: string) => Promise<any>;
  loadAllArticlesByCategory: (id: string) => Promise<void>;
  setCurrentArticle: (article: OneArticle | undefined) => void;
  refreshArticles: () => Promise<void>;
  createOrUpdateArticle: (article: Partial<OneArticle>, isNew: boolean) => Promise<string>;
};

const initialState = {
  normalizedArticles: {},
  article: undefined,
  loading: false,
  error: null,
  lastFetched: null,
  isEditArticle: false,
};

const CACHE_DURATION = 1000 * 60 * 0.5; // 0,5 minutes

const articlesStore = create<TArticlesStoreState>()(
  persist(
    immer((set: (partial: Partial<any>) => void, get: () => any) => ({
      ...initialState,
      setCurrentArticle: (article: OneArticle) => {
        set((draft: TArticlesStoreState) => {
          draft.article = article;
        });
      },
      createOrUpdateArticle: async (article: OneArticle, isNew: boolean) => {
        set({
          loading: true,
        });

        const method = isNew ? SERVICES_DATA.Data.createNews : SERVICES_DATA.Data.updateArticle;

        try {
          const response = (await method(article)) as {
            code: number;
            data: { result: [OneArticle] };
          };
          if (response.code === 200 && response.data?.result) {
            const data = response.data.result;
            const normalizedArticles = get().normalizedArticles;
            let updatedArticles;
            if (!isNew) {
              updatedArticles = normalizedArticles[article.category].map((el: OneArticle) =>
                el.post_id === data[0].post_id ? { ...data } : el,
              );
            } else {
              // Добавление новой статьи
              updatedArticles = [...(normalizedArticles[article.category] || []), data[0]];
            }

            set((draft: TArticlesStoreState) => {
              draft.normalizedArticles = {
                ...normalizedArticles,
                [article.category]: updatedArticles,
              };
              draft.loading = false;
              draft.article = data[0];
            });
            return 'success';
          } else {
            console.error(`Unexpected response code: ${response.code}`, response);
            set({
              error: `Unexpected response code: ${response.code}`,
              loading: false,
            });
            return 'error';
          }
        } catch (error) {
          console.error('Error saving article:', error);
          set({
            error: error instanceof Error ? error.message : 'Failed to save article',
            loading: false,
          });
        }
      },
      deleteArticle: async (categoryId: string, articleId: string) => {
        set({
          loading: true,
        });
        try {
          const response = await SERVICES_DATA.Data.deleteArticle(articleId);
          if (response.code === 200) {
            const normalizedArticles = get().normalizedArticles;
            const updatedArticles = normalizedArticles[categoryId].filter(
              (el: OneArticle) => el.post_id !== articleId,
            );
            set((draft: TArticlesStoreState) => {
              draft.normalizedArticles = { ...normalizedArticles, [categoryId]: updatedArticles };
              draft.loading = false;
            });
          } else {
            console.error(`Unexpected response code: ${response.code}`, response);
            set({
              error: `Unexpected response code: ${response.code}`,
              loading: false,
            });
          }
        } catch (error) {
          console.error('Error deleting article:', error);
          set({
            error: error instanceof Error ? error.message : 'Failed to delete article',
            loading: false,
          });
          return [];
        }
      },
      renameArticle: async (categoryId: string, articleId: string, newName: string) => {
        set({
          loading: true,
        });
        try {
          const response = (await SERVICES_DATA.Data.updateArticle({
            category: categoryId,
            post_id: articleId,
            title: newName,
          })) as {
            code: number;
            data: { result: ArticleCategory[] };
          };
          if (response.code === 200 && response.data?.result) {
            const data = response.data.result[0];
            const normalizedArticles = get().normalizedArticles;
            const updatedArticles = normalizedArticles[categoryId].map((el: OneArticle) =>
              el.post_id === articleId ? data : el,
            );
            set((draft: TArticlesStoreState) => {
              draft.normalizedArticles = {
                ...normalizedArticles,
                [categoryId]: updatedArticles,
              };
              draft.loading = false;
            });
          } else {
            console.error(`Unexpected response code: ${response.code}`, response);
            set({
              error: `Unexpected response code: ${response.code}`,
              loading: false,
            });
          }
        } catch (error) {
          console.error('Error deleting category:', error);
          set({
            error: error instanceof Error ? error.message : 'Failed to delete articles category',
            loading: false,
          });
          return [];
        }
      },
      deleteArticleCategory: async (categoryId: string) => {
        set({
          loading: true,
        });
        try {
          const response = await SERVICES_DATA.Data.deleteArticlesCategory(categoryId);
          if (response.code === 200) {
            await get().getArticlesCategories();
          } else {
            console.error(`Unexpected response code: ${response.code}`, response);
            set({
              error: `Unexpected response code: ${response.code}`,
              loading: false,
            });
          }
        } catch (error) {
          console.error('Error deleting category:', error);
          set({
            error: error instanceof Error ? error.message : 'Failed to delete articles category',
            loading: false,
          });
          return [];
        }
      },
      renameArticleCategory: async (categoryId: string, newName: string, oldName: string) => {
        try {
          const response = (await SERVICES_DATA.Data.renameCategory(
            categoryId,
            newName,
            oldName,
          )) as {
            code: number;
            data: { result: ArticleCategory[] };
          };
          if (response.code === 200) {
            const updatedCategories = get().articlesCategories.map((el: ArticleCategory) => {
              return el.category_name === oldName ? { ...el, category_name: newName } : el;
            });
            set((draft: TArticlesStoreState) => {
              draft.articlesCategories = updatedCategories;
            });
          }
        } catch (error) {
          console.error('Error deleting category:', error);
          set({
            error: error instanceof Error ? error.message : 'Failed to delete articles category',
            loading: false,
          });
          return [];
        }
      },
      getArticlesCategories: async () => {
        const { lastFetched, articlesCategories } = get();
        const now = Date.now();

        if (lastFetched && now - lastFetched < CACHE_DURATION && articlesCategories?.length > 0) {
          return articlesCategories;
        }

        set({ loading: true, error: null });
        try {
          const response = (await SERVICES_DATA.Data.getArticlesCategories()) as {
            code: number;
            data: { result: ArticleCategory[] };
          };

          if (response.code === 200 && response.data?.result) {
            const categories = response.data.result;
            set((draft: TArticlesStoreState) => {
              draft.articlesCategories = categories;
              draft.lastFetched = now;
            });

            if (categories.length > 0) {
              await get().loadAllArticlesByCategory(categories[0].category);
              set({ loading: false });
              categories.slice(1).forEach(category => {
                get()
                  .loadAllArticlesByCategory(category.category)
                  .catch((error: unknown) => {
                    console.error(
                      `Failed to load articles for category ${category.category}:`,
                      error as Error,
                    );
                  });
              });
            }
            return categories;
          } else {
            throw new Error(`Failed to fetch categories, code: ${response?.code}`);
          }
        } catch (error) {
          console.error('Error fetching categories:', error);
          set({
            error: error instanceof Error ? error.message : 'Failed to get articles categories',
            loading: false,
          });
          return [];
        }
      },
      loadAllArticlesByCategory: async (id: string): Promise<void> => {
        try {
          const { articlesCategories } = get();

          if (!articlesCategories?.length) {
            console.warn('No categories available to load articles');
            set({ error: 'No categories available' });
            return;
          }

          const response = await SERVICES_DATA.Data.getArticlesByCategoryId(Number(id));

          // let parsedData: OneArticle[];
          // try {
          //   const repairedJson = jsonrepair(response.data as any);
          //   const parsedDataRepared = JSON.parse(repairedJson);
          //   parsedData = parsedDataRepared.result.filter(
          //     (item: OneArticle) =>
          //       typeof item === 'object' && item !== null && !Array.isArray(item),
          //   );
          // } catch (e) {
          //   console.error('Failed to parse JSON:', e, response.data);
          //   set({ error: 'Invalid JSON data' });
          //   return;
          // }

          if (
            response.code === 200 ||
            (response.code === 203 && (response.data as { result: OneArticle[] }).result)
          ) {
            const articles = (response.data as { result: OneArticle[] }).result;
            // const articles = parsedData;
            const articlePromises = articles?.map(async articleData => {
              try {
                const { markdown } = await get().getArticleMd(articleData.post_path);
                return { ...articleData, text: markdown };
              } catch (err) {
                console.error(`Failed to load Markdown for article ${articleData.post_id}:`, err);
                return {
                  ...articleData,
                  text: '# Ошибка\nНе удалось загрузить содержимое',
                };
              }
            });

            const articleResults = await Promise.all(articlePromises);

            set((draft: TArticlesStoreState) => {
              if (!draft.normalizedArticles) {
                draft.normalizedArticles = {};
              }
              draft.normalizedArticles[id] = articleResults;
              if (!draft.article && articleResults.length > 0) {
                draft.article = articleResults[0];
              }
            });
          } else {
            console.warn(`No articles found for category ${id}, code: ${response?.code}`);
            set((draft: TArticlesStoreState) => {
              if (!draft.normalizedArticles) {
                draft.normalizedArticles = {};
              }
              draft.normalizedArticles[id] = [];
            });
          }
        } catch (error) {
          console.error(`Failed to load articles for category ${id}:`, error);
          set({ error: `Failed to load articles for category ${id}` });
        }
      },

      getArticleMd: async (fileName: string): Promise<{ markdown: string }> => {
        // set({ loading: true });
        try {
          const response = await SERVICES_DATA.Data.getArticleMd(fileName);
          if ((response && response.code === 200) || response.code === 203) {
            let markdown: string;
            if (typeof response.data === 'string') {
              markdown = response.data;
            } else if (
              response.data &&
              typeof (response.data as { response: string }).response === 'string'
            ) {
              const data = response.data as { response: string };
              markdown = data.response;
            } else {
              console.warn('Unexpected response format for Markdown:', response.data);
              return { markdown: '# Ошибка\nНе удалось загрузить изображение' };
            }
            return { markdown };
          } else {
            console.warn('Failed to fetch Markdown, response code:', response?.code);
            return { markdown: '# Ошибка\nНе удалось загрузить изображение' };
          }
        } catch (error) {
          console.error('Failed to fetch the article file:', error);
          set({ error: 'Failed to fetch the article file' });
          return { markdown: '# Ошибка\nНе удалось загрузить изображение' };
        } finally {
          // set({ loading: false });
        }
      },
      getOneArticle: (id: string, categoryId: string) => {
        return get().normalizedArticles[categoryId].find(
          (article: OneArticle) => article.post_id === id,
        );
      },
      refreshArticles: async () => {
        set({ lastFetched: null });
        await get().getArticlesCategories();
      },
    })),

    {
      name: 'articles-store',
      storage: createJSONStorage(() => {
        return typeof window !== 'undefined'
          ? localStorage
          : { getItem: () => null, setItem: () => {}, removeItem: () => {} };
      }),
      partialize: state => ({
        normalizedArticles: state.normalizedArticles,
        articlesCategories: state.articlesCategories,
        article: state.article,
        lastFetched: state.lastFetched,
        isEditArticle: state.isEditArticle,
      }),
    },
  ),
);

export default articlesStore;
