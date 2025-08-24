import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';


export default function Navbar() {
const { user, setUser } = useContext(AuthContext);
const navigate = useNavigate();


const handleLogout = () => {
setUser(null);
navigate('/login');
};


return (
<nav className="flex justify-between items-center p-4 bg-blue-600 text-white">
<Link to="/" className="font-bold text-lg">DocManager</Link>
<div className="flex gap-4">
{user ? (
<>
<span>{user.name} ({user.role})</span>
<button onClick={handleLogout} className="bg-red-500 px-3 py-1 rounded">Logout</button>
</>
) : (
<Link to="/login">Login</Link>
)}
</div>
</nav>
);
}