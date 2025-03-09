import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { SERVICES_DATA } from '@/shared/api/data';

export type TDataStoreState = {
  loading: boolean;
  error: string;
  data: {
    avatars: string[];
  };
  getAvatars: () => Promise<void>;
};

const dataState = { data: { avatars: [] } };

const initialState = {
  loading: false,
  error: undefined,
  userStatus: dataState,
};

const dataStore = create<TDataStoreState>()(
  immer((set: (partial: Partial<any>) => void, get: () => any) => ({
    ...initialState,
    getAvatars: async (): Promise<any> => {
      set({ error: undefined, loading: true });
      try {
        const response = await SERVICES_DATA.Data.getAvatars();
        if (response.success && response.code === 200) {
          const {
            data: { result },
          } = response;
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
    resetState: () => {
      set((s: TDataStoreState) => ({
        s,
        ...initialState,
      }));
    },
  })),
);

export default dataStore;
