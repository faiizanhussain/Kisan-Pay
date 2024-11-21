import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
    
        if (!email || !password) {
            setError('Email and password are required.');
            setLoading(false);
            return;
        }
    
        try {
            const response = await axios.post('http://localhost:5000/api/customers/login', {
                email,
                password,
            });
    
            const { role, cust_id, acc_no } = response.data; // Include acc_no
            localStorage.setItem('role', role);
            localStorage.setItem('cust_id', cust_id);
    
            // Save acc_no to localStorage for customer actions
            if (role === 'customer') {
                localStorage.setItem('acc_no', acc_no);
            }
    
            if (role === 'admin') {
                navigate('/admin-dashboard');
            } else {
                navigate('/customers');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
            console.error('Login error:', err);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <form onSubmit={handleSubmit}>
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
            />
            <button type="submit" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
            </button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </form>
    );
};

export default Login;
