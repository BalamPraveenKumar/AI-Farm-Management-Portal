import adminServiceApi from './adminServiceApi';

export const notificationService = {
  sendNotification: async (title, message, type, onUnauthorized) => {
    try {
      const response = await adminServiceApi.post('/notifications', {
        title,
        message,
        type
      });
      return { success: true, ...response.data };
    } catch (error) {
      if (error.response?.status === 401 && onUnauthorized) {
        onUnauthorized();
      }
      return { success: false, message: error.response?.data?.message || error.response?.data?.result?.message || error.message };
    }
  },

  sendDirectNotification: async (payload, onUnauthorized) => {
    try {
      const response = await adminServiceApi.post('/send-notification', payload);
      return { success: true, ...response.data };
    } catch (error) {
      if (error.response?.status === 401 && onUnauthorized) {
        onUnauthorized();
      }
      return { success: false, message: error.response?.data?.message || error.response?.data?.result?.message || error.message };
    }
  }
};
