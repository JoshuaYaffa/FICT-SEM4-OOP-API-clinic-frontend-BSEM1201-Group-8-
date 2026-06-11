import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';

const ManagerServices = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [clinic, setClinic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({ name: '' });

  const serviceSuggestions = [
    'General Consultation', 'Emergency Care', 'Pediatric Care', 'Maternity Services',
    'Dental Care', 'Eye Care / Ophthalmology', 'Pharmacy Services', 'Laboratory Services',
    'X-Ray / Radiology', 'Ultrasound', 'Vaccination Services', 'HIV/AIDS Counseling',
    'Malaria Testing & Treatment', 'TB Treatment', 'Nutrition Services', 'Mental Health Counseling',
    'Physiotherapy', 'Ambulance Services', 'Surgery', 'Inpatient Services'
  ];

  useEffect(() => {
    fetchClinicAndServices();
  }, []);

  const fetchClinicAndServices = async () => {
    try {
      setLoading(true);
      const clinicsRes = await API.get('/clinics?limit=1000');
      const managerClinic = clinicsRes.data.find(c => c.clinic_manager_id === user?.id);
      setClinic(managerClinic);
      
      if (managerClinic) {
        const servicesRes = await API.get('/services');
        const clinicServices = (servicesRes.data || []).filter(s => s.clinic_id === managerClinic.id);
        setServices(clinicServices);
      } else {
        toast.error('You are not assigned to any clinic');
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error(error.response?.data?.detail || 'Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Please enter a service name');
      return;
    }
    
    try {
      if (editingService) {
        await API.put(`/services/${editingService.id}`, {
          name: formData.name,
          clinic_id: clinic.id
        });
        toast.success('Service updated successfully');
      } else {
        await API.post('/services', {
          name: formData.name,
          clinic_id: clinic.id
        });
        toast.success('Service added successfully');
      }
      fetchClinicAndServices();
      setShowModal(false);
      setFormData({ name: '' });
      setEditingService(null);
    } catch (error) {
      console.error('Error saving service:', error);
      toast.error(error.response?.data?.detail || 'Failed to save service');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this service?')) return;
    try {
      await API.delete(`/services/${id}`);
      toast.success('Service removed successfully');
      fetchClinicAndServices();
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error(error.response?.data?.detail || 'Failed to remove service');
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({ name: service.name });
    setShowModal(true);
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

  return (
    <div className="p-6">
      <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2">
        ← Back
      </button>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">🔧 Clinic Services</h1>
          <p className="text-gray-600">Manage services offered at {clinic.name}</p>
          <p className="text-sm text-gray-500 mt-1">Total services: {services.length}</p>
        </div>
        <button
          onClick={() => {
            setEditingService(null);
            setFormData({ name: '' });
            setShowModal(true);
          }}
          className="bg-cyan-600 text-white px-6 py-2 rounded-lg hover:bg-cyan-700 transition"
        >
          + Add Service
        </button>
      </div>

      {/* Services Grid */}
      {services.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <div className="text-6xl mb-4">🔧</div>
          <p className="text-gray-500 text-lg">No services added yet.</p>
          <p className="text-gray-500 text-sm mt-1">Click "Add Service" to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div key={service.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition group">
              <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🔧</span>
                    <h3 className="font-semibold text-lg">{service.name}</h3>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <p className="text-gray-500 text-sm mb-3">
                  Service ID: #{service.id}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(service)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
                  >
                    Edit Service
                  </button>
                  <button
                    onClick={() => handleDelete(service.id)}
                    className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">
                {editingService ? 'Edit Service' : 'Add New Service'}
              </h2>
              
              {!editingService && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">Suggested Services:</p>
                  <div className="flex flex-wrap gap-2">
                    {serviceSuggestions.slice(0, 8).map(suggestion => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => setFormData({ name: suggestion })}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded hover:bg-cyan-100 hover:text-cyan-700 transition"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-cyan-500 focus:border-cyan-500"
                    placeholder="e.g., X-Ray, Blood Test, Consultation"
                    autoFocus
                    required
                  />
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
                    {editingService ? 'Update Service' : 'Add Service'}
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

export default ManagerServices;