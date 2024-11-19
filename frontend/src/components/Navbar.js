// frontend/src/components/Navbar.js

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();
    const role = localStorage.getItem('role'); // Check if the user is logged in

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

                {/* Show login and sign-up options if not logged in */}
                {!role ? (
                    <>
                        <li><Link to="/login">Login</Link></li>
                        <li><Link to="/signup">Sign Up</Link></li>
                    </>
                ) : (
                    <>
                        {/* Role-based dashboard links */}
                        {role === 'admin' && <li><Link to="/admin-dashboard">Admin Dashboard</Link></li>}
                        {role === 'customer' && <li><Link to="/customers">Customer Dashboard</Link></li>}
                        
                        {/* Logout button */}
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
