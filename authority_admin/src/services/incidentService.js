import authorityServiceApi from './authorityServiceApi';

export const incidentService = {
  getIncidents: async (onUnauthorized) => {
    try {
      const response = await authorityServiceApi.get('/incidents');
      return { success: true, ...(response.data?.result || response.data) };
    } catch (error) {
      if (error.response?.status === 401 && onUnauthorized) {
        onUnauthorized();
      }
      return { success: false, message: error.response?.data?.message || error.message };
    }
  },

  getIncidentSummary: async (onUnauthorized) => {
    try {
      const response = await authorityServiceApi.get('/incident-summary');
      return { success: true, ...(response.data?.result || response.data) };
    } catch (error) {
      if (error.response?.status === 401 && onUnauthorized) {
        onUnauthorized();
      }
      return { success: false, message: error.response?.data?.message || error.message };
    }
  }
};
