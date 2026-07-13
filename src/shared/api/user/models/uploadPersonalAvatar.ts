import { axios, IApiReturn } from '@/shared/lib/ApiSPA';
import { API_USER_SCHEME } from '../settings';

export interface UploadPersonalAvatarResponse {
  file: string;
}

export const uploadPersonalAvatar = async (
  file: File,
): Promise<IApiReturn<UploadPersonalAvatarResponse>> => {
  const formData = new FormData();
  formData.append('file', file);
  try {
    const response = await axios.post<UploadPersonalAvatarResponse>(
      API_USER_SCHEME.uploadPersonalAvatar.url,
      formData,
      {
        withCredentials: true,
      },
    );
    return { success: true, code: response.status, data: response.data };
  } catch (error: any) {
    return {
      success: false,
      code: error?.response?.status,
      data: undefined,
      codeMessage: error?.response?.data?.error ?? 'Не удалось загрузить аватар',
    };
  }
};
