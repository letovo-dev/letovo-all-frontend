import { API, IApiReturn } from '@/shared/lib/ApiSPA';
import { API_DATA_SCHEME } from '../settings';

export interface TopMediaDownload {
  url: string;
  bytes: number;
  content_type: string;
  count: number;
}

export const getTopMediaDownloads = async (limit = 20): Promise<IApiReturn<unknown>> => {
  const queryParams = new URLSearchParams({ limit: String(limit) }).toString();

  const response = await API.apiQuery<TopMediaDownload[]>({
    method: API_DATA_SCHEME.getTopMediaDownloads.method,
    url: `${API_DATA_SCHEME.getTopMediaDownloads.url}?${queryParams}`,
  });

  return { ...response };
};
