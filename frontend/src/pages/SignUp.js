import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SignUp = () => {
    const [formData, setFormData] = useState({
        f_name: '',
        l_name: '',
        email: '',
        phone: '',
        pass: '',
        cnic: '',
        u_name: '',
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            const response = await axios.post('http://localhost:5000/api/customers/signup', formData);

            setMessage(response.data.message);

            // Save cust_id in localStorage for account creation
            localStorage.setItem('cust_id', response.data.cust_id);

            setTimeout(() => {
                navigate('/login'); // Redirect to login after success
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Signup failed');
        }
    };

    return (
        <div>
            <h2>Sign Up</h2>
            <form onSubmit={handleSignup}>
                <input
                    type="text"
                    name="u_name"
                    placeholder="Username"
                    value={formData.u_name}
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="f_name"
                    placeholder="First Name"
                    value={formData.f_name}
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="l_name"
                    placeholder="Last Name"
                    value={formData.l_name}
                    onChange={handleChange}
                    required
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="phone"
                    placeholder="Phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="cnic"
                    placeholder="CNIC"
                    value={formData.cnic}
                    onChange={handleChange}
                    required
                />
                <input
                    type="password"
                    name="pass"
                    placeholder="Password"
                    value={formData.pass}
                    onChange={handleChange}
                    required
                />
                <button type="submit">Sign Up</button>
            </form>
            {message && <p style={{ color: 'green' }}>{message}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default SignUp;
