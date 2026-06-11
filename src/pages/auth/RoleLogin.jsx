import React from 'react';
import { Link } from 'react-router-dom';

const RoleLogin = () => {
  const roles = [
    { name: 'Patient', icon: '👤', path: '/login', color: 'bg-blue-600', role: 'patient', description: 'Book appointments, view clinics, manage health' },
    { name: 'Doctor', icon: '👨‍⚕️', path: '/login', color: 'bg-green-600', role: 'doctor', description: 'Manage appointments, view patient reports' },
    { name: 'Clinic Manager', icon: '🏥', path: '/login', color: 'bg-purple-600', role: 'manager', description: 'Manage clinic operations and staff' },
    { name: 'Admin', icon: '👑', path: '/login', color: 'bg-red-600', role: 'admin', description: 'Full system control and analytics' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-cyan-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-3xl">🏥</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Smart Clinic Service</h1>
          <p className="text-xl text-gray-600">Select your role to continue</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {roles.map((role, index) => (
            <Link
              key={index}
              to={role.path}
              state={{ role: role.role }}
              className={`${role.color} text-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition transform hover:-translate-y-1`}
            >
              <div className="p-6 text-center">
                <div className="text-6xl mb-4">{role.icon}</div>
                <h3 className="text-2xl font-bold mb-2">{role.name}</h3>
                <p className="text-sm opacity-90">{role.description}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-cyan-600 hover:text-cyan-800 font-semibold">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleLogin;