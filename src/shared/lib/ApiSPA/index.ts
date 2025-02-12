import { apiQuery } from './apiRequests/apiQuery';
import axios from './axios/axios';

export const libConfig = {
  replacePatchToPost: false,
  replacePutToPost: false,
};

export const API = {
  apiQuery,
};

export * from './types';

export { axios };
