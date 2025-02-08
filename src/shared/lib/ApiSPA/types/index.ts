import { AxiosError, Method } from 'axios';

export type IApiReturnObject<T> = Omit<IApiReturn<T>, 'meta'>;
export interface IApiReturn<T> {
  success: boolean;
  data: T | undefined;
  code?: number;
  meta?: {
    current_page: number;
    per_page: number;
    total: number;
  };
  codeMessage?: string;
  statusText?: string;
  message?: string;
  errors?: Record<string, string[]>;
  error?: AxiosError;
  id?: number;
  status?: number;
  authorization?: string;
}

export interface ISchemeMethod {
  method: Method;
  url: string;
}

export type IApiEntityScheme<T extends string | number> = Record<T, ISchemeMethod>;

export type Coordinates = { lat: number; lon?: number; lng: number };

export interface IApiGetPayload {
  sortBy?: string;
  limit?: number;
  page?: number;
  id?: string;
  all?: boolean;
  sort?: string;
  filters?: Record<string, any[] | string | number | boolean>;
  sorting?: string[] | string;
  track_id?: number | string;
  b_box?: [Coordinates, Coordinates] | null | undefined;
}
