import React, { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'


export default function Topbar(){
const { user, logout } = useContext(AuthContext)
return (
<div className="flex items-center justify-between p-4 bg-white border-b">
<div className="text-lg font-semibold">DocMgmt</div>
<div className="flex items-center gap-4">
<div className="text-sm">{user?.role ?? 'Anonymous'}</div>
<button onClick={logout} className="px-3 py-1 border rounded">Logout</button>
</div>
</div>
)
}