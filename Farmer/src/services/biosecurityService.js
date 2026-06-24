import biosecurityServiceApi from './biosecurityServiceApi';

export const biosecurityService = {
  getChecklists: async (onUnauthorized) => {
    try {
      const response = await biosecurityServiceApi.get('/biosecurity/list');
      return { success: true, ...response.data.result || response.data };
    } catch (error) {
      if (error.response?.status === 401 && onUnauthorized) {
        onUnauthorized();
      }
      return { success: false, message: error.response?.data?.result?.message || error.message };
    }
  },

  createChecklist: async (checklistData, onUnauthorized) => {
    try {
      const response = await biosecurityServiceApi.post('/biosecurity/create', {
        farm_id: checklistData.farm_id,
        visitors_registered: checklistData.visitors_registered,
        farm_sanitized: checklistData.farm_sanitized,
        sick_animals_isolated: checklistData.sick_animals_isolated,
        waste_disposed_properly: checklistData.waste_disposed_properly,
        footbath_available: checklistData.footbath_available,
        remarks: checklistData.remarks
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
