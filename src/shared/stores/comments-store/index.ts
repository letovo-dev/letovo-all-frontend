// 'use client';

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist, createJSONStorage } from 'zustand/middleware';
import { SERVICES_DATA } from '@/shared/api/data';
import { Comment } from '../data-store';

export interface OneComment {
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

export type TCommentsStoreState = {
  commentReply: '';
  openComments: string;
  normalizedComments: Record<string, OneComment[]> | null;
  normalizedSavedComments: Record<string, OneComment[]> | null;
  normalizedSearchedComments: Record<string, OneComment[]> | null;
  addComment: (comment: string) => Promise<void>;
  setOpenComments: (id: string) => void;
  setCommentReply: (text: string) => void;
  getLimitNewsComments: (post_id: number, start: number, size: number) => Promise<void>;
  saveComment: (comment: string, post_id: string, author: string | undefined) => Promise<any>;
  deleteComment: (id: string, post_id: string) => void;
  getCurrentNewsPics: (id: number) => Promise<any>;
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
            const result = (response?.data as { result: OneComment[] })?.result;
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
