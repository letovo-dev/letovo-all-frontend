import { produce } from 'immer';
import { create } from 'zustand';
import { devtools, subscribeWithSelector, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { Modal } from 'antd';
import { StoreStates } from '@/shared/types/storeStates';
import { SERVICES_USERS } from '@/shared/api/user';

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
}

export interface IUserData {
  userid: string;
  username: string;
  userrights: string;
  jointime: string;
  avatar_pic: string;
  active: string;
  departmentid: string;
  rolename: string;
}

export interface IUserStore {
  store: {
    userData: IUserData;
    userAchievements: IUserAchData | undefined;
    allPossibleUserAchievements: IUserAchData[] | undefined;
    error: string | undefined;
  };
  localeName: string;
  endPreload: boolean;
  getAllUserAchievements: (value: string) => void;
  setEndPreload: (value: boolean) => void;
  setError: (error?: string) => void;
  resetState: () => void;
  changePass: (url: string, login: string, onDone?: () => void) => void;
  changeLogin: (url: string, login: string, onDone?: () => void) => void;
  loading: boolean;
  error?: string;
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
    rolename: '',
  },
  userAchievements: undefined,
  allPossibleUserAchievements: undefined,
  error: '',
};

const userStore = create(
  persist(
    subscribeWithSelector(
      devtools(
        immer((set: (partial: Partial<any>) => void, get: () => any) => ({
          store: {
            ...initialState,
          },
          localeName: 'User store',
          endPreload: false,
          resetState: () => {
            set((state: IUserStore) => {
              state.store = {
                ...initialState,
              };
            });
          },
          setEndPreload: (value: any) => {
            set((state: IUserStore) => {
              state.endPreload = value;
            });
          },
          getAllUserAchievements: async (login: string) => {
            try {
              const response = await SERVICES_USERS.UsersData.getAllUserAchievements(login);
              console.log('response', response);
              if (response?.success && response.code === 200) {
                // produce((draft: IUserStore) => {
                //   draft.store.trainsData = trains;
                // });
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
                draft.store.error = error instanceof Error ? error.message : String(error);
              });
            }
          },
          changePass: async (pass: string) => {
            set({ error: undefined, loading: true });
            try {
              const response = await SERVICES_USERS.UsersData.changePass({
                unlogin: false,
                new_password: pass,
              });
              console.log('changePass response', response);
            } catch (err) {
              console.error(err);
              set({ error: 'Не удалось сменить пароль' });
            } finally {
              () => set({ loading: false });
            }
          },
          changeLogin: async (new_username: string) => {
            set({ error: undefined, loading: true });
            try {
              const response = await SERVICES_USERS.UsersData.changeNick({ new_username });
              console.log('changeLogin response', response);
              // set((state: IUserStore) => {
              //   state.store.userData.username = '';
              // });
            } catch (err) {
              console.error(err);
              set({ error: 'Не удалось сменить никнейм' });
            } finally {
              () => set({ loading: false });
            }
          },
        })),
      ),
    ),
    { name: 'userStore' },
  ),
);

export default userStore;
