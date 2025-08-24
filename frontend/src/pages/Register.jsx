import React, { useState } from 'react'
import { register as apiRegister } from '../services/auth'
import { useNavigate } from 'react-router-dom'


export default function Register(){
const [payload, setPayload] = useState({ name:'', email:'', password:'', role:'viewer' })
const nav = useNavigate()


const submit = async (e) => {
e.preventDefault()
const res = await apiRegister(payload)
if (res?.token) nav('/login')
else alert(res?.message || 'Register failed')
}


return (
<div className="min-h-screen flex items-center justify-center bg-slate-50">
<form onSubmit={submit} className="w-full max-w-md bg-white p-6 rounded shadow">
<h2 className="text-2xl mb-4">Register</h2>
<input placeholder="Name" value={payload.name} onChange={e=>setPayload({...payload, name: e.target.value})} className="w-full p-2 border rounded mb-2" />
<input placeholder="Email" value={payload.email} onChange={e=>setPayload({...payload, email: e.target.value})} className="w-full p-2 border rounded mb-2" />
<input placeholder="Password" type="password" value={payload.password} onChange={e=>setPayload({...payload, password: e.target.value})} className="w-full p-2 border rounded mb-2" />
<select value={payload.role} onChange={e=>setPayload({...payload, role: e.target.value})} className="w-full p-2 border rounded mb-4">
<option value="viewer">Viewer</option>
<option value="editor">Editor</option>
<option value="admin">Admin</option>
</select>
<button className="w-full bg-indigo-600 text-white p-2 rounded">Create account</button>
</form>
</div>
)
}