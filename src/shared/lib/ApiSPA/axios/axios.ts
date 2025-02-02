// import { authStore } from '@shared/stores/auth';
import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
});

instance.interceptors.request.use(config => {
  if (!config?.headers) {
    throw new Error('Expected config and config.headers not to be undefined');
  }

  config.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;

  return config;
});

// request
instance.interceptors.request.use(
  function (config) {
    return config;
  },
  function (error) {
    return Promise.reject(error);
  },
);
// const logOut = () => {
//     accountStore.logOut()
//     AuthActionCreators.logout()(store.dispatch)
// }
const logoutErrors = [401, 403];

instance.interceptors.response.use(
  function (dataResponse) {
    return dataResponse;
  },
  function (error) {
    if (logoutErrors.includes(error?.response?.status)) {
      //   authStore.getState().setAuth(false);

      if (window.location.pathname === '/auth/login') {
        return;
      }
      localStorage.removeItem('token');
    }

    return Promise.reject(error);
  },
);

export default instance;
