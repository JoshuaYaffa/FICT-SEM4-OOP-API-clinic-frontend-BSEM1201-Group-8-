import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';

const ManagerAppointments = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [filteredApps, setFilteredApps] = useState([]);
  const [clinic, setClinic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchClinicAndAppointments();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [statusFilter, appointments]);

  const fetchClinicAndAppointments = async () => {
    try {
      setLoading(true);
      // Get clinics to find the one managed by this user
      const clinicsRes = await API.get('/clinics?limit=1000');
      const managerClinic = clinicsRes.data.find(c => c.clinic_manager_id === user?.id);
      setClinic(managerClinic);
      
      if (managerClinic) {
        // FIXED: Use '/appointments/all' instead of '/appointments'
        const appointmentsRes = await API.get('/appointments/all');
        const clinicApps = (appointmentsRes.data || []).filter(apt => apt.clinic_id === managerClinic.id);
        setAppointments(clinicApps);
        setFilteredApps(clinicApps);
      } else {
        toast.error('You are not assigned to any clinic');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error(error.response?.data?.detail || 'Failed to load appointments');
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
      } else if (status === 'cancelled') {
        await API.put(`/appointments/${id}/cancel`);
        toast.success('Appointment cancelled');
      }
      fetchClinicAndAppointments();
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error(error.response?.data?.detail || 'Failed to update');
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

  if (!clinic) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">You are not assigned to any clinic.</p>
        <p className="text-gray-500 mt-2">Please contact the administrator.</p>
        <button 
          onClick={() => navigate('/manager/dashboard')}
          className="mt-4 text-cyan-600 hover:underline"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'pending').length,
    approved: appointments.filter(a => a.status === 'approved').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length
  };

  return (
    <div className="p-6">
      <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2">
        ← Back
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">📅 Clinic Appointments</h1>
        <p className="text-gray-600">Managing appointments at {clinic.name}</p>
        <p className="text-sm text-gray-500 mt-1">📍 {clinic.location} | 📞 {clinic.phone}</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-gray-100 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-600">Total</p>
        </div>
        <div className="bg-yellow-100 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          <p className="text-xs text-gray-600">Pending</p>
        </div>
        <div className="bg-green-100 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
          <p className="text-xs text-gray-600">Approved</p>
        </div>
        <div className="bg-blue-100 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
          <p className="text-xs text-gray-600">Completed</p>
        </div>
        <div className="bg-red-100 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
          <p className="text-xs text-gray-600">Cancelled</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['all', 'pending', 'approved', 'completed', 'cancelled'].map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg capitalize transition ${
              statusFilter === status 
                ? 'bg-cyan-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {status} ({status === 'all' ? stats.total : stats[status]})
          </button>
        ))}
      </div>

      {/* Appointments List */}
      {filteredApps.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Appointments Found</h3>
          <p className="text-gray-600">No appointments match the selected filter.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="divide-y divide-gray-200">
            {filteredApps.map((apt) => (
              <div key={apt.id} className="p-4 hover:bg-gray-50 transition">
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>
                        {apt.status}
                      </span>
                      <span className="text-xs text-gray-500">Appointment #{apt.id}</span>
                    </div>
                    <p className="font-medium text-gray-900">Patient #{apt.patient_id}</p>
                    <p className="text-sm text-gray-600">Doctor #{apt.doctor_id}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      📅 {apt.appointment_date} at ⏰ {apt.appointment_time || 'TBD'}
                    </p>
                  </div>
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
                    {(apt.status === 'pending' || apt.status === 'approved') && (
                      <button
                        onClick={() => updateStatus(apt.id, 'cancelled')}
                        className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerAppointments;