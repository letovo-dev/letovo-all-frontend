/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosRequestConfig, AxiosResponse, Method } from 'axios';
import axiosInstance from '../axios/axios';
import { IApiReturn, libConfig } from '../index';

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
}

export const apiQuery = async <T = any>({
  method,
  url,
  data,
  page,
  limit,
  extraHeaders,
  debug = true,
  transitional,
  noNestedData,
}: IApiQueryProps): Promise<IApiReturn<T | undefined>> => {
  try {
    // eslint-disable-next-line prefer-const
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

    console.log('config', config);

    if (extraHeaders) {
      config.headers = extraHeaders;
    }

    const response: AxiosResponse = await axiosInstance(config);

    if (debug) {
      console.log('debag');

      console.log('response config', config);
      console.log('response response', response);
    }

    return SuccessResponse({
      data: response,
      noNestedData: noNestedData,
    });
  } catch (error) {
    return ErrorResponse({
      error: error,
    });
  }
};
