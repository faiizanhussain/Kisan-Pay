import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();
    const role = localStorage.getItem('role');

    const handleLogout = () => {
        // Clear session data
        localStorage.removeItem('role');
        localStorage.removeItem('cust_id');

        // Redirect to login page
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <ul className="navbar-menu">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/about">About</Link></li>

                {!role ? (
                    <>
                        <li><Link to="/login">Login</Link></li>
                        <li><Link to="/signup">Sign Up</Link></li>
                    </>
                ) : (
                    <>
                        {role === 'admin' && <li><Link to="/admin-dashboard">Admin Dashboard</Link></li>}
                        {role === 'customer' && <li><Link to="/customers">Customer Dashboard</Link></li>}
                        <li>
                            <button onClick={handleLogout} style={{ marginLeft: '10px' }}>
                                Logout
                            </button>
                        </li>
                    </>
                )}
            </ul>
        </nav>
    );
};

export default Navbar;
