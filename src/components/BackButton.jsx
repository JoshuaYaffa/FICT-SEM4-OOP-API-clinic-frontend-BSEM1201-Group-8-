import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const BackButton = () => {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(window.location.pathname !== '/');
  }, [window.location.pathname]);

  if (!show) return null;

  return (
    <button
      onClick={() => navigate(-1)}
      className="fixed bottom-6 left-6 z-50 bg-cyan-600 text-white p-3 rounded-full shadow-lg hover:bg-cyan-700 transition-all duration-300 flex items-center justify-center"
      style={{ width: '48px', height: '48px' }}
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
    </button>
  );
};

export default BackButton;