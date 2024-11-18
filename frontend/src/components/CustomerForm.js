import React, { useState } from 'react';
import axios from 'axios';

const CustomerForm = ({ onCustomerCreated }) => {
    const [formData, setFormData] = useState({
        f_name: '',
        l_name: '',
        email: '',
        phone: '',
        pass: '',
        cnic: '',
        u_name: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:5000/api/customers/signup', formData);
            onCustomerCreated(response.data); // Notify parent of the new customer creation
            setError('');
            setFormData({
                f_name: '',
                l_name: '',
                email: '',
                phone: '',
                pass: '',
                cnic: '',
                u_name: '',
            }); // Reset form
        } catch (error) {
            setError('Failed to create customer. Please try again.');
            console.error('Error creating customer:', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Add New Customer</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div>
                <label>First Name:</label>
                <input
                    type="text"
                    name="f_name"
                    value={formData.f_name}
                    onChange={handleChange}
                    required
                />
            </div>
            <div>
                <label>Last Name:</label>
                <input
                    type="text"
                    name="l_name"
                    value={formData.l_name}
                    onChange={handleChange}
                    required
                />
            </div>
            <div>
                <label>Email:</label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
            </div>
            <div>
                <label>Phone:</label>
                <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                />
            </div>
            <div>
                <label>Password:</label>
                <input
                    type="password"
                    name="pass"
                    value={formData.pass}
                    onChange={handleChange}
                    required
                />
            </div>
            <div>
                <label>CNIC:</label>
                <input
                    type="text"
                    name="cnic"
                    value={formData.cnic}
                    onChange={handleChange}
                    required
                />
            </div>
            <div>
                <label>Username:</label>
                <input
                    type="text"
                    name="u_name"
                    value={formData.u_name}
                    onChange={handleChange}
                    required
                />
            </div>
            <button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Customer'}
            </button>
        </form>
    );
};

export default CustomerForm;
