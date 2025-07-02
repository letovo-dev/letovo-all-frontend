import { SERVICES_AUTH } from '@/shared/api/auth';

export const checkAuthToken = async (token: string | null) => {
  if (!token) {
    console.error('No token provided for verification');
    return null;
  }
  try {
    const response = await SERVICES_AUTH.Auth.auth();
    return response;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
};
