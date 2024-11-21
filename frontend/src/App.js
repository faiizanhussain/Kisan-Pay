import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Navbar from './components/Navbar';
import CustomerDashboard from './pages/CustomerDashboard';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import SignUp from './pages/SignUp';
import LoanManagement from './components/LoanManagement'; // Ensure this import is correct

const App = () => {
    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/login" element={<Login />} />
                <Route path="/customers" element={<CustomerDashboard />} />
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
                <Route path="/loan-management" element={<LoanManagement />} />
                
            </Routes>
        </Router>
    );
};

export default App;
