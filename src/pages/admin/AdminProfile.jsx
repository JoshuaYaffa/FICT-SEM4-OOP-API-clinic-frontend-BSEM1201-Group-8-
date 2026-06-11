// src/pages/admin/AdminProfile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';
import ImageUpload from '../../components/ImageUpload';

const AdminProfile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
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
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (imageUrl) => {
    setFormData({ ...formData, profile_image: imageUrl });
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
    <div className="max-w-4xl mx-auto p-6">
      <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2">
        ← Back
      </button>

      <h1 className="text-3xl font-bold mb-6">👑 Admin Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600">
              <h2 className="text-xl font-semibold text-white">Administrator Information</h2>
            </div>
            
            {!editing ? (
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-4 pb-4 border-b">
                  {user.profile_image ? (
                    <img src={user.profile_image} alt={user.name} className="w-20 h-20 rounded-full object-cover" />
                  ) : (
                    <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center text-3xl">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{user.name}</p>
                    <p className="text-purple-600 capitalize font-medium">{user.role}</p>
                  </div>
                </div>
                <div className="pb-4 border-b">
                  <p className="text-sm text-gray-500">Email Address</p>
                  <p className="text-lg font-medium text-gray-900">{user.email}</p>
                </div>
                {user.phone && (
                  <div className="pb-4 border-b">
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="text-lg font-medium text-gray-900">{user.phone}</p>
                  </div>
                )}
                {user.bio && (
                  <div className="pb-4 border-b">
                    <p className="text-sm text-gray-500">Bio</p>
                    <p className="text-gray-700">{user.bio}</p>
                  </div>
                )}
                <button onClick={() => setEditing(true)} className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700">
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
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    className="w-full px-4 py-2 border rounded-lg" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    className="w-full px-4 py-2 border rounded-lg" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleChange} 
                    className="w-full px-4 py-2 border rounded-lg" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea 
                    name="bio" 
                    rows="3"
                    value={formData.bio} 
                    onChange={handleChange} 
                    className="w-full px-4 py-2 border rounded-lg" 
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setEditing(false)} className="flex-1 px-4 py-2 border rounded-lg">Cancel</button>
                  <button type="submit" disabled={loading} className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg disabled:opacity-50">
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 bg-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">🔒 Change Password</h2>
            </div>
            <form onSubmit={handleChangePassword} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input 
                  type="password" 
                  name="currentPassword" 
                  value={formData.currentPassword} 
                  onChange={handleChange} 
                  className="w-full px-4 py-2 border rounded-lg" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input 
                  type="password" 
                  name="newPassword" 
                  value={formData.newPassword} 
                  onChange={handleChange} 
                  className="w-full px-4 py-2 border rounded-lg" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input 
                  type="password" 
                  name="confirmPassword" 
                  value={formData.confirmPassword} 
                  onChange={handleChange} 
                  className="w-full px-4 py-2 border rounded-lg" 
                  required 
                />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-900 disabled:opacity-50">
                {loading ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;