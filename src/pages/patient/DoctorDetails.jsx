import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

const DoctorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [clinic, setClinic] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctorDetails();
  }, [id]);

  const fetchDoctorDetails = async () => {
    try {
      const doctorRes = await API.get(`/doctors/${id}`);
      setDoctor(doctorRes.data);
      
      const clinicRes = await API.get(`/clinics/${doctorRes.data.clinic_id}`);
      setClinic(clinicRes.data);
    } catch (error) {
      console.error('Error fetching doctor details:', error);
      toast.error('Failed to load doctor details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2">
        ← Back
      </button>

      <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl p-8 mb-8 text-white">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center text-6xl shadow-lg">
            {doctor?.photo_url ? (
              <img src={doctor.photo_url} alt={doctor.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              '👨‍⚕️'
            )}
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold">Dr. {doctor?.name}</h1>
            <p className="text-cyan-100 text-xl mt-1">{doctor?.specialization}</p>
            <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
              <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm">
                📅 {doctor?.experience_years || 0}+ years
              </span>
              <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm">
                🏥 {clinic?.name}
              </span>
              <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm">
                ⏰ {doctor?.availability}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">📋 About Dr. {doctor?.name}</h2>
        <div className="space-y-3">
          {doctor?.qualification && (
            <p><span className="font-medium">Qualification:</span> {doctor.qualification}</p>
          )}
          <p><span className="font-medium">Experience:</span> {doctor?.experience_years || 0}+ years of practice</p>
          <p><span className="font-medium">Specialization:</span> {doctor?.specialization}</p>
          <p><span className="font-medium">Working Hours:</span> {doctor?.availability}</p>
          {doctor?.bio && (
            <div className="mt-4 pt-4 border-t">
              <h3 className="font-medium text-gray-900 mb-2">About</h3>
              <p className="text-gray-600">{doctor.bio}</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">🏥 Clinic Information</h2>
        <div className="space-y-2">
          <p><span className="font-medium">Clinic Name:</span> {clinic?.name}</p>
          <p><span className="font-medium">Location:</span> {clinic?.district}, {clinic?.location}</p>
          <p><span className="font-medium">Phone:</span> {clinic?.phone}</p>
          <p><span className="font-medium">Hours:</span> {clinic?.opening_time} - {clinic?.closing_time}</p>
          {clinic?.emergency_available && (
            <p className="text-red-600 mt-2">🚨 Emergency Services Available</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-4">📅 Ready to Book?</h2>
        <p className="text-gray-600 mb-6">Schedule your appointment with Dr. {doctor?.name}</p>
        <Link
          to={`/patient/book/${doctor?.id}`}
          className="inline-block bg-cyan-600 text-white px-8 py-3 rounded-lg hover:bg-cyan-700 transition font-semibold"
        >
          Book Appointment Now
        </Link>
      </div>
    </div>
  );
};

export default DoctorDetails;