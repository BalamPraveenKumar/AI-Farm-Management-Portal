import axios from 'axios';

const registerServiceApi = axios.create({
  baseURL: '/api/2046085/farm_management',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

export default registerServiceApi;
