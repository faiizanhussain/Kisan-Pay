import React from 'react';

const ProfileSection = ({ profile }) => {
  return (
    <div className="section">
      <h2 className="section-title">Profile Details</h2>
      {profile ? (
        <ul>
          <li><strong>First Name:</strong> {profile.f_name}</li>
          <li><strong>Last Name:</strong> {profile.l_name}</li>
          <li><strong>Email:</strong> {profile.email}</li>
          <li><strong>Phone:</strong> {profile.phone}</li>
          <li><strong>CNIC:</strong> {profile.cnic}</li>
          <li><strong>Username:</strong> {profile.u_name}</li>
          <li><strong>Role:</strong> {profile.role}</li>
          <li><strong>AccountNo:</strong> {profile.acc_no}</li>
        
        </ul>
      ) : (
        <p>No profile data available.</p>
      )}
    </div>
  );
};

export default ProfileSection;