import { API, IApiReturn } from '@/shared/lib/ApiSPA';
import { API_USER_SCHEME } from '../settings';

export interface DepartmentPayoutPayload {
  department_id: number;
  amount: number;
  request_id: string;
  confirm: boolean;
  expected_recipient_count?: number;
}

export interface DepartmentPayoutResponse {
  department_id: number;
  department_name: string;
  amount: number;
  recipient_count: number;
  total: number;
  applied: boolean;
  duplicate: boolean;
}

export const departmentPayout = async (
  payload: DepartmentPayoutPayload,
): Promise<IApiReturn<DepartmentPayoutResponse>> => {
  const response = await API.apiQuery<DepartmentPayoutResponse>({
    method: API_USER_SCHEME.departmentPayout.method,
    url: API_USER_SCHEME.departmentPayout.url,
    data: payload,
  });

  return { ...response };
};
