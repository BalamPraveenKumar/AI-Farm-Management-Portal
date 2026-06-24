import axios from 'axios';

const LOGIN_URL = '/api/2046085/farm_management/login';

export function getAuthCredentials() {
  const username = sessionStorage.getItem('admin_username');
  const password = sessionStorage.getItem('admin_password');
  return { username, password };
}

export function setAuthCredentials(username, password) {
  sessionStorage.setItem('admin_username', username);
  sessionStorage.setItem('admin_password', password);
}

export function clearAuthCredentials() {
  sessionStorage.removeItem('admin_username');
  sessionStorage.removeItem('admin_password');
}

export async function testCredentials(username, password) {
  try {
    const response = await axios.post(LOGIN_URL, {}, {
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Basic ' + btoa(username + ':' + password)
      }
    });

    if (response.status === 200 || response.status === 201) {
      return { success: true, ...response.data.result || response.data };
    }
    return { success: false, message: `Server returned status ${response.status}` };
  } catch (error) {
    if (error.response && error.response.status === 401) {
      return { success: false, message: 'Invalid admin username or password' };
    }
    console.error('Test credentials error:', error);
    return { success: false, message: 'Network error or server unreachable' };
  }
}
