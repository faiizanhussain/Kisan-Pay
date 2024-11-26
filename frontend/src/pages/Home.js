import React from 'react';
import { Link } from 'react-router-dom';
import homeImage from '../home-image.jpg'; // Ensure your image is in the src/assets folder

const Home = () => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-100 min-h-screen flex items-center justify-center">
      <div className="container mx-auto px-8">
        <div className="flex flex-wrap items-center justify-between">
          {/* Text Section */}
          <div className="text-center md:text-left space-y-8 flex-1">
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-800 tracking-wide leading-tight">
              Welcome to <span className="text-blue-500">KisanPay</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600">
              Simplify your financial management with features tailored for farmers and businesses. 
              Manage loans, inventory, transactions, and more, all in one place.
            </p>

            {/* Call-to-Action Buttons */}
            <div className="flex justify-center md:justify-start gap-6 mt-6">
              <Link
                to="/login"
                className="px-8 py-3 bg-blue-500 text-white rounded-lg shadow-lg text-lg hover:bg-blue-600 hover:shadow-xl transition-all duration-300"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-8 py-3 bg-yellow-400 text-gray-800 rounded-lg shadow-lg text-lg hover:bg-yellow-500 hover:shadow-xl transition-all duration-300"
              >
                Sign Up
              </Link>
            </div>
          </div>

          {/* Image Section */}
          <div className="flex-1 flex justify-center mt-10 md:mt-0">
            <div className="rounded-xl shadow-xl overflow-hidden transform hover:scale-105 hover:shadow-2xl transition-all duration-300">
              <img
                src={homeImage}
                alt="KisanPay Illustration"
                className="w-full max-w-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
