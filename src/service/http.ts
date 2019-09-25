import axios from 'axios';
import {HTTP_HOST} from '../config';

const http = axios.create({
  timeout: 30000
});

http.interceptors.request.use((config) => {
  if (!/^https?/.test(config.url as string)) {
    config.url = HTTP_HOST + config.url;
  }
  if (/^GET$/i.test(config.method as string)) {
    config.params = {
      ...config.params,
      _: Date.now()
    };
  }
  return config;
});

http.interceptors.response.use((response) => {
  const data = response.data;
  if (typeof data === 'object' && data != null) {
    if (data.success) {
      return data;
    }
    return Promise.reject(response);
  }
});

export default http;
