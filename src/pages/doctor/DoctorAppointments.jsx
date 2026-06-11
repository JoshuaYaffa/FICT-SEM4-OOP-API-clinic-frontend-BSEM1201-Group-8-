import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';

const DoctorAppointments = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [filteredApps, setFilteredApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [statusFilter, appointments]);

  const fetchAppointments = async () => {
    try {
      // Get all appointments
      const response = await API.get('/appointments/all');
      const allAppointments = response.data || [];
      
      // Get doctor profile to find doctor_id
      const doctorsRes = await API.get('/doctors');
      const doctorProfile = doctorsRes.data.find(d => d.name === user?.name || d.user_id === user?.id);
      
      if (doctorProfile) {
        const myAppointments = allAppointments.filter(apt => apt.doctor_id === doctorProfile.id);
        setAppointments(myAppointments);
        setFilteredApps(myAppointments);
      } else {
        setAppointments([]);
        setFilteredApps([]);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const filterAppointments = () => {
    if (statusFilter === 'all') {
      setFilteredApps(appointments);
    } else {
      setFilteredApps(appointments.filter(apt => apt.status === statusFilter));
    }
  };

  const updateStatus = async (id, status) => {
    try {
      if (status === 'approved') {
        await API.put(`/appointments/${id}/approve`);
        toast.success('Appointment approved');
      } else if (status === 'completed') {
        await API.put(`/appointments/${id}/complete`);
        toast.success('Appointment completed');
      }
      fetchAppointments();
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6">
      <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2">
        ← Back
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">📅 Manage Appointments</h1>
        <p className="text-gray-600">View, approve, and complete patient appointments</p>
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
            {status} ({appointments.filter(a => a.status === status).length})
          </button>
        ))}
      </div>

      {filteredApps.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Appointments Yet</h3>
          <p className="text-gray-600">When patients book appointments with you, they will appear here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredApps.map((apt) => (
                  <tr key={apt.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">#{apt.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">Patient #{apt.patient_id}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{apt.appointment_date}</p>
                      <p className="text-xs text-gray-500">{apt.appointment_time || 'TBD'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>
                        {apt.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {apt.status === 'pending' && (
                          <button
                            onClick={() => updateStatus(apt.id, 'approved')}
                            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                          >
                            Approve
                          </button>
                        )}
                        {apt.status === 'approved' && (
                          <button
                            onClick={() => updateStatus(apt.id, 'completed')}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                          >
                            Complete
                          </button>
                        )}
                        <Link
                          to={`/doctor/appointment/${apt.id}/reply`}
                          className="px-3 py-1 border border-cyan-600 text-cyan-600 rounded text-sm hover:bg-cyan-50"
                        >
                          Reply
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;