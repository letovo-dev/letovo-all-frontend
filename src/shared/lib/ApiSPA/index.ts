import { apiQuery } from './apiRequests/apiQuery';
import axios from './axios/axios';

interface APIType {
  apiQuery: typeof apiQuery;
}

export const API: APIType = {
  apiQuery,
};

export * from './types';

export { axios };
