import notificationServiceApi from './notificationServiceApi';

export const notificationService = {
  getNotifications: async (onUnauthorized) => {
    try {
      const response = await notificationServiceApi.get('/notifications');
      return { success: true, ...response.data.result || response.data };
    } catch (error) {
      if (error.response?.status === 401 && onUnauthorized) {
        onUnauthorized();
      }
      return { success: false, message: error.response?.data?.result?.message || error.message };
    }
  },

  markAsRead: async (notificationId, onUnauthorized) => {
    try {
      const response = await notificationServiceApi.put('/notifications/read', {
        notification_id: notificationId
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
