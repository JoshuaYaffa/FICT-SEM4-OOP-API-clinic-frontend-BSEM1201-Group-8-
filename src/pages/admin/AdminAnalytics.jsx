import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminAnalytics = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [appointmentStats, setAppointmentStats] = useState(null);
  const [clinicRatings, setClinicRatings] = useState([]);
  const [mostBookedDoctor, setMostBookedDoctor] = useState(null);
  const [mostActiveClinic, setMostActiveClinic] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [statsRes, aptStatsRes, ratingsRes, doctorRes, clinicRes] = await Promise.all([
        API.get('/dashboard/stats'),
        API.get('/dashboard/appointment-statistics'),
        API.get('/dashboard/clinic-ratings'),
        API.get('/dashboard/most-booked-doctor'),
        API.get('/dashboard/most-active-clinic')
      ]);
      setStats(statsRes.data);
      setAppointmentStats(aptStatsRes.data);
      setClinicRatings(ratingsRes.data);
      setMostBookedDoctor(doctorRes.data);
      setMostActiveClinic(clinicRes.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6">
      <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2">
        ← Back
      </button>

      <h1 className="text-3xl font-bold mb-6">📊 Analytics Dashboard</h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 text-white rounded-xl p-6">
          <p className="text-cyan-100 text-sm">Total Users</p>
          <p className="text-3xl font-bold">{stats?.total_users || 0}</p>
        </div>
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl p-6">
          <p className="text-green-100 text-sm">Total Clinics</p>
          <p className="text-3xl font-bold">{stats?.total_clinics || 0}</p>
        </div>
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl p-6">
          <p className="text-purple-100 text-sm">Total Doctors</p>
          <p className="text-3xl font-bold">{stats?.total_doctors || 0}</p>
        </div>
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl p-6">
          <p className="text-orange-100 text-sm">Appointments</p>
          <p className="text-3xl font-bold">{stats?.total_appointments || 0}</p>
        </div>
      </div>

      {/* Appointment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Appointment Status</h2>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between">
                <span>Pending</span>
                <span className="font-bold text-yellow-600">{appointmentStats?.pending || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${((appointmentStats?.pending || 0) / (stats?.total_appointments || 1)) * 100}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between">
                <span>Approved</span>
                <span className="font-bold text-green-600">{appointmentStats?.approved || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${((appointmentStats?.approved || 0) / (stats?.total_appointments || 1)) * 100}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between">
                <span>Completed</span>
                <span className="font-bold text-blue-600">{appointmentStats?.completed || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${((appointmentStats?.completed || 0) / (stats?.total_appointments || 1)) * 100}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between">
                <span>Cancelled</span>
                <span className="font-bold text-red-600">{appointmentStats?.cancelled || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: `${((appointmentStats?.cancelled || 0) / (stats?.total_appointments || 1)) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Top Performers</h2>
          <div className="space-y-4">
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Most Booked Doctor</p>
              <p className="text-xl font-bold text-gray-900">{mostBookedDoctor?.doctor_name || 'N/A'}</p>
              <p className="text-sm text-green-600">{mostBookedDoctor?.appointments || 0} appointments</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Most Active Clinic</p>
              <p className="text-xl font-bold text-gray-900">{mostActiveClinic?.clinic_name || 'N/A'}</p>
              <p className="text-sm text-blue-600">{mostActiveClinic?.appointments || 0} appointments</p>
            </div>
          </div>
        </div>
      </div>

      {/* Clinic Ratings */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Clinic Ratings</h2>
        <div className="space-y-3">
          {clinicRatings.slice(0, 5).map((rating) => (
            <div key={rating.clinic_id} className="flex justify-between items-center p-3 border-b">
              <span className="font-medium">{rating.clinic_name}</span>
              <div className="flex items-center gap-2">
                <span className="text-yellow-500">⭐</span>
                <span>{rating.average_rating}/5</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;