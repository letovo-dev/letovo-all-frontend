'use client';

import { login } from '@/shared/api/auth/models/login';
import { AuthService } from '@/shared/api/authService';
import { Utils } from '@/shared/api/utils';
import { useApi2 } from '@/shared/hooks/useApi';
import { dAuthUser, TAuthUser } from '@/shared/types/user';
import { TStore } from '@/shared/types/zustand';
import { create } from 'zustand';

export type TAuthStoreState = {
  loading: boolean;
  error?: string;
  userData: { user: TAuthUser; logged: boolean; authed: boolean };
  setUser: (user: TAuthUser) => void;
  login: (data: { login: string; password: string }) => void;
  _auth: () => void;
  logout: () => void;
  changePass: (url: string, login: string, onDone?: () => void) => void;
  changeLogin: (url: string, login: string, onDone?: () => void) => void;
};

const dUserState = { user: dAuthUser, logged: false, authed: false };

export const authStore: TStore<TAuthStoreState> = create<TAuthStoreState>((set, get) => ({
  loading: false,
  error: undefined,
  userData: dUserState,
  setUser: newUser =>
    set(s => ({ userData: { ...s.userData, user: newUser, logged: true, authed: true } })),
  // login: payload => {
  //   const { login, password } = payload;
  //   set({ error: undefined, loading: true });

  //   // AuthService.login(login, password)
  //   //   .then(r => {
  //   //     if (!r) return;
  //   //     const { token, role } = r;
  //   //     if (typeof window !== 'undefined') {
  //   //       localStorage.setItem('token', token);
  //   //       localStorage.setItem('user', JSON.stringify({ login, role }));
  //   //     }
  //   //     get().setUser({ login, role: r.role });
  //   //     // set((s) => ({ user: { ...s.user, logged: true } }))
  //   //   })
  //   //   .catch(({ message }) => set({ userData: dUserState, error: message }))
  //   //   .finally(() => set({ loading: false }));
  // },
  login: async (payload: any) => {
    try {
      const response = await login(payload);
      if (response.success) {
        const { token, role } = response.data;
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify({ login, role }));
        }
        get().setUser({ login: payload.login, role });
      } else {
        set({ userData: dUserState });
        return response.error;
      }
    } catch (error) {
      console.error(error);
      set({ userData: dUserState });
    }
  },
  _auth: () => {
    const token = localStorage.getItem('token');
    if (!token) {
      if (get().userData.logged) {
        get().logout();
      }
      return;
    }
    set({ loading: true });
    AuthService.auth()
      .then(r => {
        if (!r) {
          get().logout();
          return;
        }
        set({
          userData: { authed: true, logged: true, user: get().userData.user },
          error: undefined,
        });
      })
      .catch(({ message }) => set({ userData: dUserState, error: message }))
      .finally(() => set({ loading: false }));
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
    AuthService.changeLogin(login)
      .catch(({ message }) => set({ userData: dUserState, error: message }))
      .finally(() => set({ loading: false }));
  },
}));

Utils.setupApp();

//? Пользователь уже входил если есть токен

// if (Consts.isEnvDev && env.VITE_USER && process.env.VITE_PASS)
//     authStore.getState().login(process.env.VITE_USER, process.env.VITE_PASS)
