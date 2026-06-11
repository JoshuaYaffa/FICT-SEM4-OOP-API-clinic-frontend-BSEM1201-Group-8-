import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';

const ManagerSettings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [clinic, setClinic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: '',
    opening_time: '',
    closing_time: '',
    emergency_available: false,
    ambulance_available: false
  });

  useEffect(() => {
    fetchClinicSettings();
  }, []);

  const fetchClinicSettings = async () => {
    try {
      setLoading(true);
      const clinicsRes = await API.get('/clinics?limit=1000');
      const managerClinic = clinicsRes.data.find(c => c.clinic_manager_id === user?.id);
      
      if (managerClinic) {
        setClinic(managerClinic);
        setFormData({
          name: managerClinic.name || '',
          phone: managerClinic.phone || '',
          location: managerClinic.location || '',
          opening_time: managerClinic.opening_time || '08:00 AM',
          closing_time: managerClinic.closing_time || '06:00 PM',
          emergency_available: managerClinic.emergency_available || false,
          ambulance_available: managerClinic.ambulance_available || false
        });
      } else {
        toast.error('You are not assigned to any clinic');
      }
    } catch (error) {
      console.error('Error fetching clinic:', error);
      toast.error('Failed to load clinic settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/clinics/${clinic.id}`, formData);
      toast.success('Clinic settings updated successfully');
      setEditing(false);
      fetchClinicSettings();
    } catch (error) {
      console.error('Error updating clinic:', error);
      toast.error(error.response?.data?.detail || 'Failed to update clinic');
    }
  };

  if (loading) return <LoadingSpinner />;

  if (!clinic) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">You are not assigned to any clinic.</p>
        <button 
          onClick={() => navigate('/manager/dashboard')}
          className="mt-4 text-cyan-600 hover:underline"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2">
        ← Back
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">⚙️ Clinic Settings</h1>
        <p className="text-gray-600">Manage your clinic information</p>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-6 text-white">
          <h2 className="text-2xl font-bold">{clinic.name}</h2>
          <p className="text-cyan-100">{clinic.district} District</p>
        </div>

        <div className="p-6">
          {!editing ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Clinic Name</h3>
                  <p className="mt-1 text-gray-900">{clinic.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Phone Number</h3>
                  <p className="mt-1 text-gray-900">{clinic.phone}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Location</h3>
                  <p className="mt-1 text-gray-900">{clinic.location}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">District</h3>
                  <p className="mt-1 text-gray-900">{clinic.district}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Opening Hours</h3>
                  <p className="mt-1 text-gray-900">{clinic.opening_time} - {clinic.closing_time}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Services</h3>
                  <p className="mt-1 text-gray-900">
                    {clinic.emergency_available && '🚨 Emergency | '}
                    {clinic.ambulance_available && '🚑 Ambulance'}
                    {!clinic.emergency_available && !clinic.ambulance_available && 'Standard Services'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditing(true)}
                className="bg-cyan-600 text-white px-6 py-2 rounded-lg hover:bg-cyan-700"
              >
                Edit Clinic Settings
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Clinic Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Opening Time</label>
                  <input
                    type="text"
                    value={formData.opening_time}
                    onChange={(e) => setFormData({...formData, opening_time: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="08:00 AM"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Closing Time</label>
                  <input
                    type="text"
                    value={formData.closing_time}
                    onChange={(e) => setFormData({...formData, closing_time: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="06:00 PM"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.emergency_available}
                    onChange={(e) => setFormData({...formData, emergency_available: e.target.checked})}
                    className="mr-2"
                  />
                  <span>Emergency Services Available</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.ambulance_available}
                    onChange={(e) => setFormData({...formData, ambulance_available: e.target.checked})}
                    className="mr-2"
                  />
                  <span>Ambulance Service Available</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerSettings;