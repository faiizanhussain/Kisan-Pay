import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/FormStyles.css';

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
    <div className="min-h-screen mt-16 flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <div className="bg-white shadow-2xl rounded-xl p-10 w-full max-w-lg transform hover:scale-105 transition-transform duration-500 ease-in-out">
        <h1 className="text-4xl font-extrabold text-gray-800 text-center mb-8">
          Welcome Back!
        </h1>
        <p className="text-gray-500 text-center mb-6">
          Login to access your <span className="font-bold text-purple-600">KisanPay</span> account.
        </p>
        {error && (
          <div className="text-red-600 bg-red-100 border border-red-300 rounded-lg px-4 py-2 mb-4 text-center">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          {/* Role Selection */}
          <div className="flex justify-center gap-8 mb-6">
            <label>
              <input
                type="radio"
                value="customer"
                checked={role === 'customer'}
                onChange={() => setRole('customer')}
                className="hidden peer"
              />
              <span className="peer-checked:bg-purple-600 peer-checked:text-white px-8 py-3 rounded-full border border-purple-500 cursor-pointer hover:bg-purple-200 transition-colors duration-300 ease-in-out">
                Customer
              </span>
            </label>
            <label>
              <input
                type="radio"
                value="admin"
                checked={role === 'admin'}
                onChange={() => setRole('admin')}
                className="hidden peer"
              />
              <span className="peer-checked:bg-purple-600 peer-checked:text-white px-8 py-3 rounded-full border border-purple-500 cursor-pointer hover:bg-purple-200 transition-colors duration-300 ease-in-out">
                Admin
              </span>
            </label>
          </div>

          {/* Email Input */}
          <div className="mb-6">
            <label
              htmlFor="email"
              className="block text-gray-600 font-medium mb-2"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-400 focus:outline-none transition-shadow duration-300"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password Input */}
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-gray-600 font-medium mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-400 focus:outline-none transition-shadow duration-300"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-3 rounded-lg shadow-lg hover:bg-purple-700 hover:shadow-2xl transition-all duration-300"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Footer */}
        <p className="text-gray-500 text-center mt-6">
          Don't have an account?{' '}
          <span
            className="text-purple-600 font-semibold cursor-pointer hover:underline"
            onClick={() => navigate('/signup')}
          >
            Sign Up
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;