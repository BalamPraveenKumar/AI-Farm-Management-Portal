import incidentServiceApi from './incidentServiceApi';

export const incidentService = {
  getFarmsDropdown: async (onUnauthorized) => {
    try {
      const response = await incidentServiceApi.get('/farm/list');
      const data = response.data?.result || response.data;
      const farms = data.farms || [];
      const dropdownFarms = farms.map(farm => ({
        farm_sys_id: farm.farm_sys_id || farm.sys_id || 'sys_' + farm.farm_id,
        farm_id: farm.farm_id,
        farm_name: farm.farm_name
      }));
      return { success: true, farms: dropdownFarms };
    } catch (error) {
      if (error.response?.status === 401 && onUnauthorized) {
        onUnauthorized();
      }
      return { success: false, message: error.response?.data?.message || error.message };
    }
  },

  createIncident: async (incidentData, onUnauthorized) => {
    try {
      const response = await incidentServiceApi.post('/incidents', {
        farm_id: incidentData.farm_id,
        category: incidentData.category,
        title: incidentData.title,
        description: incidentData.description
      });
      return { success: true, ...(response.data?.result || response.data) };
    } catch (error) {
      if (error.response?.status === 401 && onUnauthorized) {
        onUnauthorized();
      }
      return { success: false, message: error.response?.data?.message || error.message };
    }
  },

  getIncidents: async (onUnauthorized) => {
    try {
      const response = await incidentServiceApi.get('/incidents');
      return { success: true, ...(response.data?.result || response.data) };
    } catch (error) {
      if (error.response?.status === 401 && onUnauthorized) {
        onUnauthorized();
      }
      return { success: false, message: error.response?.data?.message || error.message };
    }
  }
};
