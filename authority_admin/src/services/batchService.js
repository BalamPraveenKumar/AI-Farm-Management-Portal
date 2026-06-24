import authorityServiceApi from './authorityServiceApi';

export const batchService = {
  getBatches: async (onUnauthorized) => {
    try {
      const response = await authorityServiceApi.get('/batches');
      return { success: true, ...response.data.result || response.data };
    } catch (error) {
      if (error.response?.status === 401 && onUnauthorized) onUnauthorized();
      return { success: false, message: error.response?.data?.result?.message || error.message };
    }
  }
};
