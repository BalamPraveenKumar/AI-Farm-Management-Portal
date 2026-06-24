import adminServiceApi from './adminServiceApi';

export const batchService = {
  getBatches: async (onUnauthorized) => {
    try {
      const response = await adminServiceApi.get('/batches');
      const data = response.data.result || response.data;
      return { success: true, batches: data.batches || [] };
    } catch (error) {
      if (error.response?.status === 401 && onUnauthorized) {
        onUnauthorized();
      }
      return { success: false, message: error.response?.data?.message || error.message };
    }
  }
};
