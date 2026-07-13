import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist, createJSONStorage } from 'zustand/middleware';
import { SERVICES_DATA } from '@/shared/api/data';
import { applySocialCountDelta, normalizeSocialCounters } from '@/shared/utils';

export interface OneComment {
  author: string;
  display_name: string | null;
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

export type TCommentsStoreState = {
  commentReply: '';
  openComments: string;
  loading: boolean;
  error: string | null;
  normalizedComments: Record<string, OneComment[]> | null;
  normalizedSavedComments: Record<string, OneComment[]> | null;
  normalizedSearchedComments: Record<string, OneComment[]> | null;
  addComment: (comment: string) => Promise<void>;
  setOpenComments: (id: string) => void;
  setCommentReply: (text: string) => void;
  getLimitNewsComments: (post_id: number, start: number, size: number) => Promise<OneComment[]>;
  saveComment: (comment: string, post_id: string, author: string | undefined) => Promise<any>;
  deleteComment: (id: string, post_id: string) => void;
  getCurrentNewsPics: (id: number) => Promise<any>;
  likeComment: (comment_id: string, parent_id: string, action: string) => Promise<void>;
  dislikeComment: (comment_id: string, parent_id: string, action: string) => Promise<void>;
};

const initialState = {
  commentReply: '',
  normalizedComments: {},
  openComments: '',
  loading: false,
  error: null,
};

const commentsStore = create<TCommentsStoreState>()(
  persist(
    immer((set: (partial: Partial<any>) => void, get: () => any) => ({
      ...initialState,
      getLimitNewsComments: async (post_id: number, start: number, size: number): Promise<any> => {
        set({ error: null, loading: true });
        try {
          const response = await SERVICES_DATA.Data.getLimitNewsComments({ post_id, start, size });
          if (response?.success || response?.code === 200) {
            const result = ((response?.data as { result: OneComment[] })?.result ?? []).map(
              normalizeSocialCounters,
            );
            set((state: TCommentsStoreState) => {
              const postId = String(post_id);
              const existing = start === 0 ? [] : (state.normalizedComments?.[postId] ?? []);
              const comments = [...existing, ...result];
              const deduplicated = Array.from(
                new Map(comments.map(comment => [String(comment.post_id), comment])).values(),
              );
              return {
                normalizedComments: {
                  ...state.normalizedComments,
                  [postId]: deduplicated,
                },
              };
            });
            return result;
          } else {
            set({ error: response?.codeMessage || 'Не удалось загрузить комментарии' });
            return [];
          }
        } catch (error) {
          console.error('getLimitNewsComments error:', error);
          set({
            error: error instanceof Error ? error.message : 'Не удалось загрузить комментарии',
          });
          return [];
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
        }
      },
      setOpenComments: (commentId: string) => {
        set({ openComments: commentId });
      },
      setCommentReply: (text: string) => {
        set(() => ({
          commentReply: text,
        }));
      },
      saveComment: async (
        comment: string,
        post_id: string,
        author: string | undefined,
      ): Promise<any> => {
        set({ error: null, loading: true });
        try {
          const response = await SERVICES_DATA.Data.saveComments(comment, post_id, author);

          if (response.code === 200) {
            const result = ((response?.data as { result: OneComment[] })?.result ?? []).map(
              normalizeSocialCounters,
            );
            set((state: TCommentsStoreState) => ({
              normalizedComments: {
                ...state.normalizedComments,
                [post_id]: [...(state.normalizedComments?.[post_id] || []), ...result],
              },
            }));
            return result;
          } else {
            set({ error: 'Failed to save comment' });
            return [];
          }
        } catch (error) {
          console.error('saveComment error:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to save comment' });
          return [];
        } finally {
          set({ loading: false });
        }
      },
      likeComment: async (comment_id: string, parent_id: string, action: string): Promise<void> => {
        try {
          const res = await SERVICES_DATA.Data.setLike(comment_id, action);
          if (res.code === 200 || res.success) {
            const state: any = get();
            const list: OneComment[] | undefined = state.normalizedComments?.[parent_id];
            if (!list) {
              console.error(`Comments for post ${parent_id} not found`);
              return;
            }
            const updated = list.map(c => {
              if (c.post_id !== comment_id) return c;
              const next: OneComment = {
                ...c,
                is_liked: action === 'delete' ? 'f' : 't',
                likes: applySocialCountDelta(c.likes, action === 'delete' ? -1 : 1),
              };
              if (c.is_disliked === 't' && action !== 'delete') {
                next.is_disliked = 'f';
                next.dislikes = applySocialCountDelta(c.dislikes, -1);
              }
              return next;
            });
            set({
              normalizedComments: {
                ...state.normalizedComments,
                [parent_id]: updated,
              },
            });
          } else {
            console.error('likeComment failed:', res);
          }
        } catch (error) {
          console.error('likeComment error:', error);
        }
      },
      dislikeComment: async (
        comment_id: string,
        parent_id: string,
        action: string,
      ): Promise<void> => {
        try {
          const res = await SERVICES_DATA.Data.setDislike(comment_id, action);
          if (res.code === 200 || res.success) {
            const state: any = get();
            const list: OneComment[] | undefined = state.normalizedComments?.[parent_id];
            if (!list) {
              console.error(`Comments for post ${parent_id} not found`);
              return;
            }
            const updated = list.map(c => {
              if (c.post_id !== comment_id) return c;
              const next: OneComment = {
                ...c,
                is_disliked: action === 'delete' ? 'f' : 't',
                dislikes: applySocialCountDelta(c.dislikes, action === 'delete' ? -1 : 1),
              };
              if (c.is_liked === 't' && action !== 'delete') {
                next.is_liked = 'f';
                next.likes = applySocialCountDelta(c.likes, -1);
              }
              return next;
            });
            set({
              normalizedComments: {
                ...state.normalizedComments,
                [parent_id]: updated,
              },
            });
          } else {
            console.error('dislikeComment failed:', res);
          }
        } catch (error) {
          console.error('dislikeComment error:', error);
        }
      },
      deleteComment: async (id: string, post_id: string): Promise<any> => {
        set({ loading: true, error: undefined });
        try {
          const response = await SERVICES_DATA.Data.deleteNews(id);
          if (response.success && response.code === 200) {
            set((state: TCommentsStoreState) => ({
              normalizedComments: {
                ...state.normalizedComments,
                [post_id]: [
                  ...(state.normalizedComments?.[post_id].filter(
                    comment => comment.post_id !== id,
                  ) || []),
                ],
              },
            }));
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
    })),

    {
      name: 'comments-store',
      storage: createJSONStorage(() => {
        return typeof window !== 'undefined'
          ? localStorage
          : { getItem: () => null, setItem: () => {}, removeItem: () => {} };
      }),
      partialize: state => ({
        openComments: state.openComments,
        normalizedComments: state.normalizedComments,
        normalizedSavedComments: state.normalizedSavedComments,
        normalizedSearchedComments: state.normalizedSearchedComments,
      }),
    },
  ),
);

export default commentsStore;
