import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';
import ImageUpload from '../../components/ImageUpload';

const DoctorProfile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    qualification: '',
    experience_years: '',
    bio: '',
    availability: '',
    photo_url: '',
    phone: '',
    email: ''
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  useEffect(() => {
    fetchDoctorProfile();
  }, []);

  const fetchDoctorProfile = async () => {
    try {
      setLoading(true);
      
      // First, get all doctors
      const doctorsRes = await API.get('/doctors?limit=1000');
      console.log('All doctors:', doctorsRes.data);
      console.log('Current user:', user);
      
      // Find doctor where user_id matches current user's id
      const doctorData = doctorsRes.data.find(d => d.user_id === user?.id);
      
      if (doctorData) {
        console.log('Found doctor:', doctorData);
        setDoctor(doctorData);
        setFormData({
          name: doctorData.name || '',
          specialization: doctorData.specialization || '',
          qualification: doctorData.qualification || '',
          experience_years: doctorData.experience_years || '',
          bio: doctorData.bio || '',
          availability: doctorData.availability || 'Monday-Friday, 9AM-5PM',
          photo_url: doctorData.photo_url || '',
          phone: user?.phone || '',
          email: user?.email || ''
        });
      } else {
        console.error('No doctor profile found for user:', user);
        toast.error('Doctor profile not found. Please contact administrator.');
      }
    } catch (error) {
      console.error('Error fetching doctor profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (imageUrl) => {
    setFormData({ ...formData, photo_url: imageUrl });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // First update user profile info via users/me endpoint
      await API.put('/users/me', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        bio: formData.bio,
        profile_image: formData.photo_url
      });
      
      // Update doctor profile using the doctor's ID
      if (doctor && doctor.id) {
        console.log('Updating doctor with ID:', doctor.id);
        await API.put(`/doctors/${doctor.id}`, {
          name: formData.name,
          specialization: formData.specialization,
          qualification: formData.qualification,
          experience_years: parseInt(formData.experience_years) || 0,
          bio: formData.bio,
          availability: formData.availability,
          photo_url: formData.photo_url,
          clinic_id: doctor.clinic_id,
          email: formData.email,
          password: 'dummy_password' // This won't be updated as it's excluded in backend
        });
      } else {
        console.error('No doctor ID found');
        toast.error('Doctor profile ID not found');
        setLoading(false);
        return;
      }
      
      toast.success('Profile updated successfully');
      setEditing(false);
      fetchDoctorProfile(); // Refresh data
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.detail || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordData.new_password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (!passwordData.current_password) {
      toast.error('Please enter your current password');
      return;
    }
    
    setLoading(true);
    try {
      await API.put('/users/me', {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
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

  if (loading) return <LoadingSpinner />;

  if (!doctor) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="bg-yellow-50 border border-yellow-400 rounded-lg p-6">
          <h2 className="text-xl font-bold text-yellow-800 mb-2">⚠️ Doctor Profile Not Found</h2>
          <p className="text-yellow-700">Your doctor profile could not be found in the system.</p>
          <p className="text-yellow-600 text-sm mt-2">Please contact the administrator to set up your doctor profile.</p>
          <button 
            onClick={() => navigate('/doctor/dashboard')}
            className="mt-4 bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2">
        ← Back
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">👨‍⚕️ Doctor Profile</h1>
        <p className="text-gray-600">View and manage your professional information</p>
        {doctor && <p className="text-sm text-gray-500 mt-1">Doctor ID: {doctor.id}</p>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-6 text-white">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  {formData.photo_url ? (
                    <img src={formData.photo_url} alt={formData.name} className="w-24 h-24 rounded-full object-cover border-4 border-white" />
                  ) : (
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-cyan-600 text-4xl">
                      👨‍⚕️
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{formData.name || 'Dr. Name'}</h2>
                  <p className="text-cyan-100">{formData.specialization || 'Specialization'}</p>
                  <p className="text-cyan-100 text-sm">{formData.experience_years}+ years experience</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {!editing ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Specialization</h3>
                      <p className="mt-1 text-gray-900">{doctor?.specialization || 'Not specified'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Qualification</h3>
                      <p className="mt-1 text-gray-900">{doctor?.qualification || 'Not specified'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Experience</h3>
                      <p className="mt-1 text-gray-900">{doctor?.experience_years || 0} years</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Availability</h3>
                      <p className="mt-1 text-gray-900">{doctor?.availability || 'Weekdays 9AM-5PM'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                      <p className="mt-1 text-gray-900">{user?.phone || 'Not specified'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Email</h3>
                      <p className="mt-1 text-gray-900">{user?.email}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Bio / About</h3>
                    <p className="mt-1 text-gray-900">{doctor?.bio || 'No bio added yet.'}</p>
                  </div>
                  <button
                    onClick={() => setEditing(true)}
                    className="bg-cyan-600 text-white px-6 py-2 rounded-lg hover:bg-cyan-700 transition"
                  >
                    Edit Profile
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <ImageUpload 
                    currentImage={formData.photo_url}
                    onImageUpload={handleImageUpload}
                    label="Profile Photo"
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-cyan-500 focus:border-cyan-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                      <input
                        type="text"
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-lg"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                      <input
                        type="text"
                        name="qualification"
                        value={formData.qualification}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="MBBS, MD, etc."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                      <input
                        type="number"
                        name="experience_years"
                        value={formData.experience_years}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-lg"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                      <input
                        type="text"
                        name="availability"
                        value={formData.availability}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="Monday-Friday, 9AM-5PM"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bio / About</label>
                      <textarea
                        rows="4"
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="Tell patients about yourself, your experience, and approach to care..."
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Change Password Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 bg-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">🔒 Change Password</h2>
            </div>
            <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input
                  type="password"
                  name="current_password"
                  value={passwordData.current_password}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  name="new_password"
                  value={passwordData.new_password}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  name="confirm_password"
                  value={passwordData.confirm_password}
                  onChange={handlePasswordChange}
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

export default DoctorProfile;