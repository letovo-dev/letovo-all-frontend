import { DepartmentOption } from '@/features/admin-create-user/model/types';
import { API, IApiReturn } from '@/shared/lib/ApiSPA';
import { API_USER_SCHEME } from '../settings';

export const getDepartments = async (): Promise<IApiReturn<{ result: DepartmentOption[] }>> => {
  const response = await API.apiQuery<{ result: DepartmentOption[] }>({
    method: API_USER_SCHEME.departments.method,
    url: API_USER_SCHEME.departments.url,
  });

  return { ...response };
};
