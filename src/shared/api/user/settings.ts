import { IApiEntityScheme } from '../../lib/ApiSPA';

type IEndpoint = (typeof API_USER_ENDPOINTS)[number];

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
const uploadBaseUrl = process.env.NEXT_PUBLIC_BASE_URL_UPLOAD;

export const API_USER_SCHEME: IApiEntityScheme<IEndpoint> = {
  userData: {
    method: 'GET',
    url: `${baseUrl}/user`,
  },
  userFullData: {
    method: 'GET',
    url: `${baseUrl}/user/full`,
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
  uploadPersonalAvatar: {
    method: 'POST',
    url: `${uploadBaseUrl?.replace(/\/$/, '')}/avatar`,
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
  isUser: {
    method: 'GET',
    url: `${baseUrl}/auth/isuser`,
  },
  transactionsPrepare: {
    method: 'POST',
    url: `${baseUrl}/transactions/prepare`,
  },
  transactionsSend: {
    method: 'POST',
    url: `${baseUrl}/transactions/send`,
  },
  transactionsMy: {
    method: 'GET',
    url: `${baseUrl}/transactions/my`,
  },
  addAch: {
    method: 'POST',
    url: `${baseUrl}/achivements/add`,
  },
  getMessage: {
    method: 'GET',
    url: `${baseUrl}/message`,
  },
  departments: {
    method: 'GET',
    url: `${baseUrl}/user/department/roles`,
  },
  departmentRoles: {
    method: 'GET',
    url: `${baseUrl}/user/department/roles`,
  },
};

export const API_USER_ENDPOINTS = [
  'userData',
  'userFullData',
  'userAchiv',
  'userHistory',
  'userActives',
  'userAchivAllEnable',
  'setAvatar',
  'uploadPersonalAvatar',
  'addRole',
  'changePass',
  'changeNick',
  'getAuthor',
  'isUser',
  'transactionsPrepare',
  'transactionsSend',
  'transactionsMy',
  'addAch',
  'getMessage',
  'departments',
  'departmentRoles',
] as const;
