import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';

const ManageClinics = () => {
  const navigate = useNavigate();
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClinic, setEditingClinic] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    district: '',
    location: '',
    phone: '',
    opening_time: '09:00 AM',
    closing_time: '05:00 PM',
    emergency_available: false,
    ambulance_available: false,
    image_url: ''
  });

  const districts = ['Freetown', 'Bo', 'Kenema', 'Makeni', 'Kailahun', 'Port Loko', 'Koidu', 'Magburaka', 'Kambia', 'Moyamba', 'Pujehun', 'Bonthe', 'Waterloo'];

  useEffect(() => {
    fetchClinics();
  }, []);

  const fetchClinics = async () => {
    try {
      setLoading(true);
      // Get all clinics without limit
      const response = await API.get('/clinics?limit=1000');
      console.log('Admin fetched clinics:', response.data);
      setClinics(response.data || []);
    } catch (error) {
      console.error('Error fetching clinics:', error);
      toast.error('Failed to load clinics');
      setClinics([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingClinic) {
        await API.put(`/clinics/${editingClinic.id}`, formData);
        toast.success('Clinic updated successfully');
      } else {
        await API.post('/clinics', formData);
        toast.success('Clinic created successfully');
      }
      fetchClinics();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving clinic:', error);
      toast.error(error.response?.data?.detail || 'Failed to save clinic');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this clinic?')) return;
    try {
      await API.delete(`/clinics/${id}`);
      toast.success('Clinic deleted successfully');
      fetchClinics();
    } catch (error) {
      console.error('Error deleting clinic:', error);
      toast.error('Failed to delete clinic');
    }
  };

  const resetForm = () => {
    setEditingClinic(null);
    setFormData({
      name: '',
      district: '',
      location: '',
      phone: '',
      opening_time: '09:00 AM',
      closing_time: '05:00 PM',
      emergency_available: false,
      ambulance_available: false,
      image_url: ''
    });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6">
      <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2">
        ← Back
      </button>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">🏥 Manage Clinics</h1>
          <p className="text-gray-600">Total Clinics: {clinics.length} | Add, edit, or remove healthcare facilities</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-cyan-600 text-white px-6 py-2 rounded-lg hover:bg-cyan-700 transition"
        >
          + Add Clinic
        </button>
      </div>

      {/* Clinics Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">District</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hours</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Emergency</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ambulance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {clinics.map((clinic) => (
                <tr key={clinic.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">#{clinic.id}</td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{clinic.name}</div>
                      {clinic.image_url && (
                        <div className="text-xs text-gray-500">Has Image</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{clinic.district}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{clinic.location}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{clinic.phone}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {clinic.opening_time} - {clinic.closing_time}
                  </td>
                  <td className="px-6 py-4 text-center">{clinic.emergency_available ? '✅' : '❌'}</td>
                  <td className="px-6 py-4 text-center">{clinic.ambulance_available ? '✅' : '❌'}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingClinic(clinic);
                          setFormData(clinic);
                          setShowModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(clinic.id)}
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
        {clinics.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No clinics found. Click "Add Clinic" to create one.
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">
                {editingClinic ? 'Edit Clinic' : 'Add New Clinic'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Clinic Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-cyan-500 focus:border-cyan-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">District *</label>
                    <select
                      value={formData.district}
                      onChange={(e) => setFormData({...formData, district: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-cyan-500 focus:border-cyan-500"
                      required
                    >
                      <option value="">Select District</option>
                      {districts.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location/Address *</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-cyan-500 focus:border-cyan-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-cyan-500 focus:border-cyan-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (Optional)</label>
                    <input
                      type="text"
                      value={formData.image_url}
                      onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-cyan-500 focus:border-cyan-500"
                      placeholder="https://example.com/clinic-image.jpg"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Opening Time</label>
                      <input
                        type="text"
                        value={formData.opening_time}
                        onChange={(e) => setFormData({...formData, opening_time: e.target.value})}
                        placeholder="09:00 AM"
                        className="w-full px-3 py-2 border rounded-lg focus:ring-cyan-500 focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Closing Time</label>
                      <input
                        type="text"
                        value={formData.closing_time}
                        onChange={(e) => setFormData({...formData, closing_time: e.target.value})}
                        placeholder="05:00 PM"
                        className="w-full px-3 py-2 border rounded-lg focus:ring-cyan-500 focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.emergency_available}
                        onChange={(e) => setFormData({...formData, emergency_available: e.target.checked})}
                        className="mr-2 w-4 h-4 text-cyan-600 focus:ring-cyan-500"
                      />
                      <span>Emergency Services Available (24/7)</span>
                    </label>

                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.ambulance_available}
                        onChange={(e) => setFormData({...formData, ambulance_available: e.target.checked})}
                        className="mr-2 w-4 h-4 text-cyan-600 focus:ring-cyan-500"
                      />
                      <span>Ambulance Service Available</span>
                    </label>
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
                    {editingClinic ? 'Update' : 'Create'}
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

export default ManageClinics;