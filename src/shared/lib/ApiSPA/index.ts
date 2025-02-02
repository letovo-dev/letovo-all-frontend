import { apiQuery } from './apiRequests/apiQuery';
import axios from './axios/axios';

export const libConfig = {
  replacePatchToPost: true,
  replacePutToPost: true,
};

export const API = {
  apiQuery,
};

export * from './types';

export { axios };
