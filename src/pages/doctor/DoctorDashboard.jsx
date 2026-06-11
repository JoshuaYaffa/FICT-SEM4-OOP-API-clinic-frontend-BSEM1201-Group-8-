import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalAppointments: 0,
    pendingAppointments: 0,
    approvedAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    totalPatients: 0
  });
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [recentPatients, setRecentPatients] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctorData();
  }, []);

  const fetchDoctorData = async () => {
    try {
      // Get doctor profile
      const doctorsRes = await API.get('/doctors');
      const doctor = doctorsRes.data.find(d => d.name === user?.name || d.user_id === user?.id);
      
      if (!doctor) {
        console.error('Doctor profile not found');
        setLoading(false);
        return;
      }
      
      setDoctorProfile(doctor);
      
      // Get all appointments
      const appointmentsRes = await API.get('/appointments/all');
      const allAppointments = appointmentsRes.data || [];
      
      // Filter appointments for this doctor
      const doctorAppointments = allAppointments.filter(apt => apt.doctor_id === doctor.id);
      
      const today = new Date().toISOString().split('T')[0];
      const todayApps = doctorAppointments.filter(apt => apt.appointment_date === today);
      const upcoming = doctorAppointments.filter(apt => 
        apt.appointment_date > today && apt.status !== 'cancelled' && apt.status !== 'completed'
      );
      
      // Get unique patients
      const uniquePatients = [];
      const patientIds = new Set();
      for (const apt of doctorAppointments) {
        if (!patientIds.has(apt.patient_id)) {
          patientIds.add(apt.patient_id);
          uniquePatients.push({
            id: apt.patient_id,
            lastVisit: apt.appointment_date,
            status: apt.status
          });
        }
      }
      
      setStats({
        totalAppointments: doctorAppointments.length,
        pendingAppointments: doctorAppointments.filter(apt => apt.status === 'pending').length,
        approvedAppointments: doctorAppointments.filter(apt => apt.status === 'approved').length,
        completedAppointments: doctorAppointments.filter(apt => apt.status === 'completed').length,
        cancelledAppointments: doctorAppointments.filter(apt => apt.status === 'cancelled').length,
        totalPatients: uniquePatients.length
      });
      
      setTodayAppointments(todayApps.slice(0, 5));
      setUpcomingAppointments(upcoming.slice(0, 5));
      setRecentPatients(uniquePatients.slice(0, 5));
      
      // Get recent reviews
      const reviewsRes = await API.get('/reviews');
      setRecentReviews(reviewsRes.data.slice(0, 3));
      
    } catch (error) {
      console.error('Error fetching doctor data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (id, status) => {
    try {
      if (status === 'approved') {
        await API.put(`/appointments/${id}/approve`);
        toast.success('Appointment approved');
      } else if (status === 'completed') {
        await API.put(`/appointments/${id}/complete`);
        toast.success('Appointment completed');
      }
      fetchDoctorData();
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error('Failed to update appointment');
    }
  };

  if (loading) return <LoadingSpinner />;

  if (!doctorProfile) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Doctor profile not found.</p>
        <p className="text-gray-500 text-sm mt-2">Please contact administrator.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2">
        ← Back
      </button>

      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl p-6 mb-8 text-white">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Welcome back, Dr. {user?.name}! 👨‍⚕️
            </h1>
            <p className="text-cyan-100 mt-1">
              {doctorProfile.specialization} • {doctorProfile.experience_years}+ years experience
            </p>
          </div>
          <Link
            to="/doctor/profile"
            className="bg-white text-cyan-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Edit Profile
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-md p-4 text-center border-l-4 border-blue-600">
          <p className="text-2xl font-bold text-blue-600">{stats.totalAppointments}</p>
          <p className="text-sm text-gray-600">Total</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 text-center border-l-4 border-yellow-600">
          <p className="text-2xl font-bold text-yellow-600">{stats.pendingAppointments}</p>
          <p className="text-sm text-gray-600">Pending</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 text-center border-l-4 border-green-600">
          <p className="text-2xl font-bold text-green-600">{stats.approvedAppointments}</p>
          <p className="text-sm text-gray-600">Approved</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 text-center border-l-4 border-purple-600">
          <p className="text-2xl font-bold text-purple-600">{stats.completedAppointments}</p>
          <p className="text-sm text-gray-600">Completed</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 text-center border-l-4 border-cyan-600">
          <p className="text-2xl font-bold text-cyan-600">{stats.totalPatients}</p>
          <p className="text-sm text-gray-600">Patients</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Appointments */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b bg-blue-50">
              <h2 className="text-xl font-semibold text-gray-900">📋 Today's Appointments</h2>
            </div>
            <div className="p-4">
              {todayAppointments.length > 0 ? (
                <div className="space-y-3">
                  {todayAppointments.map((apt) => (
                    <div key={apt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Patient #{apt.patient_id}</p>
                        <p className="text-sm text-gray-600">Time: {apt.appointment_time || 'TBD'}</p>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                          apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          apt.status === 'approved' ? 'bg-green-100 text-green-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {apt.status}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {apt.status === 'pending' && (
                          <button
                            onClick={() => updateAppointmentStatus(apt.id, 'approved')}
                            className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                          >
                            Approve
                          </button>
                        )}
                        {apt.status === 'approved' && (
                          <button
                            onClick={() => updateAppointmentStatus(apt.id, 'completed')}
                            className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                          >
                            Complete
                          </button>
                        )}
                        <Link
                          to={`/doctor/appointment/${apt.id}/reply`}
                          className="px-2 py-1 border border-cyan-600 text-cyan-600 rounded text-xs hover:bg-cyan-50"
                        >
                          Reply
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-6">No appointments scheduled for today.</p>
              )}
              <div className="mt-4 text-center">
                <Link to="/doctor/appointments" className="text-cyan-600 hover:text-cyan-800 text-sm">
                  View all appointments →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b bg-green-50">
              <h2 className="text-xl font-semibold text-gray-900">📅 Upcoming Appointments</h2>
            </div>
            <div className="p-4">
              {upcomingAppointments.length > 0 ? (
                <div className="space-y-3">
                  {upcomingAppointments.map((apt) => (
                    <div key={apt.id} className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium text-gray-900">Patient #{apt.patient_id}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(apt.appointment_date).toLocaleDateString()} at {apt.appointment_time || 'TBD'}
                      </p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                        apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        apt.status === 'approved' ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {apt.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-6">No upcoming appointments.</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions & Recent Patients */}
        <div className="lg:col-span-1 space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-gray-900">⚡ Quick Actions</h2>
            </div>
            <div className="p-4 space-y-3">
              <Link
                to="/doctor/appointments"
                className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
              >
                <span className="text-2xl">📅</span>
                <div>
                  <p className="font-medium text-gray-900">View All Appointments</p>
                  <p className="text-xs text-gray-500">Manage all your appointments</p>
                </div>
              </Link>
              <Link
                to="/doctor/patients"
                className="flex items-center gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition"
              >
                <span className="text-2xl">👥</span>
                <div>
                  <p className="font-medium text-gray-900">My Patients</p>
                  <p className="text-xs text-gray-500">View patient history and reports</p>
                </div>
              </Link>
              <Link
                to="/doctor/clinic-report"
                className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition"
              >
                <span className="text-2xl">📊</span>
                <div>
                  <p className="font-medium text-gray-900">Annual Report</p>
                  <p className="text-xs text-gray-500">View and download your annual performance report</p>
                </div>
              </Link>
              <Link
                to="/doctor/profile"
                className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition"
              >
                <span className="text-2xl">⚙️</span>
                <div>
                  <p className="font-medium text-gray-900">Profile Settings</p>
                  <p className="text-xs text-gray-500">Update your availability and photo</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Recent Patients */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-gray-900">👥 Recent Patients</h2>
            </div>
            <div className="p-4">
              {recentPatients.length > 0 ? (
                <div className="space-y-2">
                  {recentPatients.map((patient) => (
                    <div key={patient.id} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                      <div>
                        <p className="font-medium text-gray-900">Patient #{patient.id}</p>
                        <p className="text-xs text-gray-500">Last visit: {patient.lastVisit}</p>
                      </div>
                      <Link to={`/doctor/patients`} className="text-cyan-600 text-sm hover:text-cyan-800">
                        View →
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">No patients yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Reviews */}
      {recentReviews.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">⭐ Recent Patient Reviews</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentReviews.map((review) => (
                <div key={review.id} className="border-b pb-4 last:border-0">
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(review.rating)].map((_, i) => (
                      <span key={i} className="text-yellow-400 text-lg">★</span>
                    ))}
                    {[...Array(5 - review.rating)].map((_, i) => (
                      <span key={i} className="text-gray-300 text-lg">★</span>
                    ))}
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                  <p className="text-sm text-gray-500 mt-1">- Patient #{review.user_id}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;