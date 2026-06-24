import adminServiceApi from './adminServiceApi';

export const farmService = {
  getFarms: async (onUnauthorized) => {
    try {
      const response = await adminServiceApi.get('/farms');
      const data = response.data.result || response.data;
      return { success: true, farms: data.farms || [] };
    } catch (error) {
      if (error.response?.status === 401 && onUnauthorized) {
        onUnauthorized();
      }
      return { success: false, message: error.response?.data?.message || error.message };
    }
  }
};
