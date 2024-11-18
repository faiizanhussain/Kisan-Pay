import React, { useState } from 'react';
import axios from 'axios';

const CustomerEditForm = ({ customer, onCustomerUpdated }) => {
    const [formData, setFormData] = useState(customer);
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
            const response = await axios.put(`http://localhost:5000/api/customers/${customer.cust_id}`, formData);
            onCustomerUpdated(response.data);
            setError('');
        } catch (error) {
            setError('Failed to update customer. Please try again.');
            console.error('Error updating customer:', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Edit Customer</h2>
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
            <button type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update Customer'}
            </button>
        </form>
    );
};

export default CustomerEditForm;
