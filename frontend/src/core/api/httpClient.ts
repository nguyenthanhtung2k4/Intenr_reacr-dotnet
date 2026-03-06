import axios from 'axios';

const URL_API = process.env.REACT_APP_API_URL;

if (!URL_API) {
  console.error('REACT_APP_API_URL is missing.');
}

export const api = axios.create({
  baseURL: URL_API,
});

let authToken = localStorage.getItem('jwtToken');

export const setAuthToken = (token: string | null) => {
  if (token) {
    authToken = token;
    localStorage.setItem('jwtToken', token);
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    authToken = null;
    localStorage.removeItem('jwtToken');
    api.defaults.headers.common.Authorization = '';
  }
};

if (authToken) {
  api.defaults.headers.common.Authorization = `Bearer ${authToken}`;
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwtToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const handleApiError = (error: any, functionName: string): never => {
  let errorMessage = `API error (${functionName}).`;
  if (axios.isAxiosError(error)) {
    if (error.response) {
      const detail = error.response.data?.message || JSON.stringify(error.response.data);
      errorMessage += ` Status: ${error.response.status}. Detail: ${detail}`;
      if (error.response.status === 401) {
        setAuthToken(null);
      }
    } else if (error.request) {
      errorMessage = `Network error (${functionName}). Check server connection.`;
    }
  } else {
    errorMessage += ` Unknown error: ${error.message}`;
  }
  console.error(`API Error in ${functionName}:`, error);
  throw new Error(errorMessage);
};
