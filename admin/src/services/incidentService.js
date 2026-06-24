import adminServiceApi from './adminServiceApi';

export const incidentService = {
  getIncidents: async (onUnauthorized) => {
    try {
      const response = await adminServiceApi.get('/incidents');
      return { success: true, ...(response.data?.result || response.data) };
    } catch (error) {
      if (error.response?.status === 401 && onUnauthorized) {
        onUnauthorized();
      }
      return { success: false, message: error.response?.data?.message || error.message };
    }
  },

  updateIncidentStatus: async (incidentId, status, resolutionNotes, onUnauthorized) => {
    try {
      const response = await adminServiceApi.put('/incident/status', {
        incident_id: incidentId,
        status: status,
        resolution_notes: resolutionNotes
      });
      return { success: true, ...(response.data?.result || response.data) };
    } catch (error) {
      if (error.response?.status === 401 && onUnauthorized) {
        onUnauthorized();
      }
      return { success: false, message: error.response?.data?.message || error.message };
    }
  }
};
