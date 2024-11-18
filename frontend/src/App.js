import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Navbar from './components/Navbar';
import CustomerDashboard from './pages/CustomerDashboard';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import SignUp from './pages/SignUp';

const App = () => {
    // Fetch role from localStorage
    const role = localStorage.getItem('role');

    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/login" element={<Login />} />
                
                {/* Protected Customer Dashboard Route */}
                <Route
                    path="/customers"
                    element={role === 'customer' ? <CustomerDashboard /> : <Navigate to="/login" />}
                />

                {/* Protected Admin Dashboard Route */}
                <Route
                    path="/admin-dashboard"
                    element={role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />}
                />
            </Routes>
        </Router>
    );
};

export default App;
