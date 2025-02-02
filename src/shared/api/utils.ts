import axios from 'axios';

export class Utils {
  static dateExpired = (date: string | Date) => new Date(date.toString()).valueOf() < Date.now();

  static setupApp = () => {
    axios.defaults.method = 'POST';
    axios.defaults.baseURL = process.env.PUBLIC_BACKEND_HOST;

    axios.interceptors.request.use(
      config => {
        const t = localStorage.getItem('token');
        if (t)
          config.headers = {
            ...config.headers,
            Authorization: `Bearer ${t}`,
          } as any;
        return config;
      },
      e => Promise.reject(e),
    );

    // createResponseInterceptor();
  };
  static isFunction = (o: any) => o !== undefined && o !== null && typeof o === 'function';
  static isIterable = (o: any) => o !== undefined && this.isFunction(o[Symbol.iterator]);
  static removeNulls = (obj: any) => {
    if (obj === null) return undefined;
    if (typeof obj === 'object') for (const key in obj) obj[key] = this.removeNulls(obj[key]);
    return obj;
  };
}
// const createResponseInterceptor = () => {
//   const interceptor = axios.interceptors.response.use(
//     response => response,
//     async e => {
//       if (!e.response || !e.response.status)
//         return Promise.reject(Error('No connection to server'));
//       if (e.response.status !== 401) return Promise.reject(Error(backErr(e)));
//       axios.interceptors.response.eject(interceptor);
//       return axios
//         .post('https://0.0.0.0:8080/auth/login', {
//           token: localStorage.getItem('token'),
//         })
//         .then(({ data }) => {
//           localStorage.setItem('token', data.token);
//           return axios(e.config);
//         })
//         .catch(e => Promise.reject(Error(backErr(e))))
//         .finally(createResponseInterceptor);
//     },
//   );
// };

const backErr = (e: any) => {
  try {
    return e.response.data.message;
  } catch (_) {
    try {
      return e.message;
    } catch (__) {
      return e;
    }
  }
};
