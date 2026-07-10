import axios from 'axios';
import { attachAxiosTelemetry } from '../../otel/browser';

const instance = axios.create({
  withCredentials: true,
});

attachAxiosTelemetry(instance);

instance.interceptors.response.use(
  function (dataResponse) {
    return dataResponse;
  },
  function (error) {
    return Promise.reject(error);
  },
);

export default instance;
