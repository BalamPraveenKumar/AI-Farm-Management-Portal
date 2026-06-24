import axios from 'axios';
import { getAuthCredentials } from './api';

const authorityServiceApi = axios.create({
  baseURL: '/api/2046085/farm_management_authority',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

authorityServiceApi.interceptors.request.use(
  (config) => {
    const { username, password } = getAuthCredentials();
    if (username && password) {
      config.headers['Authorization'] = 'Basic ' + btoa(username + ':' + password);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default authorityServiceApi;
