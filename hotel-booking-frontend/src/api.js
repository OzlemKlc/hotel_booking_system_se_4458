import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/v1', // API Gateway URL
});

export default api;
