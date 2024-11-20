import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
            // Send login request to the backend
            const response = await axios.post('http://localhost:5000/api/customers/login', {
                email,
                password,
            });

            // Extract role and cust_id from the response
            const { role, cust_id } = response.data;

            // Debugging logs
            console.log('Role:', role, 'Customer ID:', cust_id);

            // Save role and cust_id to localStorage
            localStorage.setItem('role', role);
            localStorage.setItem('cust_id', cust_id);

            // Navigate to the appropriate dashboard
            if (role === 'admin') {
                navigate('/admin-dashboard');
            } else if (role === 'customer') {
                navigate('/customers');
            } else {
                throw new Error('Invalid role received');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
            console.error('Login error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>Login</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default Login;
