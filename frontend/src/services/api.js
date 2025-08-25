import axios from 'axios'

// For Vite:
const API_BASE =
  import.meta.env.VITE_API_BASE ||
  // For CRA fallback:
  process.env.REACT_APP_API_BASE ||
  // dev fallback:
  'http://localhost:5000/api';

  const api = axios.create({ baseURL: API_BASE })

// request interceptor to attach token
api.interceptors.request.use((config) => {
const token = localStorage.getItem('token')
if (token) config.headers.Authorization = `Bearer ${token}`
return config
})


export default api