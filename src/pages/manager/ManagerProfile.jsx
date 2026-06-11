// src/pages/manager/ManagerProfile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';
import ImageUpload from '../../components/ImageUpload';

const ManagerProfile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [clinic, setClinic] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editingClinic, setEditingClinic] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    profile_image: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [clinicFormData, setClinicFormData] = useState({
    name: '',
    phone: '',
    location: '',
    opening_time: '',
    closing_time: '',
    emergency_available: false,
    ambulance_available: false,
    image_url: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        profile_image: user.profile_image || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      fetchManagerClinic();
    }
  }, [user]);

  const fetchManagerClinic = async () => {
    try {
      const clinicsRes = await API.get('/clinics?limit=1000');
      const managerClinic = clinicsRes.data.find(c => c.clinic_manager_id === user?.id);
      if (managerClinic) {
        setClinic(managerClinic);
        setClinicFormData({
          name: managerClinic.name || '',
          phone: managerClinic.phone || '',
          location: managerClinic.location || '',
          opening_time: managerClinic.opening_time || '08:00 AM',
          closing_time: managerClinic.closing_time || '06:00 PM',
          emergency_available: managerClinic.emergency_available || false,
          ambulance_available: managerClinic.ambulance_available || false,
          image_url: managerClinic.image_url || ''
        });
      }
    } catch (error) {
      console.error('Error fetching clinic:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleClinicChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setClinicFormData({ ...clinicFormData, [e.target.name]: value });
  };

  const handleImageUpload = (imageUrl) => {
    setFormData({ ...formData, profile_image: imageUrl });
  };

  const handleClinicImageUpload = (imageUrl) => {
    setClinicFormData({ ...clinicFormData, image_url: imageUrl });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.put('/users/me', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        bio: formData.bio,
        profile_image: formData.profile_image
      });
      toast.success('Profile updated successfully!');
      setEditing(false);
      window.location.reload();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.detail || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateClinic = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.put(`/clinics/${clinic.id}`, clinicFormData);
      toast.success('Clinic information updated successfully!');
      setEditingClinic(false);
      fetchManagerClinic();
    } catch (error) {
      console.error('Error updating clinic:', error);
      toast.error(error.response?.data?.detail || 'Failed to update clinic');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (formData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    try {
      await API.put('/users/me', {
        current_password: formData.currentPassword,
        new_password: formData.newPassword
      });
      toast.success('Password changed successfully! Please login again.');
      setTimeout(() => logout(), 2000);
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error.response?.data?.detail || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <LoadingSpinner />;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2">
        ← Back
      </button>

      <h1 className="text-3xl font-bold mb-6">📋 Manager Profile & Clinic Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Profile Section */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-cyan-600 to-blue-600">
            <h2 className="text-xl font-semibold text-white">👤 Personal Information</h2>
          </div>
          
          {!editing ? (
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b">
                {user.profile_image ? (
                  <img src={user.profile_image} alt={user.name} className="w-20 h-20 rounded-full object-cover" />
                ) : (
                  <div className="w-20 h-20 bg-cyan-100 rounded-full flex items-center justify-center text-3xl">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-xl font-bold text-gray-900">{user.name}</p>
                  <p className="text-cyan-600 capitalize font-medium">{user.role}</p>
                </div>
              </div>
              <div className="pb-4 border-b">
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-gray-900">{user.email}</p>
              </div>
              {user.phone && (
                <div className="pb-4 border-b">
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="text-gray-900">{user.phone}</p>
                </div>
              )}
              {user.bio && (
                <div className="pb-4 border-b">
                  <p className="text-sm text-gray-500">Bio</p>
                  <p className="text-gray-700">{user.bio}</p>
                </div>
              )}
              <button onClick={() => setEditing(true)} className="bg-cyan-600 text-white px-6 py-2 rounded-lg hover:bg-cyan-700">
                Edit Profile
              </button>
            </div>
          ) : (
            <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
              <ImageUpload 
                currentImage={formData.profile_image}
                onImageUpload={handleImageUpload}
                label="Profile Picture"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea name="bio" rows="3" value={formData.bio} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setEditing(false)} className="flex-1 px-4 py-2 border rounded-lg">Cancel</button>
                <button type="submit" disabled={loading} className="flex-1 bg-cyan-600 text-white px-4 py-2 rounded-lg disabled:opacity-50">
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Change Password Section */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">🔒 Change Password</h2>
          </div>
          <form onSubmit={handleChangePassword} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <input type="password" name="currentPassword" value={formData.currentPassword} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-900 disabled:opacity-50">
              {loading ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>

      {/* Clinic Management Section */}
      {clinic && (
        <div className="mt-6 bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600">
            <h2 className="text-xl font-semibold text-white">🏥 Clinic Information</h2>
            <p className="text-green-100 text-sm">Manage your assigned clinic details</p>
          </div>
          
          {!editingClinic ? (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  {clinic.image_url && (
                    <img src={clinic.image_url} alt={clinic.name} className="w-full h-48 object-cover rounded-lg mb-4" />
                  )}
                  <p className="text-sm text-gray-500">Clinic Name</p>
                  <p className="text-lg font-medium text-gray-900">{clinic.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="text-lg font-medium text-gray-900">{clinic.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="text-lg font-medium text-gray-900">{clinic.location}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">District</p>
                  <p className="text-lg font-medium text-gray-900">{clinic.district}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Hours</p>
                  <p className="text-lg font-medium text-gray-900">{clinic.opening_time} - {clinic.closing_time}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Services</p>
                  <p className="text-lg font-medium text-gray-900">
                    {clinic.emergency_available && '🚨 Emergency | '}
                    {clinic.ambulance_available && '🚑 Ambulance'}
                    {!clinic.emergency_available && !clinic.ambulance_available && 'Standard Services'}
                  </p>
                </div>
              </div>
              <button onClick={() => setEditingClinic(true)} className="mt-6 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
                Edit Clinic Information
              </button>
            </div>
          ) : (
            <form onSubmit={handleUpdateClinic} className="p-6 space-y-4">
              <ImageUpload 
                currentImage={clinicFormData.image_url}
                onImageUpload={handleClinicImageUpload}
                label="Clinic Image"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Clinic Name</label>
                <input type="text" name="name" value={clinicFormData.name} onChange={handleClinicChange} className="w-full px-4 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input type="tel" name="phone" value={clinicFormData.phone} onChange={handleClinicChange} className="w-full px-4 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input type="text" name="location" value={clinicFormData.location} onChange={handleClinicChange} className="w-full px-4 py-2 border rounded-lg" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Opening Time</label>
                  <input type="text" name="opening_time" value={clinicFormData.opening_time} onChange={handleClinicChange} className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Closing Time</label>
                  <input type="text" name="closing_time" value={clinicFormData.closing_time} onChange={handleClinicChange} className="w-full px-4 py-2 border rounded-lg" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" name="emergency_available" checked={clinicFormData.emergency_available} onChange={handleClinicChange} className="mr-2" />
                  <span>Emergency Services Available</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" name="ambulance_available" checked={clinicFormData.ambulance_available} onChange={handleClinicChange} className="mr-2" />
                  <span>Ambulance Service Available</span>
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setEditingClinic(false)} className="flex-1 px-4 py-2 border rounded-lg">Cancel</button>
                <button type="submit" disabled={loading} className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg disabled:opacity-50">
                  {loading ? 'Saving...' : 'Save Clinic Changes'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default ManagerProfile;