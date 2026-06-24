import authorityServiceApi from './authorityServiceApi';

export const notificationService = {
  sendNotification: async (payload, onUnauthorized) => {
    try {
      const response = await authorityServiceApi.post('/notifications', payload);
      return { success: true, ...response.data.result || response.data };
    } catch (error) {
      if (error.response?.status === 401 && onUnauthorized) onUnauthorized();
      return { success: false, message: error.response?.data?.result?.message || error.message };
    }
  },

  sendDirectNotification: async (payload, onUnauthorized) => {
    try {
      const response = await authorityServiceApi.post('/send-notification', payload);
      return { success: true, ...response.data.result || response.data };
    } catch (error) {
      if (error.response?.status === 401 && onUnauthorized) onUnauthorized();
      return { success: false, message: error.response?.data?.result?.message || error.response?.data?.message || error.message };
    }
  }
};
