// src/components/ProtectedRoute.jsx
import { useContext } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

export default function ProtectedRoute({ roles }) {
  const { user, loading } = useContext(AuthContext)

  if (loading) return <p>Loading...</p>

  if (!user) return <Navigate to="/login" replace />

 if (roles && !roles.includes(user.role?.toLowerCase())) {
  return <Navigate to="/" replace />
}


  return <Outlet />
}
