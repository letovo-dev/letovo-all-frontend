import { API, IApiReturn } from '@/shared/lib/ApiSPA';
import { API_ACHIEVEMENTS_SCHEME } from '../settings';

export const tree = async (treeId: number): Promise<IApiReturn<any>> => {
  const response = await API.apiQuery<any[]>({
    method: API_ACHIEVEMENTS_SCHEME.tree.method,
    url: `${API_ACHIEVEMENTS_SCHEME.info.url}?tree_id=${encodeURIComponent(treeId)}`,
  });

  return { ...response };
};
