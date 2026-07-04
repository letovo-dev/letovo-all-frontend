import { DepartmentRoleOption } from '@/features/admin-create-user/model/types';
import { API, IApiReturn } from '@/shared/lib/ApiSPA';
import { API_USER_SCHEME } from '../settings';

export const getDepartmentRoles = async (
  departmentId: number,
): Promise<IApiReturn<{ result: DepartmentRoleOption[] }>> => {
  const response = await API.apiQuery<{ result: DepartmentRoleOption[] }>({
    method: API_USER_SCHEME.departmentRoles.method,
    url: `${API_USER_SCHEME.departmentRoles.url}/${departmentId}`,
  });

  return { ...response };
};
