import React from 'react';
import { Link } from 'react-router-dom';

const ClinicCard = ({ clinic }) => {
  if (!clinic) return null;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300">
      <div className="h-40 bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center">
        {clinic.image_url ? (
          <img src={clinic.image_url} alt={clinic.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-6xl">🏥</span>
        )}
      </div>
      
      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{clinic.name}</h3>
        
        <div className="space-y-2 text-sm text-gray-600">
          <p className="flex items-center gap-2">
            <span>📍</span> {clinic.district}, {clinic.location}
          </p>
          <p className="flex items-center gap-2">
            <span>📞</span> {clinic.phone}
          </p>
          <p className="flex items-center gap-2">
            <span>🕐</span> {clinic.opening_time} - {clinic.closing_time}
          </p>
        </div>
        
        <div className="mt-3 flex flex-wrap gap-2">
          {clinic.emergency_available && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              🚨 Emergency
            </span>
          )}
          {clinic.ambulance_available && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              🚑 Ambulance
            </span>
          )}
        </div>
        
        <Link
          to={`/patient/clinic/${clinic.id}`}
          className="mt-4 inline-block w-full text-center bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default ClinicCard;