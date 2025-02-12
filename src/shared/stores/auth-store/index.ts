'use client';

import { auth } from '@/shared/api/auth/models/auth';
import { login } from '@/shared/api/auth/models/login';
import { IApiReturn } from '@/shared/lib/ApiSPA';
import { dAuthUser, TAuthUser } from '@/shared/types/user';
import { TStore } from '@/shared/types/zustand';
import { redirect } from 'next/navigation';
import { create } from 'zustand';
import userStore, { IUserStore } from '../user-store';
import { SERVICES_USERS } from '@/shared/api/user';

export type TAuthStoreState = {
  loading: boolean;
  error?: string;
  userData: { user: TAuthUser; logged: boolean; authed: boolean };
  setUser: (user: TAuthUser) => void;
  login: (data: { login: string; password: string }) => void;
  auth: () => Promise<IApiReturn<unknown>>;
  logout: () => void;
};

const dUserState = { user: dAuthUser, logged: false, authed: false };

export const authStore: TStore<TAuthStoreState> = create<TAuthStoreState>((set, get) => ({
  loading: false,
  error: undefined,
  userData: dUserState,
  setUser: newUser => {
    set(s => ({ userData: { ...s.userData, user: newUser, logged: true, authed: true } }));
  },
  login: async (payload: any) => {
    set({ error: undefined, loading: true });
    try {
      const response = await login(payload);
      console.log('login response', response);

      if (response && response.code === 200) {
        const {
          data: { result },
        } = response;
        userStore.setState((draft: IUserStore) => {
          draft.store.userData = result[0];
        });

        const role = result[0]?.userrights;
        const token = response?.authorization;
        if (token) {
          localStorage.setItem('token', token);
        }
        localStorage.setItem(
          'user',
          JSON.stringify({
            login: payload.login,
            role: role === '' ? 'student' : role,
            logged: true,
            authed: true,
          }),
        );
        get().setUser({ login: payload.login, role: role === '' ? 'student' : role });
      } else {
        set({ error: response.codeMessage });
        return;
      }
    } catch (error) {
      console.error(error);
      set({ userData: dUserState, error: 'Network or system error' });
    } finally {
      set({ loading: false });
    }
  },
  auth: async (): Promise<any> => {
    const token = localStorage.getItem('token');
    if (!token) {
      get().logout();
      redirect('./login');
    }
    set({ error: undefined, loading: true });
    try {
      const response = await auth();
      console.log('auth resp', response);

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
        set({ userData: dUserState, error: response.codeMessage });
        get().logout();
        return;
      }
    } catch (error: any) {
      console.error(error);
      set({ userData: dUserState, error: 'Network or system error' });
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
    set({ error: undefined, loading: false });
  },
}));
