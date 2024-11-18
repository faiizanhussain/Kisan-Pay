import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <h1>Welcome to KisanPay</h1>
            <p>Manage your financial activities with ease.</p>
            <div style={{ marginTop: '20px' }}>
                <Link to="/login">
                    <button style={{ margin: '0 10px' }}>Login</button>
                </Link>
                <Link to="/signup">
                    <button style={{ margin: '0 10px' }}>Sign Up</button>
                </Link>
            </div>
        </div>
    );
};

export default Home;
