import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';

const PatientDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalAppointments: 0,
    upcomingAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0
  });
  const [upcomingApps, setUpcomingApps] = useState([]);
  const [recentClinics, setRecentClinics] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    fetchNotifications();
    fetchUnreadCount();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch appointments for the logged-in patient
      const appointmentsRes = await API.get('/appointments/my');
      const appointments = appointmentsRes.data || [];
      
      const today = new Date().toISOString().split('T')[0];
      const upcoming = appointments.filter(apt => 
        apt.appointment_date >= today && apt.status !== 'cancelled' && apt.status !== 'completed'
      );
      const completed = appointments.filter(apt => apt.status === 'completed');
      const cancelled = appointments.filter(apt => apt.status === 'cancelled');
      
      setStats({
        totalAppointments: appointments.length,
        upcomingAppointments: upcoming.length,
        completedAppointments: completed.length,
        cancelledAppointments: cancelled.length
      });
      setUpcomingApps(upcoming.slice(0, 5));
      
      // Fetch recent clinics
      const clinicsRes = await API.get('/clinics?limit=4');
      setRecentClinics(clinicsRes.data || []);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await API.get('/notifications');
      setNotifications(response.data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await API.get('/notifications/unread-count');
      setUnreadCount(response.data.unread_count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await API.put(`/appointments/${id}/cancel`);
      toast.success('Appointment cancelled successfully');
      fetchDashboardData();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast.error(error.response?.data?.detail || 'Failed to cancel appointment');
    }
  };

  const markNotificationAsRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const created = new Date(date);
    const diffMs = now - created;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  if (loading) return <LoadingSpinner />;

  const recentNotifications = notifications.slice(0, 3);

  return (
    <div className="p-6">
      <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2">
        ← Back
      </button>

      {/* Welcome Section with Notification Bell */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl p-6 mb-8 text-white">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-cyan-100 mt-1">
              Manage your health appointments and find the best healthcare services
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/patient/notifications" className="relative">
              <span className="text-3xl">🔔</span>
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>
            <Link
              to="/patient/doctors"
              className="bg-white text-cyan-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              + Book Appointment
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <p className="text-2xl font-bold text-cyan-600">{stats.totalAppointments}</p>
          <p className="text-sm text-gray-600">Total Appointments</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">{stats.upcomingAppointments}</p>
          <p className="text-sm text-gray-600">Upcoming</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{stats.completedAppointments}</p>
          <p className="text-sm text-gray-600">Completed</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{stats.cancelledAppointments}</p>
          <p className="text-sm text-gray-600">Cancelled</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upcoming Appointments */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-gray-900">📅 Upcoming Appointments</h2>
            </div>
            <div className="p-4">
              {upcomingApps.length > 0 ? (
                <div className="space-y-3">
                  {upcomingApps.map((apt) => (
                    <div key={apt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">
                          {new Date(apt.appointment_date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                        <p className="text-sm text-gray-600">{apt.appointment_time || 'Time TBD'}</p>
                        <p className="text-sm text-gray-500">Doctor #{apt.doctor_id}</p>
                      </div>
                      <div className="flex gap-2">
                        <Link
                          to={`/patient/appointment/${apt.id}`}
                          className="px-3 py-1 text-cyan-600 border border-cyan-600 rounded-lg text-sm hover:bg-cyan-50"
                        >
                          View
                        </Link>
                        {apt.status === 'pending' && (
                          <button
                            onClick={() => cancelAppointment(apt.id)}
                            className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No upcoming appointments</p>
              )}
              <div className="mt-4 text-center">
                <Link to="/patient/appointments" className="text-cyan-600 hover:text-cyan-800 text-sm">
                  View all appointments →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions & Notifications */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-gray-900">⚡ Quick Actions</h2>
            </div>
            <div className="p-4 space-y-3">
              <Link
                to="/patient/clinics"
                className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
              >
                <span className="text-2xl">🔍</span>
                <div>
                  <p className="font-medium text-gray-900">Find a Clinic</p>
                  <p className="text-xs text-gray-500">Search clinics near you</p>
                </div>
              </Link>
              <Link
                to="/patient/doctors"
                className="flex items-center gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition"
              >
                <span className="text-2xl">👨‍⚕️</span>
                <div>
                  <p className="font-medium text-gray-900">Browse Doctors</p>
                  <p className="text-xs text-gray-500">Find doctors by specialization</p>
                </div>
              </Link>
              <Link
                to="/patient/profile"
                className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition"
              >
                <span className="text-2xl">⚙️</span>
                <div>
                  <p className="font-medium text-gray-900">My Profile</p>
                  <p className="text-xs text-gray-500">Update personal information</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Recent Notifications */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">🔔 Recent Notifications</h2>
              <Link to="/patient/notifications" className="text-cyan-600 text-sm hover:text-cyan-800">
                View all
              </Link>
            </div>
            <div className="p-4">
              {recentNotifications.length > 0 ? (
                <div className="space-y-3">
                  {recentNotifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      className={`p-3 rounded-lg cursor-pointer transition ${!notif.is_read ? 'bg-blue-50 border-l-4 border-blue-600' : 'bg-gray-50'}`}
                      onClick={() => markNotificationAsRead(notif.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">{notif.title}</p>
                          <p className="text-gray-600 text-xs mt-1 line-clamp-2">{notif.message}</p>
                          <p className="text-gray-400 text-xs mt-1">{getTimeAgo(notif.created_at)}</p>
                        </div>
                        {!notif.is_read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-1"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500 text-sm">No notifications yet</p>
                  <p className="text-gray-400 text-xs mt-1">When you receive notifications, they will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Featured Clinics */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">🏥 Featured Clinics</h2>
          <Link to="/patient/clinics" className="text-cyan-600 hover:text-cyan-800 text-sm">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recentClinics.map((clinic) => (
            <div key={clinic.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
              <div className="h-32 bg-gradient-to-r from-cyan-400 to-blue-400 flex items-center justify-center">
                <span className="text-4xl">🏥</span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900">{clinic.name}</h3>
                <p className="text-sm text-gray-600">{clinic.district}</p>
                <Link to={`/patient/clinic/${clinic.id}`} className="mt-2 inline-block text-cyan-600 text-sm hover:text-cyan-800">
                  View Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;