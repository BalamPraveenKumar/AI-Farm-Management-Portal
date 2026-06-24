import farmServiceApi from './farmServiceApi';

export const farmService = {
  getFarms: async (onUnauthorized) => {
    try {
      const response = await farmServiceApi.get('/farm/list');
      return { success: true, ...response.data.result || response.data };
    } catch (error) {
      if (error.response?.status === 401 && onUnauthorized) {
        onUnauthorized();
      }
      return { success: false, message: error.response?.data?.result?.message || error.message };
    }
  },

  createFarm: async (farmData, onUnauthorized) => {
    try {
      const response = await farmServiceApi.post('/farm/create', {
        farm_name: farmData.farm_name,
        farm_type: farmData.farm_type,
        capacity: farmData.capacity,
        village: farmData.village,
        district_code: farmData.district_code
      });
      return { success: true, ...response.data.result || response.data };
    } catch (error) {
      if (error.response?.status === 401 && onUnauthorized) {
        onUnauthorized();
      }
      return { success: false, message: error.response?.data?.result?.message || error.message };
    }
  },

  getDistricts: async (onUnauthorized) => {
    try {
      const response = await farmServiceApi.get('/districts');
      return { success: true, ...response.data.result || response.data };
    } catch (error) {
      if (error.response?.status === 401 && onUnauthorized) {
        onUnauthorized();
      }
      return { success: false, message: error.response?.data?.result?.message || error.message };
    }
  }
};
