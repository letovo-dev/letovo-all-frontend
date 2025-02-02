'use client';
import { message } from 'antd';
import { useState, useEffect } from 'react';
import { IApiGetPayload, IApiReturn } from '../lib/ApiSPA';

type TRequest<T, P> = (payload?: P) => Promise<IApiReturn<T>>;
type TRequestCall = () => void;
type TMessages = Partial<{
  success: string;
  errorData: string;
  errorRequest: string;
}>;
type TOptions<T, P> = {
  state: Partial<T>;
  requestOnInit: boolean;
  onmount: 'item' | boolean | TRequestCall;
  payload: Parameters<TRequest<T, P>>[number];
  debugRequest: () => void;
  messages?: TMessages;
};

export const useApi2 = <T, P = IApiGetPayload>(
  apiCall: TRequest<T, P>,
  options?: Partial<TOptions<T, P>>,
) => {
  const messages = options?.messages ?? {
    success: options?.messages?.success,
    errorData: options?.messages?.errorData,
    errorRequest: options?.messages?.errorRequest,
  };

  let state = options?.state ?? ([] as any);
  let requestOnMount = options?.onmount ?? true;

  if (options?.onmount === 'item') {
    state = {};
    requestOnMount = false;
  }

  const [data, setData] = useState<Partial<T>>(state);
  const [loading, setLoading] = useState(Boolean(requestOnMount));
  const [error, setError] = useState('');
  const [response, setResponse] = useState<IApiReturn<T | undefined>>();

  const request = async (payload = options?.payload): Promise<IApiReturn<T>> => {
    const params = payload || { all: true };

    options?.debugRequest?.();

    setError('');
    setLoading(true);

    try {
      const response = await apiCall(params as any);
      if (response.data) {
        setResponse(response);
      } else {
        const errorText = messages?.errorData || response.message || 'Networking error';
        setError(errorText);
        if (errorText) {
          // message.error(errorText);
        }
        setResponse({ success: false, data: undefined });
      }
      return response;
    } catch (error) {
      setResponse({ success: false, data: undefined });
      return { success: false, data: undefined };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (requestOnMount && typeof requestOnMount !== 'string') {
      if (typeof requestOnMount === 'function') {
        requestOnMount();
      } else {
        request().catch(error => {
          console.error('Request failed:', error);
          setResponse({ success: false, data: undefined });
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestOnMount]);

  const empty = Array.isArray(data) ? data.length === 0 : Object.keys(data || {}).length === 0;

  return {
    data,
    loading,
    empty,
    error,
    request,
    update: setData,
    options,
    response,
    //msg,
    //ctx
  } as const;
};
