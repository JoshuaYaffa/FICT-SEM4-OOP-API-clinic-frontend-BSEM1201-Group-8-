import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';

const ManageServices = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    clinic_id: ''
  });
  const [selectedClinic, setSelectedClinic] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [servicesRes, clinicsRes] = await Promise.all([
        API.get('/services'),
        API.get('/clinics')
      ]);
      setServices(servicesRes.data);
      setClinics(clinicsRes.data);
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
      if (editingService) {
        await API.put(`/services/${editingService.id}`, formData);
        toast.success('Service updated successfully');
      } else {
        await API.post('/services', formData);
        toast.success('Service added successfully');
      }
      fetchData();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving service:', error);
      toast.error('Failed to save service');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      await API.delete(`/services/${id}`);
      toast.success('Service deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Failed to delete service');
    }
  };

  const resetForm = () => {
    setEditingService(null);
    setFormData({
      name: '',
      clinic_id: ''
    });
  };

  const getClinicName = (id) => {
    const clinic = clinics.find(c => c.id === id);
    return clinic ? clinic.name : `Clinic #${id}`;
  };

  const filteredServices = selectedClinic === 'all' 
    ? services 
    : services.filter(s => s.clinic_id === parseInt(selectedClinic));

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6">
      <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2">
        ← Back
      </button>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">🔧 Manage Services</h1>
          <p className="text-gray-600">Manage medical services offered by clinics</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-cyan-600 text-white px-6 py-2 rounded-lg hover:bg-cyan-700 transition"
        >
          + Add Service
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center gap-4">
          <label className="font-medium text-gray-700">Filter by Clinic:</label>
          <select
            value={selectedClinic}
            onChange={(e) => setSelectedClinic(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-cyan-500 focus:border-cyan-500"
          >
            <option value="all">All Clinics</option>
            {clinics.map(clinic => (
              <option key={clinic.id} value={clinic.id}>{clinic.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => (
          <div key={service.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🔧</span>
                  <h3 className="font-semibold text-lg">{service.name}</h3>
                </div>
              </div>
            </div>
            <div className="p-4">
              <p className="text-gray-600">
                <span className="font-medium">Clinic:</span> {getClinicName(service.clinic_id)}
              </p>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => {
                    setEditingService(service);
                    setFormData(service);
                    setShowModal(true);
                  }}
                  className="flex-1 px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(service.id)}
                  className="flex-1 px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredServices.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">No services found for the selected clinic.</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">
                {editingService ? 'Edit Service' : 'Add New Service'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="e.g., X-Ray, Blood Test, Consultation"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Clinic</label>
                  <select
                    value={formData.clinic_id}
                    onChange={(e) => setFormData({...formData, clinic_id: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  >
                    <option value="">Select Clinic</option>
                    {clinics.map(clinic => (
                      <option key={clinic.id} value={clinic.id}>{clinic.name}</option>
                    ))}
                  </select>
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
                    {editingService ? 'Update' : 'Add'}
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

export default ManageServices;