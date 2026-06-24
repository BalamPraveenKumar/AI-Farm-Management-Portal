import adminServiceApi from './adminServiceApi';

export const diseaseService = {
  getDiseaseReports: async (onUnauthorized) => {
    try {
      const response = await adminServiceApi.get('/disease-reports');
      const data = response.data.result || response.data;
      return { success: true, reports: data.reports || [] };
    } catch (error) {
      if (error.response?.status === 401 && onUnauthorized) {
        onUnauthorized();
      }
      return { success: false, message: error.response?.data?.message || error.message };
    }
  },

  resolveReport: async (reportId, remarks, onUnauthorized) => {
    try {
      const response = await adminServiceApi.put('/disease-report/resolve', {
        report_id: reportId,
        remarks: remarks
      });
      const data = response.data.result || response.data;
      return { success: true, ...data };
    } catch (error) {
      if (error.response?.status === 401 && onUnauthorized) {
        onUnauthorized();
      }
      return { success: false, message: error.response?.data?.message || error.response?.data?.result?.message || error.message };
    }
  }
};
