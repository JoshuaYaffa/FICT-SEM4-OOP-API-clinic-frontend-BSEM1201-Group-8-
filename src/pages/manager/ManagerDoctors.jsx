import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';

const ManagerDoctors = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [clinic, setClinic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    qualification: '',
    experience_years: '',
    availability: '',
    bio: '',
    photo_url: '',
    email: '',
    password: ''
  });

  const specializations = [
    'Cardiologist', 'Dermatologist', 'Pediatrician', 'Neurologist',
    'Orthopedic Surgeon', 'Gynecologist', 'Ophthalmologist', 'Psychiatrist',
    'General Physician', 'Dentist', 'ENT Specialist', 'Urologist',
    'Radiologist', 'Anesthesiologist', 'Family Medicine', 'Internal Medicine'
  ];

  useEffect(() => {
    fetchClinicAndDoctors();
  }, []);

  const fetchClinicAndDoctors = async () => {
    try {
      setLoading(true);
      const clinicsRes = await API.get('/clinics?limit=1000');
      const managerClinic = clinicsRes.data.find(c => c.clinic_manager_id === user?.id);
      setClinic(managerClinic);
      
      if (managerClinic) {
        const doctorsRes = await API.get(`/doctors/clinic/${managerClinic.id}?limit=1000`);
        setDoctors(doctorsRes.data || []);
      } else {
        toast.error('You are not assigned to any clinic');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error(error.response?.data?.detail || 'Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!editingDoctor && (!formData.email || !formData.password)) {
      toast.error('Email and password are required for new doctors');
      return;
    }
    
    try {
      if (editingDoctor) {
        await API.put(`/doctors/${editingDoctor.id}`, { 
          ...formData, 
          clinic_id: clinic.id 
        });
        toast.success('Doctor updated successfully');
      } else {
        await API.post('/doctors', { 
          ...formData, 
          clinic_id: clinic.id 
        });
        toast.success('Doctor added successfully. Waiting for admin approval.');
      }
      fetchClinicAndDoctors();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving doctor:', error);
      toast.error(error.response?.data?.detail || 'Failed to save doctor');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this doctor?')) return;
    try {
      await API.delete(`/doctors/${id}`);
      toast.success('Doctor removed successfully');
      fetchClinicAndDoctors();
    } catch (error) {
      console.error('Error deleting doctor:', error);
      toast.error(error.response?.data?.detail || 'Failed to remove doctor');
    }
  };

  const resetForm = () => {
    setEditingDoctor(null);
    setFormData({
      name: '',
      specialization: '',
      qualification: '',
      experience_years: '',
      availability: '',
      bio: '',
      photo_url: '',
      email: '',
      password: ''
    });
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
          <h1 className="text-3xl font-bold mb-2">👨‍⚕️ Manage Doctors</h1>
          <p className="text-gray-600">Managing doctors at {clinic.name}</p>
          <p className="text-sm text-gray-500 mt-1">Total doctors: {doctors.length}</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-cyan-600 text-white px-6 py-2 rounded-lg hover:bg-cyan-700 transition"
        >
          + Add Doctor
        </button>
      </div>

      {/* Doctors Grid */}
      {doctors.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <div className="text-6xl mb-4">👨‍⚕️</div>
          <p className="text-gray-500 text-lg">No doctors added yet.</p>
          <p className="text-gray-500 text-sm mt-1">Click "Add Doctor" to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <div key={doctor.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
              <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-4 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl">
                    {doctor.photo_url ? (
                      <img src={doctor.photo_url} alt={doctor.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      '👨‍⚕️'
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold">Dr. {doctor.name}</h3>
                    <p className="text-cyan-100 text-sm">{doctor.specialization}</p>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-2 text-sm">
                  {doctor.qualification && (
                    <p><span className="font-medium">Qualification:</span> {doctor.qualification}</p>
                  )}
                  <p><span className="font-medium">Experience:</span> {doctor.experience_years || 0}+ years</p>
                  <p><span className="font-medium">Availability:</span> {doctor.availability || 'Weekdays'}</p>
                  {doctor.bio && (
                    <p className="text-gray-600 text-xs mt-2">{doctor.bio.substring(0, 80)}...</p>
                  )}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    doctor.is_approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {doctor.is_approved ? '✅ Approved' : '⏳ Pending Approval'}
                  </span>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => {
                      setEditingDoctor(doctor);
                      setFormData({
                        name: doctor.name,
                        specialization: doctor.specialization,
                        qualification: doctor.qualification || '',
                        experience_years: doctor.experience_years,
                        availability: doctor.availability,
                        bio: doctor.bio || '',
                        photo_url: doctor.photo_url || '',
                        email: '',
                        password: ''
                      });
                      setShowModal(true);
                    }}
                    className="flex-1 px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(doctor.id)}
                    className="flex-1 px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
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
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">
                {editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}
              </h2>
              
              {!editingDoctor && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    ℹ️ When adding a doctor, an account will be created for them with the email and password you provide.
                    They will need to be approved by an admin before they can login.
                  </p>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Doctor Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-cyan-500 focus:border-cyan-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Specialization *</label>
                    <select
                      value={formData.specialization}
                      onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-cyan-500 focus:border-cyan-500"
                      required
                    >
                      <option value="">Select Specialization</option>
                      {specializations.map(spec => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                    <input
                      type="text"
                      value={formData.qualification}
                      onChange={(e) => setFormData({...formData, qualification: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="MBBS, MD"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                    <input
                      type="number"
                      value={formData.experience_years}
                      onChange={(e) => setFormData({...formData, experience_years: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Photo URL</label>
                    <input
                      type="text"
                      value={formData.photo_url}
                      onChange={(e) => setFormData({...formData, photo_url: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="https://example.com/doctor-photo.jpg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                    <input
                      type="text"
                      value={formData.availability}
                      onChange={(e) => setFormData({...formData, availability: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="Monday-Friday, 9AM-5PM"
                    />
                  </div>

                  {/* Email and Password - only for new doctors */}
                  {!editingDoctor && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email (for login) *</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full px-3 py-2 border rounded-lg"
                          placeholder="doctor@example.com"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password (for login) *</label>
                        <input
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                          className="w-full px-3 py-2 border rounded-lg"
                          placeholder="••••••••"
                          required
                        />
                      </div>
                    </>
                  )}

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio / About</label>
                    <textarea
                      rows="3"
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="Brief introduction about the doctor..."
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
                    {editingDoctor ? 'Update Doctor' : 'Add Doctor'}
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

export default ManagerDoctors;