import axios from 'axios';

const farmServiceApi = axios.create({
  baseURL: '/api/2046085/farm_management',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

farmServiceApi.interceptors.request.use((config) => {
  const username = sessionStorage.getItem('farm_username');
  const password = sessionStorage.getItem('farm_password');
  if (username && password) {
    config.headers.Authorization = 'Basic ' + btoa(username + ':' + password);
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default farmServiceApi;
