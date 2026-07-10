import { API, IApiReturn } from '@/shared/lib/ApiSPA';
import { API_DATA_SCHEME } from '../settings';

interface GetNewsRelatedParams {
  postIds: number[];
  commentsSize?: number;
}

export interface RelatedNewsItem {
  post_id: string;
  media: Array<{
    media: string | null;
    is_pic: string;
    is_secret: string;
    post_id: string;
  }>;
  comments_count: number;
  comments: any[];
}

export const getNewsRelated = async ({
  postIds,
  commentsSize = 3,
}: GetNewsRelatedParams): Promise<IApiReturn<unknown>> => {
  const queryParams = new URLSearchParams({
    post_ids: postIds.join(','),
    comments_size: String(commentsSize),
  }).toString();

  const response = await API.apiQuery<RelatedNewsItem[]>({
    method: API_DATA_SCHEME.getNewsRelated.method,
    url: `${API_DATA_SCHEME.getNewsRelated.url}?${queryParams}`,
  });

  return { ...response };
};
