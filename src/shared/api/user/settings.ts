import { IApiEntityScheme } from '../../lib/ApiSPA';

type IEndpoint = (typeof API_USER_ENDPOINTS)[number];

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

export const API_USER_SCHEME: IApiEntityScheme<IEndpoint> = {
  userData: {
    method: 'GET',
    url: `${baseUrl}/user`,
  },
  userAchiv: {
    method: 'GET',
    url: `${baseUrl}/achivements/user`,
  },
  userAchivAllEnable: {
    method: 'GET',
    url: `${baseUrl}/achivements/user/full`,
  },
  userHistory: {
    method: 'GET',
    url: `${baseUrl}/actives/user_history`,
  },
  userActives: {
    method: 'GET',
    url: `${baseUrl}/actives/user_actives`,
  },
  setAvatar: {
    method: 'PUT',
    url: `${baseUrl}/user/set_avatar`,
  },
  addRole: {
    method: 'POST',
    url: `${baseUrl}/user/add_role`,
  },
  changePass: {
    method: 'PUT',
    url: `${baseUrl}/auth/change_password`,
  },
  changeNick: {
    method: 'PUT',
    url: `${baseUrl}/auth/change_username`,
  },
  getAuthor: {
    method: 'GET',
    url: `${baseUrl}/post/author`,
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
  'getAuthor',
] as const;
