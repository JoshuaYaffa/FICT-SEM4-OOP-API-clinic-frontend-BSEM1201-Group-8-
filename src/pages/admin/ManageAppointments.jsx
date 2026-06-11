import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';

const ManageAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [filteredApps, setFilteredApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [statusFilter, searchTerm, appointments]);

  const fetchAppointments = async () => {
    try {
      const response = await API.get('/appointments/all');
      setAppointments(response.data || []);
      setFilteredApps(response.data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const filterAppointments = () => {
    let filtered = [...appointments];
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(apt => apt.status === statusFilter);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(apt => 
        apt.id.toString().includes(searchTerm) ||
        apt.patient_id.toString().includes(searchTerm) ||
        apt.doctor_id.toString().includes(searchTerm)
      );
    }
    
    setFilteredApps(filtered);
  };

  const updateStatus = async (id, status) => {
    try {
      if (status === 'approved') {
        await API.put(`/appointments/${id}/approve`);
      } else if (status === 'completed') {
        await API.put(`/appointments/${id}/complete`);
      } else if (status === 'cancelled') {
        await API.put(`/appointments/${id}/cancel`);
      }
      toast.success(`Appointment ${status}`);
      fetchAppointments();
      setShowModal(false);
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  const deleteAppointment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this appointment?')) return;
    try {
      await API.delete(`/appointments/${id}`);
      toast.success('Appointment deleted');
      fetchAppointments();
    } catch (error) {
      toast.error('Failed to delete');
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

  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'pending').length,
    approved: appointments.filter(a => a.status === 'approved').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6">
      <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2">
        ← Back
      </button>

      <h1 className="text-3xl font-bold mb-2">📅 Manage Appointments</h1>
      <p className="text-gray-600 mb-6">View, update, and manage all appointments in the system</p>

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

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Search by ID, Patient ID, or Doctor ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-cyan-500 focus:border-cyan-500"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-cyan-500 focus:border-cyan-500"
          >
            <option value="all">All Appointments</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Patient</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Doctor</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredApps.map((apt) => (
                <tr key={apt.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">#{apt.id}</td>
                  <td className="px-4 py-3 text-sm">Patient #{apt.patient_id}</td>
                  <td className="px-4 py-3 text-sm">Doctor #{apt.doctor_id}</td>
                  <td className="px-4 py-3 text-sm">{apt.appointment_date}</td>
                  <td className="px-4 py-3 text-sm">{apt.appointment_time || 'TBD'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>
                      {apt.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedAppointment(apt);
                          setShowModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Update
                      </button>
                      <button
                        onClick={() => deleteAppointment(apt.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredApps.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No appointments found
          </div>
        )}
      </div>

      {/* Update Status Modal */}
      {showModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Update Appointment</h2>
              <p className="text-gray-600 mb-4">Appointment #{selectedAppointment.id}</p>
              
              <div className="space-y-3 mb-6">
                <button
                  onClick={() => updateStatus(selectedAppointment.id, 'approved')}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Approve Appointment
                </button>
                <button
                  onClick={() => updateStatus(selectedAppointment.id, 'completed')}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Mark as Completed
                </button>
                <button
                  onClick={() => updateStatus(selectedAppointment.id, 'cancelled')}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Cancel Appointment
                </button>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageAppointments;