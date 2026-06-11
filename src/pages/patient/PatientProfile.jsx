// src/pages/patient/PatientProfile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';
import ImageUpload from '../../components/ImageUpload';

const PatientProfile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    completedAppointments: 0,
    pendingAppointments: 0,
    reviewsCount: 0
  });
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
      fetchUserStats();
    }
  }, [user]);

  const fetchUserStats = async () => {
    try {
      const appointmentsRes = await API.get('/appointments/my');
      const appointments = appointmentsRes.data || [];
      const reviewsRes = await API.get('/reviews');
      const userReviews = (reviewsRes.data || []).filter(r => r.user_id === user?.id);
      
      setStats({
        totalAppointments: appointments.length,
        completedAppointments: appointments.filter(a => a.status === 'completed').length,
        pendingAppointments: appointments.filter(a => a.status === 'pending' || a.status === 'approved').length,
        reviewsCount: userReviews.length
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

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
      const updateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        bio: formData.bio,
        profile_image: formData.profile_image
      };
      
      await API.put('/users/me', updateData);
      toast.success('Profile updated successfully!');
      setEditing(false);
      
      // Refresh user data
      const userResponse = await API.get('/users/me');
      const updatedUser = userResponse.data;
      
      // Update localStorage and force refresh
      localStorage.setItem('user', JSON.stringify(updatedUser));
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
    if (!formData.currentPassword) {
      toast.error('Please enter your current password');
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

      <h1 className="text-3xl font-bold mb-6">👤 My Profile</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{stats.totalAppointments}</p>
          <p className="text-sm text-gray-600">Total Appointments</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{stats.completedAppointments}</p>
          <p className="text-sm text-gray-600">Completed</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">{stats.pendingAppointments}</p>
          <p className="text-sm text-gray-600">Pending</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-purple-600">{stats.reviewsCount}</p>
          <p className="text-sm text-gray-600">Reviews Written</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-cyan-600 to-blue-600">
              <h2 className="text-xl font-semibold text-white">Personal Information</h2>
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
                    <p className="text-2xl font-bold text-gray-900">{user.name}</p>
                    <p className="text-gray-500 capitalize">{user.role}</p>
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
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    className="w-full px-4 py-2 border rounded-lg focus:ring-cyan-500 focus:border-cyan-500" 
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
                    placeholder="+232 XX XXX XXX"
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
                    placeholder="Tell us about yourself..."
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setEditing(false)} className="flex-1 px-4 py-2 border rounded-lg">Cancel</button>
                  <button type="submit" disabled={loading} className="flex-1 bg-cyan-600 text-white px-4 py-2 rounded-lg disabled:opacity-50">
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Change Password Section */}
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
                  placeholder="Enter current password" 
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
                  placeholder="Enter new password (min 6 characters)" 
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
                  placeholder="Confirm new password" 
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

export default PatientProfile;