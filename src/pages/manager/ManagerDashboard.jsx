import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [clinic, setClinic] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [managerStats, setManagerStats] = useState(null);

  useEffect(() => {
    fetchManagerData();
  }, []);

  const fetchManagerData = async () => {
    try {
      setLoading(true);
      
      // Try to get manager stats from new endpoint
      try {
        const statsRes = await API.get('/dashboard/manager-stats');
        setManagerStats(statsRes.data);
      } catch (statsError) {
        console.log('Manager stats endpoint not available yet, using fallback');
      }
      
      // Get clinics to find the one managed by this user
      const clinicsRes = await API.get('/clinics?limit=1000');
      const managerClinic = clinicsRes.data.find(c => c.clinic_manager_id === user?.id);
      
      if (managerClinic) {
        setClinic(managerClinic);
        
        // Get doctors for this clinic
        const doctorsRes = await API.get(`/doctors/clinic/${managerClinic.id}?limit=1000`);
        setDoctors(doctorsRes.data || []);
        
        // FIXED: Use '/appointments/all' instead of '/appointments'
        const appointmentsRes = await API.get('/appointments/all');
        const clinicApps = (appointmentsRes.data || []).filter(apt => apt.clinic_id === managerClinic.id);
        setAppointments(clinicApps);
        
        // Get reviews for this clinic
        const reviewsRes = await API.get(`/reviews/clinic/${managerClinic.id}`);
        setReviews(reviewsRes.data || []);
      } else {
        toast.error('You are not assigned to any clinic');
      }
    } catch (error) {
      console.error('Error fetching manager data:', error);
      toast.error(error.response?.data?.detail || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const pendingCount = appointments.filter(a => a.status === 'pending').length;
  const approvedCount = appointments.filter(a => a.status === 'approved').length;
  const completedCount = appointments.filter(a => a.status === 'completed').length;
  const cancelledCount = appointments.filter(a => a.status === 'cancelled').length;

  if (loading) return <LoadingSpinner />;

  if (!clinic) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">You are not assigned to any clinic yet.</p>
        <p className="text-gray-500 mt-2">Please contact the administrator.</p>
        <button 
          onClick={() => navigate('/dashboard')}
          className="mt-4 text-cyan-600 hover:underline"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2">
        ← Back
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🏥 Clinic Manager Dashboard</h1>
        <p className="text-gray-600">Managing: {clinic.name} - {clinic.district}</p>
        <p className="text-sm text-gray-500 mt-1">📍 {clinic.location} | 📞 {clinic.phone}</p>
        <div className="flex gap-2 mt-2">
          {clinic.emergency_available && (
            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">🚨 Emergency Services</span>
          )}
          {clinic.ambulance_available && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">🚑 Ambulance Services</span>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-xl p-6">
          <p className="text-blue-100 text-sm">Total Doctors</p>
          <p className="text-3xl font-bold">{doctors.length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-600 to-green-700 text-white rounded-xl p-6">
          <p className="text-green-100 text-sm">Total Appointments</p>
          <p className="text-3xl font-bold">{appointments.length}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-xl p-6">
          <p className="text-purple-100 text-sm">Patient Reviews</p>
          <p className="text-3xl font-bold">{reviews.length}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 text-white rounded-xl p-6">
          <p className="text-yellow-100 text-sm">Average Rating</p>
          <p className="text-3xl font-bold">{averageRating}⭐</p>
        </div>
      </div>

      {/* Appointment Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-md p-4 text-center border-l-4 border-yellow-500">
          <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
          <p className="text-sm text-gray-600">Pending Appointments</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 text-center border-l-4 border-green-500">
          <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
          <p className="text-sm text-gray-600">Approved</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 text-center border-l-4 border-blue-500">
          <p className="text-2xl font-bold text-blue-600">{completedCount}</p>
          <p className="text-sm text-gray-600">Completed</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 text-center border-l-4 border-red-500">
          <p className="text-2xl font-bold text-red-600">{cancelledCount}</p>
          <p className="text-sm text-gray-600">Cancelled</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Link to="/manager/doctors" className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg p-4 text-center hover:shadow-lg transition">
          <div className="text-2xl mb-1">👨‍⚕️</div>
          <p className="font-semibold">Manage Doctors</p>
          <p className="text-xs opacity-90">Add, edit, remove doctors</p>
        </Link>

        <Link to="/manager/appointments" className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg p-4 text-center hover:shadow-lg transition">
          <div className="text-2xl mb-1">📅</div>
          <p className="font-semibold">Manage Appointments</p>
          <p className="text-xs opacity-90">View, approve, complete</p>
        </Link>

        <Link to="/manager/reviews" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg p-4 text-center hover:shadow-lg transition">
          <div className="text-2xl mb-1">⭐</div>
          <p className="font-semibold">Manage Reviews</p>
          <p className="text-xs opacity-90">View and respond</p>
        </Link>

        <Link to="/manager/services" className="bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg p-4 text-center hover:shadow-lg transition">
          <div className="text-2xl mb-1">🔧</div>
          <p className="font-semibold">Manage Services</p>
          <p className="text-xs opacity-90">Add/edit clinic services</p>
        </Link>
      </div>

      {/* Recent Appointments */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">📋 Recent Appointments</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Patient</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Doctor</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {appointments.slice(0, 10).map((apt) => (
                <tr key={apt.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">#{apt.id}</td>
                  <td className="px-4 py-3 text-sm">Patient #{apt.patient_id}</td>
                  <td className="px-4 py-3 text-sm">Doctor #{apt.doctor_id}</td>
                  <td className="px-4 py-3 text-sm">{apt.appointment_date} at {apt.appointment_time || 'TBD'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      apt.status === 'approved' ? 'bg-green-100 text-green-800' :
                      apt.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {apt.status}
                    </span>
                   </td>
                 </tr>
              ))}
              {appointments.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500">
                    No appointments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Doctors List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mt-8">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">👨‍⚕️ Doctors at {clinic.name}</h2>
        </div>
        <div className="p-4">
          {doctors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {doctors.map((doctor) => (
                <div key={doctor.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Dr. {doctor.name}</p>
                    <p className="text-sm text-cyan-600">{doctor.specialization}</p>
                    <p className="text-xs text-gray-500">{doctor.experience_years}+ years experience</p>
                  </div>
                  <div>
                    {doctor.is_approved ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Approved</span>
                    ) : (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Pending</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">No doctors assigned to this clinic yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;