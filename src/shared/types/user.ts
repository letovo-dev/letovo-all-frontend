export type TAuthUser = {
  login: string;
  role: 'admin' | 'student' | 'teacher' | '';
};

export const dAuthUser: TAuthUser = {
  login: '',
  role: '',
};
