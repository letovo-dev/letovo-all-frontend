export type TAuthUser = {
  login: string;
  role: 'admin' | 'student' | 'teacher' | '' | string;
};

export const dAuthUser: TAuthUser = {
  login: '',
  role: '',
};
