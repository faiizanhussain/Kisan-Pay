import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <ul className="navbar-menu">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/about">About</Link></li>
                {!token && (
                    <>
                        <li><Link to="/login">Login</Link></li>
                        <li><Link to="/signup">Sign Up</Link></li>
                    </>
                )}
                {token && (
                    <>
                        {role === 'admin' && <li><Link to="/admin-dashboard">Admin Dashboard</Link></li>}
                        {role === 'customer' && <li><Link to="/customers">Customer Dashboard</Link></li>}
                        <li><button onClick={handleLogout} className="logout-btn">Logout</button></li>
                    </>
                )}
            </ul>
        </nav>
    );
};

export default Navbar;
