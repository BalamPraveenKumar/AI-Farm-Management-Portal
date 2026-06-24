import adminServiceApi from './adminServiceApi';

export const biosecurityService = {
  getChecklists: async () => {
    try {
      const response = await adminServiceApi.get('/biosecurity-checklists');
      return { success: true, ...response.data.result || response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.result?.message || error.message };
    }
  }
};
