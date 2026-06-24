import adminServiceApi from './adminServiceApi';

export const vaccinationService = {
  getVaccinations: async (onUnauthorized) => {
    try {
      const response = await adminServiceApi.get('/vaccinations');
      const data = response.data.result || response.data;
      return { success: true, vaccinations: data.vaccinations || [] };
    } catch (error) {
      if (error.response?.status === 401 && onUnauthorized) {
        onUnauthorized();
      }
      return { success: false, message: error.response?.data?.message || error.message };
    }
  }
};
