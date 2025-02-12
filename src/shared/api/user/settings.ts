import { IApiEntityScheme } from '../../lib/ApiSPA';

type IEndpoint = (typeof API_USER_ENDPOINTS)[number];

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

export const API_USER_SCHEME: IApiEntityScheme<IEndpoint> = {
  userData: {
    method: 'GET',
    url: `/user`,
  },
  userAchiv: {
    method: 'GET',
    url: `/achivements/user`,
  },
  userAchivAllEnable: {
    method: 'GET',
    url: `/achivements/user/full`,
  },
  userHistory: {
    method: 'GET',
    url: `/actives/user_history`,
  },
  userActives: {
    method: 'GET',
    url: `/actives/user_actives`,
  },
  setAvatar: {
    method: 'PUT',
    url: `/user/set_avatar`,
  },
  addRole: {
    method: 'POST',
    url: `/user/add_role`,
  },
  changePass: {
    method: 'PUT',
    url: `/auth/change_password`,
  },
  changeNick: {
    method: 'PUT',
    url: `/auth/change_username`,
  },
};

export const API_USER_ENDPOINTS = [
  'userData',
  'userAchiv',
  'userHistory',
  'userActives',
  'userAchivAllEnable',
  'setAvatar',
  'addRole',
  'changePass',
  'changeNick',
] as const;
