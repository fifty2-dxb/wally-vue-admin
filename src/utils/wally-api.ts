import { router } from '@/plugins/1.router';
import { ofetch } from 'ofetch';

export const $wallyApi = ofetch.create({
  baseURL: import.meta.env.VITE_API_WALLY_BASE_URL || '/api',
  async onRequest({ options }) {
    const accessToken = useCookie('accessToken').value
    if (accessToken) {
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${accessToken}`,
      }
    }
  },

  async onResponse({ response }) {
    if (response.status === 401) {
      document.cookie = 'accessToken=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
      document.cookie = 'userData=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
      document.cookie = 'userAbilityRules=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
      
      router.push('/login');
      return Promise.reject(response);
    }
    return response;
  },
})
