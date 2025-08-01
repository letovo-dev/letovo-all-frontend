import { produce } from 'immer';
import { create } from 'zustand';
import { devtools, subscribeWithSelector, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { Modal } from 'antd';
import { SERVICES_USERS } from '@/shared/api/user';
import authStore, { TAuthStoreState } from '../auth-store';
import { SERVICES_ACHIEVEMENTS } from '@/shared/api/achievements';
import { SERVICES_DATA } from '@/shared/api/data';

export interface IUserAchData {
  id: string;
  username: string;
  achivement_id: string;
  datetime: string;
  stage: string;
  achivement_pic: string;
  achivement_name: string;
  achivement_decsription: string;
  achivement_tree: string;
  level: string;
  stages: string;
  done?: boolean;
}

export interface IUserData {
  active: string;
  avatar_pic: string;
  balance: string;
  departmentid: string;
  departmentname: string;
  jointime: string;
  paycheck: string;
  registered: string;
  role: string;
  times_visited: string;
  userid: string;
  username: string;
  userrights: string;
}

export interface IUserStore {
  store: {
    userData: IUserData;
    userAchievements: IUserAchData | undefined;
    allPossibleUserAchievements: IUserAchData[] | undefined;
    departmentAchievements: IUserAchData[] | undefined;
    allPostsAuthors: IUserData[];
  };
  localeName: string;
  endPreload: boolean;
  getAllUserAchievements: (value: string) => void;
  getAchievementsDepartment: () => void;
  isRequireUserInDatabase: (value: string) => { userName: string; avatar: string };
  transferMoney: (data: { receiver: string; amount: number }) => Promise<any>;
  setEndPreload: (value: boolean) => Promise<void>;
  setError: (error?: string) => void;
  resetState: () => void;
  setAvatar: (avatar: string) => Promise<void>;
  changeLogin: (login: string) => Promise<void>;
  loading: boolean;
  error?: string | undefined;
  getAllPostsAuthors: () => Promise<void>;
}

const initialState = {
  userData: {
    userid: '',
    username: '',
    userrights: '',
    jointime: '',
    avatar_pic: '',
    active: '',
    departmentid: '',
    role: '',
    registered: '',
    balance: '',
    times_visited: '',
  },
  userAchievements: undefined,
  allPossibleUserAchievements: undefined,
  departmentAchievements: undefined,
  error: undefined,
  allPostsAuthors: [],
};

const userStore = create<IUserStore>()(
  persist(
    subscribeWithSelector(
      devtools(
        immer((set: (partial: Partial<any>) => void, get: () => any) => ({
          store: {
            ...initialState,
          },
          localeName: 'User store',
          endPreload: false,
          setEndPreload: (value: any) => {
            set((state: IUserStore) => {
              state.endPreload = value;
            });
          },
          getAllUserAchievements: async (login: string) => {
            try {
              const response = await SERVICES_ACHIEVEMENTS.AchievementsData.list();
              if (response?.success && response.code !== undefined && response.code === 200) {
                const { result } = response?.data as { result: IUserAchData[] };
                set((draft: IUserStore) => {
                  draft.store.allPossibleUserAchievements = result;
                });
              } else {
                get().setError('Ошибка загрузки данных с сервера');
                Modal.error({
                  title: 'Ошибка загрузки данных с сервера',
                  content: `${get().error}`,
                });
              }
            } catch (error: any) {
              produce(get(), (draft: IUserStore) => {
                draft.error = error instanceof Error ? error.message : String(error);
              });
            }
          },
          getAchievementsDepartment: async () => {
            try {
              const response = await SERVICES_ACHIEVEMENTS.AchievementsData.department();
              if (response?.success && response.code !== undefined && response.code === 200) {
                const { result } = response?.data as { result: IUserAchData[] };
                set((draft: IUserStore) => {
                  draft.store.departmentAchievements = result;
                });
              } else {
                get().setError('Ошибка загрузки данных с сервера');
                Modal.error({
                  title: 'Ошибка загрузки данных с сервера',
                  content: `${get().error}`,
                });
              }
            } catch (error: any) {
              produce(get(), (draft: IUserStore) => {
                draft.error = error instanceof Error ? error.message : String(error);
              });
            }
          },
          isRequireUserInDatabase: async (userName: string) => {
            set({ loading: true });
            try {
              const response = await SERVICES_USERS.UsersData.getUserData(userName);

              if (response?.success && response.code === 200) {
                const { result } = response?.data as { result: IUserData[] };
                if (result[0].username === userStore.getState().store.userData.username) {
                  set({ error: 'Перевод себе невозможен' });
                  return undefined;
                }
                set({ error: undefined });
                return { userName: result[0].username, avatar: result[0].avatar_pic };
              } else {
                set({ error: response.codeMessage });
                return undefined;
              }
            } catch (error) {
              console.error(error);
              set({ error: 'Something went wrong, try later' });
            } finally {
              set({ loading: false });
            }
          },
          transferMoney: async (data: { receiver: string; amount: number }) => {
            set({ error: undefined, loading: true });
            try {
              const response: {
                code?: number;
                data: string;
                codeMessage?: string;
              } = await SERVICES_USERS.UsersData.transferPrepare(data);
              if (response && response.code === 200) {
                try {
                  const responseToSend: {
                    code?: number;
                    data: { result: any };
                    codeMessage?: string;
                    statusText?: string;
                  } = await SERVICES_USERS.UsersData.transferSend({ tr_id: response.data });
                  if (
                    responseToSend &&
                    responseToSend.code === 200 &&
                    responseToSend?.statusText === 'OK'
                  ) {
                    set({ error: undefined });
                    return 'success';
                  } else {
                    set({ error: responseToSend.codeMessage });
                  }
                } catch (error) {
                  console.error(error);
                  set({ error: 'Something went wrong, try later' });
                } finally {
                  set({ loading: false });
                }

                set({ error: undefined });
              } else {
                set({ error: response.codeMessage });
              }
            } catch (error) {
              console.error(error);
              set({ error: 'Something went wrong, try later' });
            } finally {
              set({ loading: false });
            }
          },
          setAvatar: async (avatar: string) => {
            set({ error: undefined, loading: true });
            try {
              const response: {
                code?: number;
                data: { result: IUserData[] };
                codeMessage?: string;
              } = await SERVICES_USERS.UsersData.setAvatar({ avatar });
              if (response && response.code === 200) {
                const {
                  data: { result },
                } = response;
                userStore.setState((draft: IUserStore) => {
                  draft.store.userData = result[0];
                });
                set({ error: undefined });
              } else {
                set({ error: response.codeMessage });
              }
            } catch (error) {
              console.error(error);
              set({ error: 'Network or system error' });
            } finally {
              set({ loading: false });
            }
          },
          changeLogin: async (new_username: string) => {
            set({ error: undefined, loading: true });
            try {
              const response: {
                code?: number;
                success: boolean;
                authorization?: string;
                data: { result: IUserData[] };
                codeMessage?: string;
              } = await SERVICES_USERS.UsersData.changeNick({ new_username });
              if (response?.success && response.code === 200) {
                const token = response.authorization;
                authStore.setState((draft: TAuthStoreState) => {
                  draft.userStatus = { ...draft.userStatus, token: token };
                });
                const {
                  data: { result },
                } = response;
                userStore.setState((draft: IUserStore) => {
                  draft.store.userData = result[0];
                });
                set((draft: IUserStore) => ({ ...draft, error: undefined }));
                if (result[0].registered === 't') {
                  authStore.setState((draft: TAuthStoreState) => {
                    draft.userStatus = { ...draft.userStatus, registered: true };
                  });
                }
              } else {
                set((draft: IUserStore) => ({
                  ...draft,
                  error: response.codeMessage,
                }));
              }
            } catch (err) {
              console.error(err);
              set({ error: 'Не удалось сменить ник' });
            } finally {
              set({ loading: false });
            }
          },
          getAllPostsAuthors: async (): Promise<any> => {
            set({ error: undefined });
            try {
              const response = await SERVICES_DATA.Data.getAllPostsAuthors();
              if (response.success && response.code === 200) {
                const { result } = response?.data as { result: IUserData[] };
                userStore.setState((draft: IUserStore) => {
                  draft.store.allPostsAuthors = result;
                });
              } else {
                set({ error: response.codeMessage });
              }
            } catch (error) {
              console.error(error);
              set({ error: 'Network or system error' });
            } finally {
              set({ loading: false });
            }
          },
        })),
      ),
    ),
    { name: 'userStore' },
  ),
);

export default userStore;
