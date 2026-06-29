import axios from 'axios';

const instance = axios.create({
  withCredentials: true,
});

instance.interceptors.response.use(
  function (dataResponse) {
    return dataResponse;
  },
  function (error) {
    return Promise.reject(error);
  },
);

export default instance;
