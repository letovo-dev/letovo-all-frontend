import { create } from 'zustand';
import { SERVICES_USERS } from '@/shared/api/user';
import { persist } from 'zustand/middleware';
import { SERVICES_AUTH } from '@/shared/api/auth';
import { immer } from 'zustand/middleware/immer';
import userStore, { IUserStore } from '../user-store';

export type TAuthStoreState = {
  loading: boolean;
  error: string;
  userStatus: {
    logged: boolean;
    authed: boolean;
    registered: boolean;
    token: string | undefined;
  };
  login: (data: { login: string; password: string }) => Promise<void>;
  auth: () => Promise<void>;
  changePass: (pass: string) => Promise<void>;
  register: () => Promise<void>;
  logout: () => Promise<void>;
};

const dUserState = { logged: false, authed: false, registered: false, token: '' };

const initialState = {
  loading: false,
  error: undefined,
  userStatus: dUserState,
};

const authStore = create<TAuthStoreState>()(
  persist(
    immer((set: (partial: Partial<any>) => void, get: () => any) => ({
      // ...initialState,
      login: async (payload: any): Promise<any> => {
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
              userStatus: { logged: true, authed: true, registered: registered, token },
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
      auth: async (): Promise<any> => {
        set({ error: undefined, loading: true });
        try {
          const response = await SERVICES_AUTH.Auth.auth();
          if (response.success && response.code === 200) {
            const responseData = response?.data as { status: string };
            if (responseData.status === 't') {
              set((s: TAuthStoreState) => ({
                ...s,
                userStatus: { ...s.userStatus, authed: true },
                error: undefined,
              }));
              return { success: true, data: responseData };
            } else {
              get().logout();
              return { success: false, message: 'Invalid status' };
            }
          } else {
            get().logout();
            return { success: false, message: 'Request failed' };
          }
        } catch (error: any) {
          console.error(error);
          set({ userStatus: dUserState, error: 'Network or system error' });
          return { success: false, error: 'Network or system error' };
        } finally {
          set({ loading: false });
        }
      },

      register: async () => {
        set({ error: undefined, loading: true });
        try {
          const response = await SERVICES_AUTH.Auth.register();
          if (response.success && response.code === 200 && response.data === 'ok') {
            set((s: TAuthStoreState) => ({
              userStatus: { ...s.userStatus, registered: true },
              error: undefined,
            }));
          } else {
            set((s: TAuthStoreState) => ({
              userStatus: {
                ...s.userStatus,
                registered: false,
              },
              error: 'Ошибка регистрации',
            }));
          }
        } catch (error: any) {
          console.error(error);
          set({ userStatus: dUserState, error: 'Network or system error' });
          return {
            success: false,
          };
        } finally {
          set({ loading: false });
        }
      },
      changePass: async (pass: string) => {
        set({ error: undefined, loading: true });
        try {
          const response = await SERVICES_USERS.UsersData.changePass({
            unlogin: false,
            new_password: pass,
          });
        } catch (err) {
          console.error(err);
          set({ error: 'Не удалось сменить пароль' });
        } finally {
          set({ loading: false });
        }
      },
      logout: () => {
        set((s: TAuthStoreState) => ({
          userStatus: { ...s.userStatus, logged: false, authed: false, token: '' },
        }));
        set({ error: undefined, loading: false });
      },
      resetState: () => {
        set((s: TAuthStoreState) => ({
          ...initialState,
        }));
      },
    })),
    { name: 'authStore' },
  ),
);

export default authStore;
