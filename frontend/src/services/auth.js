import api from './api'


export const login = async (email, password) => {
try {
const { data } = await api.post('/auth/login', { email, password })
return data
} catch (err) {
return { message: err?.response?.data?.message || 'Login failed' }
}
}


export const register = async (payload) => {
try {
const { data } = await api.post('/auth/register', payload)
return data
} catch (err) {
return { message: err?.response?.data?.message || 'Register failed' }
}
}