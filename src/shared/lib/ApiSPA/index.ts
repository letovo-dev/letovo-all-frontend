import { apiQuery } from './apiRequests/apiQuery';
import axios from './axios/axios';

export const libConfig = {
  replacePatchToPost: false,
  replacePutToPost: false,
};

interface APIType {
  apiQuery: typeof apiQuery;
}

export const API: APIType = {
  apiQuery,
};

export * from './types';

export { axios };
