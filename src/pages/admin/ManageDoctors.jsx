import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';

const ManageDoctors = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState(null);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    qualification: '',
    experience_years: '',
    availability: 'Monday-Friday, 9AM-5PM',
    bio: '',
    photo_url: '',
    clinic_id: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const specializations = [
    'Cardiologist', 'Dermatologist', 'Pediatrician', 'Neurologist',
    'Orthopedic Surgeon', 'Gynecologist', 'Ophthalmologist', 'Psychiatrist',
    'General Physician', 'Dentist', 'ENT Specialist', 'Urologist',
    'Radiologist', 'Anesthesiologist', 'Pathologist', 'Family Medicine',
    'Internal Medicine', 'Emergency Medicine', 'Pulmonologist', 'Nephrologist'
  ];

  useEffect(() => {
    fetchData();
    fetchPendingDoctors();
  }, []);

  const fetchData = async () => {
    try {
      const [doctorsRes, clinicsRes] = await Promise.all([
        API.get('/doctors?limit=1000'),
        API.get('/clinics?limit=1000')
      ]);
      setDoctors(doctorsRes.data || []);
      setClinics(clinicsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingDoctors = async () => {
    try {
      const response = await API.get('/doctors/pending');
      setPendingDoctors(response.data || []);
    } catch (error) {
      console.error('Error fetching pending doctors:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!editingDoctor) {
      if (!formData.email || !formData.password) {
        toast.error('Email and password are required');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
      if (formData.password.length < 6) {
        toast.error('Password must be at least 6 characters');
        return;
      }
    }
    
    setLoading(true);
    try {
      if (editingDoctor) {
        // Update existing doctor
        const updateData = {
          name: formData.name,
          specialization: formData.specialization,
          qualification: formData.qualification,
          experience_years: parseInt(formData.experience_years) || 0,
          bio: formData.bio,
          photo_url: formData.photo_url,
          availability: formData.availability,
          clinic_id: parseInt(formData.clinic_id),
          email: formData.email,
          password: formData.password || 'placeholder'
        };
        
        await API.put(`/doctors/${editingDoctor.id}`, updateData);
        toast.success('Doctor updated successfully');
      } else {
        // Create new doctor
        const createData = {
          name: formData.name,
          specialization: formData.specialization,
          qualification: formData.qualification,
          experience_years: parseInt(formData.experience_years) || 0,
          bio: formData.bio,
          photo_url: formData.photo_url,
          availability: formData.availability,
          clinic_id: parseInt(formData.clinic_id),
          email: formData.email,
          password: formData.password
        };
        
        await API.post('/doctors', createData);
        toast.success('Doctor added successfully. They will be able to login once approved.');
      }
      
      fetchData();
      fetchPendingDoctors();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving doctor:', error);
      toast.error(error.response?.data?.detail || 'Failed to save doctor');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!doctorToDelete) return;
    
    setLoading(true);
    try {
      await API.delete(`/doctors/${doctorToDelete.id}`);
      toast.success('Doctor deleted successfully');
      fetchData();
      fetchPendingDoctors();
      setShowDeleteConfirm(false);
      setDoctorToDelete(null);
    } catch (error) {
      console.error('Error deleting doctor:', error);
      toast.error(error.response?.data?.detail || 'Failed to delete doctor');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (doctorId) => {
    try {
      await API.put(`/doctors/${doctorId}/approve`);
      toast.success('Doctor approved successfully! They can now login.');
      fetchData();
      fetchPendingDoctors();
    } catch (error) {
      console.error('Error approving doctor:', error);
      toast.error('Failed to approve doctor');
    }
  };

  const handleReject = async (doctorId) => {
    if (!window.confirm('Are you sure you want to reject this doctor application?')) return;
    try {
      await API.delete(`/doctors/${doctorId}/reject`);
      toast.success('Doctor application rejected');
      fetchPendingDoctors();
    } catch (error) {
      console.error('Error rejecting doctor:', error);
      toast.error('Failed to reject doctor');
    }
  };

  const handleEdit = (doctor) => {
    setEditingDoctor(doctor);
    setFormData({
      name: doctor.name || '',
      specialization: doctor.specialization || '',
      qualification: doctor.qualification || '',
      experience_years: doctor.experience_years || '',
      availability: doctor.availability || 'Monday-Friday, 9AM-5PM',
      bio: doctor.bio || '',
      photo_url: doctor.photo_url || '',
      clinic_id: doctor.clinic_id || '',
      email: doctor.email || '',
      password: '',
      confirmPassword: ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingDoctor(null);
    setFormData({
      name: '',
      specialization: '',
      qualification: '',
      experience_years: '',
      availability: 'Monday-Friday, 9AM-5PM',
      bio: '',
      photo_url: '',
      clinic_id: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  };

  const getClinicName = (id) => {
    const clinic = clinics.find(c => c.id === id);
    return clinic ? clinic.name : 'N/A';
  };

  const pendingCount = pendingDoctors.length;

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6">
      <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2">
        ← Back
      </button>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">👨‍⚕️ Manage Doctors</h1>
          <p className="text-gray-600">Add, edit, or remove doctors from the system</p>
          <p className="text-sm text-gray-500 mt-1">Total doctors: {doctors.length}</p>
        </div>
        <div className="flex gap-3">
          {pendingCount > 0 && (
            <button
              onClick={() => setShowPendingModal(true)}
              className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition relative"
            >
              Pending Approvals
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {pendingCount}
              </span>
            </button>
          )}
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
      </div>

      {/* Doctors Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Specialization</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clinic</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Experience</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {doctors.map((doctor) => (
                <tr key={doctor.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">#{doctor.id}</td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">Dr. {doctor.name}</div>
                      {doctor.qualification && (
                        <div className="text-xs text-gray-500">{doctor.qualification}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {doctor.specialization}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{doctor.email || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{getClinicName(doctor.clinic_id)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{doctor.experience_years || 0}+ years</td>
                  <td className="px-6 py-4">
                    {doctor.is_approved ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">✅ Approved</span>
                    ) : (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">⏳ Pending</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(doctor)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setDoctorToDelete(doctor);
                          setShowDeleteConfirm(true);
                        }}
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
        {doctors.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No doctors found. Click "Add Doctor" to create one.
          </div>
        )}
      </div>

      {/* Pending Approvals Modal */}
      {showPendingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">⏳ Pending Approvals</h2>
                <button onClick={() => setShowPendingModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl">
                  ✕
                </button>
              </div>
              <p className="text-gray-600 mb-4">Review and approve doctor applications</p>
              
              {pendingDoctors.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No pending approvals</p>
              ) : (
                <div className="space-y-4">
                  {pendingDoctors.map((doctor) => (
                    <div key={doctor.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">Dr. {doctor.name}</h3>
                          <p className="text-cyan-600">{doctor.specialization}</p>
                          <p className="text-sm text-gray-500 mt-1">{doctor.qualification}</p>
                          <p className="text-sm text-gray-500">{doctor.experience_years}+ years experience</p>
                          <p className="text-sm text-gray-500">Email: {doctor.email}</p>
                          <p className="text-sm text-gray-500">Clinic: {getClinicName(doctor.clinic_id)}</p>
                          {doctor.bio && <p className="text-sm text-gray-600 mt-2">{doctor.bio.substring(0, 100)}...</p>}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              handleApprove(doctor.id);
                              setShowPendingModal(false);
                            }}
                            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              handleReject(doctor.id);
                              setShowPendingModal(false);
                            }}
                            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Doctor Modal */}
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
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    >
                      <option value="">Select Specialization</option>
                      {specializations.map(spec => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Clinic *</label>
                    <select
                      value={formData.clinic_id}
                      onChange={(e) => setFormData({...formData, clinic_id: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    >
                      <option value="">Select Clinic</option>
                      {clinics.map(clinic => (
                        <option key={clinic.id} value={clinic.id}>{clinic.name} ({clinic.district})</option>
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
                      placeholder="MBBS, MD, PhD"
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

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Photo URL</label>
                    <input
                      type="text"
                      value={formData.photo_url}
                      onChange={(e) => setFormData({...formData, photo_url: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="https://example.com/doctor-photo.jpg"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                    <input
                      type="text"
                      value={formData.availability}
                      onChange={(e) => setFormData({...formData, availability: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="Monday-Friday, 9AM-5PM"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    <textarea
                      rows="3"
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="Brief introduction about the doctor..."
                    />
                  </div>

                  {/* Email and Password Fields */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email {!editingDoctor && '*'}
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="doctor@example.com"
                      required={!editingDoctor}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password {!editingDoctor && '*'}
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder={editingDoctor ? "Leave blank to keep current password" : "Enter password"}
                    />
                    {editingDoctor && (
                      <p className="text-xs text-gray-500 mt-1">Leave blank to keep current password</p>
                    )}
                  </div>

                  {(!editingDoctor || formData.password) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
                      <input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="Confirm password"
                      />
                    </div>
                  )}
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
                    disabled={loading}
                    className="flex-1 bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : (editingDoctor ? 'Update Doctor' : 'Create Doctor')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && doctorToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="text-center">
                <div className="text-6xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold mb-2">Confirm Delete</h2>
                <p className="text-gray-600 mb-4">
                  Are you sure you want to delete Dr. {doctorToDelete.name}?
                </p>
                <p className="text-red-600 text-sm mb-6">
                  This action cannot be undone. The doctor's account will be permanently deleted.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={loading}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {loading ? 'Deleting...' : 'Delete Doctor'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageDoctors;