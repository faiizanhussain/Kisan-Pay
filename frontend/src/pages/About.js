import React from 'react';
import '../styles/About.css';
import aboutImage from '../home-image.jpg'; // Place your image in the src/assets folder

const About = () => {
  return (
    <div className="about-container">
      <div className="about-content">
        <h1 className="about-title">About KisanPay</h1>
        <p className="about-description">
          Welcome to <span className="highlight">KisanPay</span>, your trusted platform for managing financial transactions 
          and empowering buyers and sellers in the agricultural industry. Our mission is to create a seamless experience 
          for managing accounts, loans, transactions, and product inventories. Whether you are a farmer, supplier, or buyer, 
          KisanPay is designed to help you grow and thrive.
        </p>
        <p className="about-description">
          Built with a focus on simplicity and efficiency, KisanPay leverages modern technology to bring a 
          comprehensive and intuitive dashboard for managing all your financial needs. Join us today and be part 
          of a revolution in financial management!
        </p>
      </div>
      <div className="about-image">
        <img src={aboutImage} alt="About KisanPay" />
      </div>
    </div>
  );
};

export default About;
