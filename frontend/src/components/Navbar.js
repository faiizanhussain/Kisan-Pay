import React from 'react';
import { Link, useNavigate } from 'react-router-dom';


const Navbar = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem('role');

  const handleLogout = () => {
    localStorage.removeItem('role');
    localStorage.removeItem('cust_id');
    localStorage.removeItem('acc_no');
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-opacity-70 backdrop-blur-md shadow-lg z-50">
      <div className="container mx-auto flex justify-between items-center px-8 py-4">
        {/* Logo */}
        <div>
          <Link
            to="/"
            className="text-3xl font-bold tracking-wide text-white hover:text-yellow-300 transition duration-300"
          >
            KisanPay
          </Link>
        </div>

        {/* Navigation Links */}
        <ul className="flex space-x-8 text-lg">
          <li>
            <Link
              to="/"
              className="text-white hover:text-yellow-300 transition duration-300 hover:scale-105"
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              to="/about"
              className="text-white hover:text-yellow-300 transition duration-300 hover:scale-105"
            >
              About
            </Link>
          </li>

          {!role ? (
            <>
              <li>
                <Link
                  to="/login"
                  className="text-white hover:text-yellow-300 transition duration-300 hover:scale-105"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  to="/signup"
                  className="px-6 py-2 bg-yellow-400 text-black rounded-lg shadow-md hover:bg-yellow-500 hover:shadow-lg transition duration-300 transform hover:scale-105"
                >
                  Sign Up
                </Link>
              </li>
            </>
          ) : (
            <>
              {role === 'admin' && (
                <li>
                  <Link
                    to="/admin-dashboard"
                    className="text-white hover:text-yellow-300 transition duration-300 hover:scale-105"
                  >
                    Admin Dashboard
                  </Link>
                </li>
              )}
              {role === 'customer' && (
                <>
                  <li>
                    <Link
                      to="/customers"
                      className="text-white hover:text-yellow-300 transition duration-300 hover:scale-105"
                    >
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/loan-management"
                      className="text-white hover:text-yellow-300 transition duration-300 hover:scale-105"
                    >
                      Loans
                    </Link>
                  </li>
                </>
              )}
              <li>
                <button
                  onClick={handleLogout}
                  className="px-6 py-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 hover:shadow-lg transition duration-300 transform hover:scale-105"
                >
                  Logout
                </button>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;