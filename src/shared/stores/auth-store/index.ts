import { create } from 'zustand';
import { persist, PersistOptions } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { SERVICES_AUTH } from '@/shared/api/auth';
import { SERVICES_USERS } from '@/shared/api/user';
import userStore, { IUserStore } from '../user-store';

export interface TAuthStoreState {
  loading: boolean;
  error: string | undefined;
  userStatus: {
    logged: boolean;
    authed: boolean;
    registered: boolean;
    token: string | undefined;
  };
  login: (data: { login: string; password: string }) => Promise<void>;
  auth: () => Promise<{ success: boolean; message?: string }>;
  register: () => Promise<{ success: boolean }>;
  changePass: (pass: string) => Promise<void>;
  logout: () => void;
  resetState: () => void;
}

const initialState: Pick<TAuthStoreState, 'loading' | 'error' | 'userStatus'> = {
  loading: false,
  error: undefined,
  userStatus: {
    logged: false,
    authed: false,
    registered: false,
    token: '',
  },
};

const persistOptions: PersistOptions<TAuthStoreState> = {
  name: 'authStore',
};

const authStore = create<TAuthStoreState>()(
  persist(
    immer((set, get) => ({
      ...initialState,
      login: async (payload: { login: string; password: string }): Promise<void> => {
        set({ error: undefined, loading: true });
        try {
          const response = await SERVICES_AUTH.Auth.login(payload);
          if (response.success && response.code === 200) {
            const {
              data: { result },
            } = response;
            userStore.setState((draft: IUserStore) => {
              draft.store.userData = result[0];
            });
            const token = response?.authorization;
            const registered = result[0]?.registered === 'f' ? false : true;
            set({
              userStatus: { logged: true, authed: true, registered, token },
              error: undefined,
            });
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
      auth: async (): Promise<{ success: boolean; message?: string }> => {
        set({ error: undefined, loading: true });
        try {
          const response = await SERVICES_AUTH.Auth.auth();
          if (response.success && response.code === 200) {
            const responseData = response?.data as { status: string };
            if (responseData.status === 't') {
              set(state => ({
                ...state,
                userStatus: { ...state.userStatus, authed: true },
                error: undefined,
              }));
              return { success: true, message: 'Authenticated' };
            } else {
              get().logout();
              return { success: false, message: 'Invalid status' };
            }
          } else {
            get().logout();
            return { success: false, message: 'Request failed' };
          }
        } catch (error) {
          console.error(error);
          set({ userStatus: initialState.userStatus, error: 'Network or system error' });
          return { success: false, message: 'Network or system error' };
        } finally {
          set({ loading: false });
        }
      },
      register: async (): Promise<{ success: boolean }> => {
        set({ error: undefined, loading: true });
        try {
          const response = await SERVICES_AUTH.Auth.register();
          if (response.success && response.code === 200 && response.data === 'ok') {
            set(state => ({
              userStatus: { ...state.userStatus, registered: true },
              error: undefined,
            }));
            return { success: true };
          } else {
            set(state => ({
              userStatus: { ...state.userStatus, registered: false },
              error: 'Registration failed',
            }));
            return { success: false };
          }
        } catch (error) {
          console.error(error);
          set({ userStatus: initialState.userStatus, error: 'Network or system error' });
          return { success: false };
        } finally {
          set({ loading: false });
        }
      },
      changePass: async (pass: string): Promise<void> => {
        set({ error: undefined, loading: true });
        try {
          await SERVICES_USERS.UsersData.changePass({
            unlogin: false,
            new_password: pass,
          });
          set({ error: undefined });
        } catch (error) {
          console.error(error);
          set({ error: 'Failed to change password' });
        } finally {
          set({ loading: false });
        }
      },
      logout: (): void => {
        set({
          userStatus: { logged: false, authed: false, registered: false, token: undefined },
          error: undefined,
          loading: false,
        });
      },
      resetState: (): void => {
        set(initialState);
      },
    })),
    persistOptions,
  ),
);

export default authStore;
