import axios from 'axios';

const BASE_URL = '/api/2046085/farm_management';

export function getAuthCredentials() {
  const username = sessionStorage.getItem('farm_username');
  const password = sessionStorage.getItem('farm_password');
  return { username, password };
}

export function setAuthCredentials(username, password) {
  sessionStorage.setItem('farm_username', username);
  sessionStorage.setItem('farm_password', password);
}

export function clearAuthCredentials() {
  sessionStorage.removeItem('farm_username');
  sessionStorage.removeItem('farm_password');
}

export async function testCredentials(username, password) {
  try {
    const response = await axios.get(`${BASE_URL}/farm/list`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Basic ' + btoa(username + ':' + password)
      }
    });

    if (response.status === 200 || response.status === 201) {
      const data = response.data;
      if (data && data.result) {
        return { success: true, ...data.result };
      }
      return { success: true, ...data };
    }

    return { success: false, message: `Server returned status ${response.status}` };
  } catch (error) {
    if (error.response && error.response.status === 401) {
      return { success: false, message: 'Invalid username or password' };
    }
    console.error('Test credentials error:', error);
    return { success: false, message: 'Network error or server unreachable' };
  }
}

export async function apiCall(url, method = 'GET', body = null, onUnauthorized) {
  const { username, password } = getAuthCredentials();
  if (!username || !password) {
    if (onUnauthorized) onUnauthorized();
    return { success: false, status: 401, message: 'Session expired. Please log in again.' };
  }

  try {
    const headers = {
      'Accept': 'application/json',
      'Authorization': 'Basic ' + btoa(username + ':' + password)
    };
    if (body) {
      headers['Content-Type'] = 'application/json';
    }

    const options = {
      method,
      headers
    };
    if (body) options.body = JSON.stringify(body);

    const res = await fetch(`${BASE_URL}${url}`, options);
    
    if (res.status === 401) {
      clearAuthCredentials();
      if (onUnauthorized) onUnauthorized();
      return { success: false, status: 401, message: 'Unauthorized. Please check credentials.' };
    }
    
    if (res.status === 403) {
      return { success: false, status: 403, message: 'Access Denied.' };
    }
    
    if (res.status === 404) {
      return { success: false, status: 404, message: 'Record not found.' };
    }
    
    if (res.status >= 500) {
      return { success: false, status: 500, message: 'Something went wrong' };
    }

    const data = await res.json();
    if (data && data.result) {
      return { ...data.result, status: res.status };
    }
    return { ...data, status: res.status };
  } catch (err) {
    console.error('API Error:', err);
    return { success: false, message: 'Network error. Please try again.' };
  }
}
