import React, { createContext, useState, useEffect } from 'react'
import jwtDecode from 'jwt-decode'
import { login as apiLogin } from '../services/auth'


export const AuthContext = createContext()


export const AuthProvider = ({ children }) => {
const [user, setUser] = useState(null)
const [token, setToken] = useState(() => localStorage.getItem('token'))
const [loading, setLoading] = useState(true)


useEffect(() => {
  if (token) {
    try {
      const decoded = jwtDecode(token)
      // If token has no name, default to email/placeholder
      setUser({
        id: decoded.userId,
        role: decoded.role,
        name: decoded.name || decoded.email || "User"
      })
    } catch (err) {
      setUser(null)
    }
  } else {
    setUser(null)
  }
   if (token) {
     try {
       const decoded = jwtDecode(token)
       setUser({
         id: decoded.userId,
         role: decoded.role,
         name: decoded.name || decoded.email || "User"
       })
     } catch (err) {
       setUser(null)
     }
   } else {
     setUser(null)
   }   setLoading(false)
}, [token])


const login = async (email, password) => {
const res = await apiLogin(email, password)
if (res?.token) {
localStorage.setItem('token', res.token)
setToken(res.token)
return { ok: true }
}
return { ok: false, message: res?.message }
}


const logout = () => {
localStorage.removeItem('token')
setToken(null)
setUser(null)
}


return (
<AuthContext.Provider value={{ user, token, login, logout, loading }}>
{children}
</AuthContext.Provider>
)
}