import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const AccountDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  return (
    <div className="p-8 text-black bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Account Details</h1>
      <p className="mb-4">Details for account ID: {id}</p>
      <button onClick={() => navigate(-1)} className="bg-blue-500 text-white px-4 py-2 rounded">
        Back
      </button>
    </div>
  );
};

export default AccountDetails;
