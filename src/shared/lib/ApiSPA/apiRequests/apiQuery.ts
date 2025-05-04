/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosRequestConfig, AxiosResponse, Method } from 'axios';
import axiosInstance from '../axios/axios';
import { IApiReturn } from '../index';
import { SuccessResponse, ErrorResponse, applyLibConfig } from '../utils';
interface IApiQueryProps {
  method: Method;
  url: string;
  data?: any;
  page?: number;
  limit?: number;
  extraHeaders?: any;
  debug?: boolean;
  transitional?: any;
  noNestedData?: boolean;
  signal?: AbortSignal;
}

const libConfig = {
  replacePatchToPost: false,
  replacePutToPost: false,
};
export const apiQuery = async <T = any>({
  method,
  url,
  data,
  page,
  limit,
  extraHeaders,
  debug = false,
  transitional,
  noNestedData,
}: IApiQueryProps): Promise<IApiReturn<T | undefined>> => {
  try {
    let config: AxiosRequestConfig = {
      url,
      method,
      params: {
        page,
        limit,
      },
      data: data,
      transitional:
        transitional !== undefined
          ? transitional
          : {
              silentJSONParsing: true,
              forcedJSONParsing: true,
              clarifyTimeoutError: false,
            },
    };
    config = applyLibConfig(libConfig, config);
    if (extraHeaders) {
      config.headers = extraHeaders;
    }

    const response: AxiosResponse = await axiosInstance(config);

    if (debug) {
      console.log('debag response config', config);
      console.log('debag response', response);
    }

    return SuccessResponse({
      data: response,
      noNestedData: noNestedData,
    });
  } catch (error) {
    return ErrorResponse({
      error,
    });
  }
};
