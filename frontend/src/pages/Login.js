import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
    const [role, setRole] = useState('customer'); // Default role
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
            const response = await axios.post('http://localhost:5000/api/login', {
                role, // Include role in the request
                email,
                password,
            });

            const { role: userRole, cust_id, acc_no, employee_id } = response.data;

            // Store relevant data in localStorage
            localStorage.setItem('role', userRole);
            if (userRole === 'customer') {
                localStorage.setItem('cust_id', cust_id);
                localStorage.setItem('acc_no', acc_no);
                navigate('/customers');
            } else if (userRole === 'admin') {
                localStorage.setItem('employee_id', employee_id);
                navigate('/admin-dashboard');
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
            <div>
                <label>
                    <input
                        type="radio"
                        value="customer"
                        checked={role === 'customer'}
                        onChange={() => setRole('customer')}
                    />
                    Customer
                </label>
                <label>
                    <input
                        type="radio"
                        value="admin"
                        checked={role === 'admin'}
                        onChange={() => setRole('admin')}
                    />
                    Admin
                </label>
            </div>
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
