import authorityServiceApi from './authorityServiceApi';

export const biosecurityService = {
  getBiosecurityChecklists: async (onUnauthorized) => {
    try {
      const response = await authorityServiceApi.get('/biosecurity-checklists');
      return { success: true, ...response.data.result || response.data };
    } catch (error) {
      if (error.response?.status === 401 && onUnauthorized) onUnauthorized();
      return { success: false, message: error.response?.data?.result?.message || error.message };
    }
  },

  getBiosecuritySummary: async (onUnauthorized) => {
    try {
      const response = await authorityServiceApi.get('/biosecurity-summary');
      return { success: true, ...response.data.result || response.data };
    } catch (error) {
      if (error.response?.status === 401 && onUnauthorized) onUnauthorized();
      return { success: false, message: error.response?.data?.result?.message || error.message };
    }
  }
};
