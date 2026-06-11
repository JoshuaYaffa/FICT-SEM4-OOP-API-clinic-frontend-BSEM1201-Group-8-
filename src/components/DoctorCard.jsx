import React from 'react';
import { Link } from 'react-router-dom';

const DoctorCard = ({ doctor, clinicName }) => {
  if (!doctor) return null;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300">
      <div className="p-5">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-20 h-20 bg-cyan-600 rounded-full flex items-center justify-center text-white text-3xl shadow-md">
            {doctor.photo_url ? (
              <img src={doctor.photo_url} alt={doctor.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <span>👨‍⚕️</span>
            )}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">Dr. {doctor.name}</h3>
            <p className="text-cyan-600 font-medium">{doctor.specialization}</p>
          </div>
        </div>
        
        <div className="space-y-2 text-sm">
          {doctor.qualification && (
            <p className="flex items-center gap-2 text-gray-700">
              <span>📚</span> {doctor.qualification}
            </p>
          )}
          <p className="flex items-center gap-2 text-gray-700">
            <span>⭐</span> {doctor.experience_years || 5}+ years experience
          </p>
          {clinicName && (
            <p className="flex items-center gap-2 text-gray-700">
              <span>🏥</span> {clinicName}
            </p>
          )}
          <p className="flex items-center gap-2 text-gray-700">
            <span>📅</span> {doctor.availability || 'Weekdays 9AM-5PM'}
          </p>
        </div>
        
        {doctor.bio && (
          <p className="mt-3 text-sm text-gray-600 line-clamp-2">
            {doctor.bio}
          </p>
        )}
        
        <div className="mt-4 flex gap-2">
          <Link
            to={`/patient/doctor/${doctor.id}`}
            className="flex-1 text-center bg-cyan-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-cyan-700 transition"
          >
            View Profile
          </Link>
          <Link
            to={`/patient/book/${doctor.id}`}
            className="flex-1 text-center border-2 border-cyan-600 text-cyan-600 px-3 py-2 rounded-lg text-sm hover:bg-cyan-50 transition"
          >
            Book
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DoctorCard;