import axios from 'axios';
import { Consts } from '../consts';
import { IApiReturn } from '../lib/ApiSPA';

type TLRes = { token: string; role: 'admin' | 'student' | 'teacher' | '' };
export interface LoginPayload {
  login: string;
  password: string;
}

export class AuthService {
  // static login = async (login: string, pass: string) => {
  //   return axios({
  //     method: 'POST',
  //     url: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/login`,
  //     data: { login, password: pass },
  //   }).then(({ data }) => {
  //     if (!data.token) throw new Error('Data error');
  //     return {
  //       role: data.role,
  //       token: data.token,
  //     } as TLRes;
  //   });
  // };
  static login = async ({ login, password }: LoginPayload): Promise<IApiReturn<TLRes | null>> => {
    try {
      const response = await axios.post(`/auth/login`, {
        login,
        password,
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('API error:', error);
      return { success: false, data: null };
    }
  };

  static auth = async () =>
    axios({
      method: 'GET',
      url: `/auth/amiauthed/`,
    }).then(({ data }) => {
      if (data !== 'yes') throw new Error('Authentication error');
      return true;
    });

  static changePass = async (pass: string) =>
    axios({
      method: 'PUT',
      baseURL: Consts.authServer,
      url: 'auth/change_password',
      data: { new_password: pass },
    }).then(({ data }) => {
      if (data !== 'yes') throw new Error('Authentication error');
      return data;
    });

  static changeLogin = async (login: string) =>
    axios({
      method: 'PUT',
      baseURL: Consts.authServer,
      url: 'auth/change_username',
      data: { new_username: login },
    }).then(({ data }) => {
      if (data !== 'yes') throw new Error('Authentication error');
      return data;
    });
}
