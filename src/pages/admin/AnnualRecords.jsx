import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';

const AnnualRecords = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({
    clinic_id: '',
    year: new Date().getFullYear(),
    total_patients: '',
    total_appointments: '',
    completed_appointments: '',
    cancelled_appointments: '',
    total_doctors: '',
    total_services: '',
    revenue_estimate: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [recordsRes, clinicsRes] = await Promise.all([
        API.get('/annual-records'),
        API.get('/clinics')
      ]);
      setRecords(recordsRes.data || []);
      setClinics(clinicsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRecord) {
        await API.put(`/annual-records/${editingRecord.id}`, formData);
        toast.success('Record updated successfully');
      } else {
        await API.post('/annual-records', formData);
        toast.success('Record created successfully');
      }
      fetchData();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving record:', error);
      toast.error(error.response?.data?.detail || 'Failed to save record');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      await API.delete(`/annual-records/${id}`);
      toast.success('Record deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting record:', error);
      toast.error('Failed to delete record');
    }
  };

  const resetForm = () => {
    setEditingRecord(null);
    setFormData({
      clinic_id: '',
      year: new Date().getFullYear(),
      total_patients: '',
      total_appointments: '',
      completed_appointments: '',
      cancelled_appointments: '',
      total_doctors: '',
      total_services: '',
      revenue_estimate: ''
    });
  };

  const getClinicName = (id) => {
    const clinic = clinics.find(c => c.id === id);
    return clinic ? clinic.name : `Clinic #${id}`;
  };

  const currentYear = new Date().getFullYear();
  const years = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6">
      <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2">
        ← Back
      </button>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">📊 Annual Records</h1>
          <p className="text-gray-600">Manage clinic annual performance records</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-cyan-600 text-white px-6 py-2 rounded-lg hover:bg-cyan-700 transition"
        >
          + Add Record
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-4">
          <p className="text-blue-100 text-sm">Total Records</p>
          <p className="text-2xl font-bold">{records.length}</p>
        </div>
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg p-4">
          <p className="text-green-100 text-sm">Clinics Tracked</p>
          <p className="text-2xl font-bold">{new Set(records.map(r => r.clinic_id)).size}</p>
        </div>
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg p-4">
          <p className="text-purple-100 text-sm">Years Range</p>
          <p className="text-2xl font-bold">
            {records.length > 0 ? `${Math.min(...records.map(r => r.year))} - ${Math.max(...records.map(r => r.year))}` : 'N/A'}
          </p>
        </div>
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg p-4">
          <p className="text-orange-100 text-sm">Total Revenue</p>
          <p className="text-2xl font-bold">
            Le {records.reduce((sum, r) => sum + (r.revenue_estimate || 0), 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clinic</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patients</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Appointments</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completed</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctors</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {records.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{getClinicName(record.clinic_id)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{record.year}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{record.total_patients?.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{record.total_appointments?.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{record.completed_appointments?.toLocaleString()}</span>
                      <span className="text-xs text-green-600">
                        ({record.total_appointments > 0 ? Math.round((record.completed_appointments / record.total_appointments) * 100) : 0}%)
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{record.total_doctors}</td>
                  <td className="px-4 py-3 text-sm font-medium text-green-600">
                    Le {record.revenue_estimate?.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingRecord(record);
                          setFormData(record);
                          setShowModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(record.id)}
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
        {records.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No annual records found. Click "Add Record" to create one.
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">
                  {editingRecord ? 'Edit Annual Record' : 'Add New Annual Record'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Clinic *</label>
                    <select
                      value={formData.clinic_id}
                      onChange={(e) => setFormData({...formData, clinic_id: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-cyan-500 focus:border-cyan-500"
                      required
                    >
                      <option value="">Select Clinic</option>
                      {clinics.map(clinic => (
                        <option key={clinic.id} value={clinic.id}>{clinic.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year *</label>
                    <select
                      value={formData.year}
                      onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-cyan-500 focus:border-cyan-500"
                      required
                    >
                      {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Patients *</label>
                    <input
                      type="number"
                      value={formData.total_patients}
                      onChange={(e) => setFormData({...formData, total_patients: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-cyan-500 focus:border-cyan-500"
                      placeholder="0"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Appointments *</label>
                    <input
                      type="number"
                      value={formData.total_appointments}
                      onChange={(e) => setFormData({...formData, total_appointments: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="0"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Completed Appointments *</label>
                    <input
                      type="number"
                      value={formData.completed_appointments}
                      onChange={(e) => setFormData({...formData, completed_appointments: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="0"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cancelled Appointments *</label>
                    <input
                      type="number"
                      value={formData.cancelled_appointments}
                      onChange={(e) => setFormData({...formData, cancelled_appointments: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="0"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Doctors *</label>
                    <input
                      type="number"
                      value={formData.total_doctors}
                      onChange={(e) => setFormData({...formData, total_doctors: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="0"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Services *</label>
                    <input
                      type="number"
                      value={formData.total_services}
                      onChange={(e) => setFormData({...formData, total_services: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="0"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Revenue Estimate (Le) *</label>
                    <input
                      type="number"
                      value={formData.revenue_estimate}
                      onChange={(e) => setFormData({...formData, revenue_estimate: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="0"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700"
                  >
                    {editingRecord ? 'Update Record' : 'Create Record'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnualRecords;