import vaccinationServiceApi from './vaccinationServiceApi';

export const vaccinationService = {
  getVaccinations: async (onUnauthorized) => {
    try {
      const response = await vaccinationServiceApi.get('/vaccination/list');
      return { success: true, ...response.data.result || response.data };
    } catch (error) {
      if (error.response?.status === 401 && onUnauthorized) {
        onUnauthorized();
      }
      return { success: false, message: error.response?.data?.result?.message || error.message };
    }
  },

  completeVaccination: async (vaccinationId, onUnauthorized) => {
    try {
      const response = await vaccinationServiceApi.put('/vaccination/complete', {
        vaccination_id: vaccinationId
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
