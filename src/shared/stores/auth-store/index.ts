'use client';

import { auth } from '@/shared/api/auth/models/auth';
import { login } from '@/shared/api/auth/models/login';
import { AuthService } from '@/shared/api/authService';
import { Utils } from '@/shared/api/utils';
import { useApi } from '@/shared/hooks/useApi';
import { IApiReturn } from '@/shared/lib/ApiSPA';
import { dAuthUser, TAuthUser } from '@/shared/types/user';
import { TStore } from '@/shared/types/zustand';
import { redirect } from 'next/navigation';
import { create } from 'zustand';

export type TAuthStoreState = {
  loading: boolean;
  error?: string;
  userData: { user: TAuthUser; logged: boolean; authed: boolean };
  setUser: (user: TAuthUser) => void;
  login: (data: { login: string; password: string }) => void;
  auth: () => Promise<IApiReturn<unknown>>;
  logout: () => void;
  changePass: (url: string, login: string, onDone?: () => void) => void;
  changeLogin: (url: string, login: string, onDone?: () => void) => void;
};

const dUserState = { user: dAuthUser, logged: false, authed: false };

export const authStore: TStore<TAuthStoreState> = create<TAuthStoreState>((set, get) => ({
  loading: false,
  error: undefined,
  userData: dUserState,
  setUser: newUser => {
    console.log('newUser', newUser);

    set(s => ({ userData: { ...s.userData, user: newUser, logged: true, authed: true } }));
  },
  login: async (payload: any) => {
    set({ error: undefined, loading: true });
    try {
      const response = await login(payload);
      // const response = {
      //   data: {
      //     token: '6eb796c9e7947df61ba4fdeca6139094c3434fc2ed3233f5aff7110a2739f18f',
      //     role: 'student',
      //   },
      //   success: true,
      //   error: false,
      // };
      if (response.success) {
        const { token, role } = response.data;
        // if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify({ login: payload.login, role }));
        // }
        get().setUser({ login: payload.login, role: role });
      } else {
        set({ userData: dUserState });
        console.log('response===+++++++++++++>>>>', response);

        return response;
      }
    } catch (error) {
      console.error(error);
      set({ userData: dUserState });
    } finally {
      set({ loading: false });
    }
  },
  auth: async (): Promise<any> => {
    const token = localStorage.getItem('token');
    console.log('token---', token);

    if (!token) {
      get().logout();
      redirect('./login');
    }
    set({ error: undefined, loading: true });
    try {
      const response = await auth();

      // const response = {
      //   data: {
      //     token: '6eb796c9e7947df61ba4fdeca6139094c3434fc2ed3233f5aff7110a2739f18f',
      //     role: 'student',
      //   },
      //   success: true,
      //   error: false,
      // };
      if (response.success) {
        const userString = localStorage.getItem('user');
        if (userString) {
          try {
            const { login, role } = JSON.parse(userString);
            get().setUser({ login, role });
          } catch (error) {
            console.error('Error parsing user data:', error);
          }
        } else {
          console.log('No user data in localStorage.');
        }
      } else {
        get().logout();
        return {
          success: false,
          data: undefined,
        };
      }
    } catch (error: any) {
      console.error(error);
      set({ userData: dUserState, error });
      return {
        success: false,
        data: undefined,
      };
    } finally {
      set({ loading: false });
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ userData: dUserState });
  },
  changePass: login => {
    set({ error: undefined, loading: true });
    AuthService.changePass(login)
      .catch(({ message }) => set({ userData: dUserState, error: message }))
      .finally(() => set({ loading: false }));
  },
  changeLogin: login => {
    set({ error: undefined, loading: true });
    AuthService.changeLogin(login).catch(({ message }) =>
      set({ userData: dUserState, error: message }),
    );
    // .finally(() => set({ loading: false }));
  },
}));

// Utils.setupApp();

//? Пользователь уже входил если есть токен

// if (Consts.isEnvDev && env.VITE_USER && process.env.VITE_PASS)
//     authStore.getState().login(process.env.VITE_USER, process.env.VITE_PASS)
