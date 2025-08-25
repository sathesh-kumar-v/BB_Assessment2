import axios from 'axios'


const api = axios.create({ baseURL: '/api', timeout: 30000 })

// For Vite:
const API_BASE =
  import.meta.env.VITE_API_BASE ||
  // For CRA fallback:
  process.env.REACT_APP_API_BASE ||
  // dev fallback:
  'http://localhost:5000/api';
  
// request interceptor to attach token
api.interceptors.request.use((config) => {
const token = localStorage.getItem('token')
if (token) config.headers.Authorization = `Bearer ${token}`
return config
})


export default api