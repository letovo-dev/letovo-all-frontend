import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
});

instance.interceptors.request.use(
  config => {
    if (!config?.headers) {
      throw new Error('Expected config and config.headers not to be undefined');
    }
    config.headers.Bearer = `${localStorage.getItem('token')}`;
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

instance.interceptors.response.use(
  function (dataResponse) {
    return dataResponse;
  },
  function (error) {
    return Promise.reject(error);
  },
);

export default instance;
