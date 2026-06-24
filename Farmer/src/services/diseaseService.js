import diseaseServiceApi from './diseaseServiceApi';

export const diseaseService = {
  getDiseaseReports: async (onUnauthorized) => {
    try {
      const response = await diseaseServiceApi.get('/disease-report/list');
      return { success: true, ...response.data.result || response.data };
    } catch (error) {
      if (error.response?.status === 401 && onUnauthorized) {
        onUnauthorized();
      }
      return { success: false, message: error.response?.data?.result?.message || error.message };
    }
  },

  createDiseaseReport: async (reportData, onUnauthorized) => {
    try {
      const formData = new FormData();
      formData.append('farm_id', reportData.farm_id);
      formData.append('batch_id', reportData.batch_id);
      formData.append('symptoms', reportData.symptoms);
      
      if (reportData.remarks) {
        formData.append('remarks', reportData.remarks);
      }

      if (reportData.disease_image) {
        formData.append('disease_image', reportData.disease_image);
      }

      const response = await diseaseServiceApi.post('/disease-report/create', formData);
      return { success: true, ...response.data.result || response.data };
    } catch (error) {
      if (error.response?.status === 401 && onUnauthorized) {
        onUnauthorized();
      }
      return { success: false, message: error.response?.data?.result?.message || error.message };
    }
  }
};
