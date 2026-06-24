import registerServiceApi from './registerServiceApi';

export const registerService = {
  registerFarmer: async (farmerData) => {
    try {
      const response = await registerServiceApi.post('/register', {
        first_name: farmerData.first_name,
        last_name: farmerData.last_name,
        name: `${farmerData.first_name} ${farmerData.last_name}`.trim(),
        email: farmerData.email,
        mobile: farmerData.mobile,
        password: farmerData.password
      });
      return { success: true, ...response.data.result || response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.result?.message || error.message };
    }
  }
};
