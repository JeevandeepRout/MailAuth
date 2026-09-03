import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // Crucial for receiving and sending HTTP-only cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
