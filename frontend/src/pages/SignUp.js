
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/FormStyles.css';

const SignUp = () => {
  const [role, setRole] = useState('Buyer'); // Default role
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
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
  
    const { f_name, l_name, email, phone, pass, cnic, u_name } = formData;
  
    // Validation rules
    const nameRegex = /^[a-zA-Z\s]{2,50}$/; // Only letters and spaces, 2-50 characters
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Standard email validation
    const phoneRegex = /^[0-9]{10,15}$/; // Allow numeric values, 10-15 digits
    const cnicRegex = /^[0-9]{13,15}$/; // Allow numeric values, 13-15 digits for CNIC
    const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/; // Alphanumeric and underscores, 3-30 characters
  
    // Validate individual fields
    if (!nameRegex.test(f_name)) {
      setError('First Name must be 2-50 characters long and contain only letters and spaces.');
      setLoading(false);
      return;
    }
    if (!nameRegex.test(l_name)) {
      setError('Last Name must be 2-50 characters long and contain only letters and spaces.');
      setLoading(false);
      return;
    }
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }
    if (!phoneRegex.test(phone)) {
      setError('Phone number must be 10-15 digits long and contain only numbers.');
      setLoading(false);
      return;
    }
    if (!cnicRegex.test(cnic)) {
      setError('CNIC must be 13-15 digits long and contain only numbers.');
      setLoading(false);
      return;
    }
    if (!usernameRegex.test(u_name)) {
      setError('Username must be 3-30 characters long and can only contain letters, numbers, and underscores.');
      setLoading(false);
      return;
    }
    if (!pass) {
      setError('Password cannot be empty.');
      setLoading(false);
      return;
    }
  
    // Proceed with API call if all validations pass
    try {
      await axios.post('http://localhost:5000/api/customers/signup', {
        ...formData,
        role,
      });
  
      setMessage('Account created successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen mt-16 flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <div className="bg-white shadow-2xl rounded-xl p-10 w-full max-w-3xl transform hover:scale-105 transition-transform duration-500 ease-in-out">
        <h1 className="text-4xl font-extrabold text-gray-800 text-center mb-8">
          Join <span className="text-purple-500">KisanPay</span>
        </h1>
        <p className="text-gray-500 text-center mb-6">
          Sign up to start managing your finances efficiently!
        </p>
        {error && (
          <div className="text-red-600 bg-red-100 border border-red-300 rounded-lg px-4 py-2 mb-4 text-center">
            {error}
          </div>
        )}
        {message && (
          <div className="text-green-600 bg-green-100 border border-green-300 rounded-lg px-4 py-2 mb-4 text-center">
            {message}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          {/* Role Selection */}
          <div className="flex justify-center gap-8 mb-6">
            <label>
              <input
                type="radio"
                value="Buyer"
                checked={role === 'Buyer'}
                onChange={() => setRole('Buyer')}
                className="hidden peer"
              />
              <span className="peer-checked:bg-purple-600 peer-checked:text-white px-8 py-3 rounded-full border border-purple-500 cursor-pointer hover:bg-purple-200 transition-colors duration-300 ease-in-out">
                Buyer
              </span>
            </label>
            <label>
              <input
                type="radio"
                value="Seller"
                checked={role === 'Seller'}
                onChange={() => setRole('Seller')}
                className="hidden peer"
              />
              <span className="peer-checked:bg-purple-600 peer-checked:text-white px-8 py-3 rounded-full border border-purple-500 cursor-pointer hover:bg-purple-200 transition-colors duration-300 ease-in-out">
                Seller
              </span>
            </label>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="f_name" className="block text-gray-600 font-medium mb-2">
                First Name
              </label>
              <input
                type="text"
                id="f_name"
                name="f_name"
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-400 focus:outline-none transition-shadow duration-300"
                placeholder="Enter your first name"
                value={formData.f_name}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label htmlFor="l_name" className="block text-gray-600 font-medium mb-2">
                Last Name
              </label>
              <input
                type="text"
                id="l_name"
                name="l_name"
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-400 focus:outline-none transition-shadow duration-300"
                placeholder="Enter your last name"
                value={formData.l_name}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-gray-600 font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-400 focus:outline-none transition-shadow duration-300"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-gray-600 font-medium mb-2">
                Phone
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-400 focus:outline-none transition-shadow duration-300"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label htmlFor="cnic" className="block text-gray-600 font-medium mb-2">
                CNIC
              </label>
              <input
                type="text"
                id="cnic"
                name="cnic"
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-400 focus:outline-none transition-shadow duration-300"
                placeholder="Enter your CNIC"
                value={formData.cnic}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label htmlFor="u_name" className="block text-gray-600 font-medium mb-2">
                Username
              </label>
              <input
                type="text"
                id="u_name"
                name="u_name"
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-400 focus:outline-none transition-shadow duration-300"
                placeholder="Choose a username"
                value={formData.u_name}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="pass" className="block text-gray-600 font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              id="pass"
              name="pass"
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-400 focus:outline-none transition-shadow duration-300"
              placeholder="Create a password"
              value={formData.pass}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-purple-600 text-white py-3 rounded-lg shadow-lg hover:bg-purple-700 hover:shadow-2xl transition-all duration-300"
          >
            {loading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-gray-500 text-center mt-6">
          Already have an account?{' '}
          <span
            className="text-purple-600 font-semibold cursor-pointer hover:underline"
            onClick={() => navigate('/login')}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
