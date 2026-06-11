import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';

const MyAppointments = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (user) {
      fetchAppointments();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchAppointments = async () => {
    try {
      // Use the simple endpoint that returns raw JSON
      const response = await API.get('/appointments/simple');
      console.log('Appointments:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        setAppointments(response.data);
      } else {
        setAppointments([]);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    
    try {
      await API.put(`/appointments/${id}/cancel`);
      toast.success('Appointment cancelled successfully');
      fetchAppointments();
    } catch (error) {
      toast.error('Failed to cancel appointment');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredAppointments = statusFilter === 'all' 
    ? appointments 
    : appointments.filter(apt => apt.status === statusFilter);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6">
      <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2">
        ← Back
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">📋 My Appointments</h1>
        <p className="text-gray-600">View and manage all your scheduled appointments</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['all', 'pending', 'approved', 'completed', 'cancelled'].map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg capitalize ${
              statusFilter === status 
                ? 'bg-cyan-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {status} ({appointments.filter(a => status === 'all' ? true : a.status === status).length})
          </button>
        ))}
      </div>

      {filteredAppointments.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Appointments Yet</h3>
          <p className="text-gray-600 mb-6">You haven't booked any appointments yet.</p>
          <Link to="/patient/doctors" className="inline-block bg-cyan-600 text-white px-6 py-3 rounded-lg hover:bg-cyan-700 transition">
            Browse Doctors
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((apt) => (
            <div key={apt.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-wrap justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(apt.status)}`}>
                      {apt.status.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-500">Appointment #{apt.id}</span>
                  </div>
                  
                  <div className="space-y-1 text-gray-600">
                    <p>📅 Date: {apt.appointment_date}</p>
                    <p>⏰ Time: {apt.appointment_time || 'Time TBD'}</p>
                    <p>👨‍⚕️ Doctor ID: #{apt.doctor_id}</p>
                    <p>🏥 Clinic ID: #{apt.clinic_id}</p>
                  </div>
                </div>

                <div className="mt-4 sm:mt-0 flex gap-3">
                  {(apt.status === 'pending' || apt.status === 'approved') && (
                    <button onClick={() => cancelAppointment(apt.id)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                      Cancel
                    </button>
                  )}
                  <Link to={`/patient/appointment/${apt.id}`} className="px-4 py-2 border border-cyan-600 text-cyan-600 rounded-lg hover:bg-cyan-50">
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyAppointments;