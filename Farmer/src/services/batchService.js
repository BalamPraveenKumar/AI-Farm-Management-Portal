import batchServiceApi from './batchServiceApi';

export const batchService = {
  getBatches: async (onUnauthorized) => {
    try {
      const response = await batchServiceApi.get('/batch/list');
      return { success: true, ...response.data.result || response.data };
    } catch (error) {
      if (error.response?.status === 401 && onUnauthorized) {
        onUnauthorized();
      }
      return { success: false, message: error.response?.data?.result?.message || error.message };
    }
  },

  createBatch: async (batchData, onUnauthorized) => {
    try {
      const response = await batchServiceApi.post('/batch/create', {
        farm_id: batchData.farm_id,
        batch_name: batchData.batch_name,
        animal_type: batchData.animal_type,
        animal_count: batchData.animal_count,
        breed: batchData.breed,
        arrival_date: batchData.arrival_date
      });
      return { success: true, ...response.data.result || response.data };
    } catch (error) {
      if (error.response?.status === 401 && onUnauthorized) {
        onUnauthorized();
      }
      return { success: false, message: error.response?.data?.result?.message || error.message };
    }
  }
};
