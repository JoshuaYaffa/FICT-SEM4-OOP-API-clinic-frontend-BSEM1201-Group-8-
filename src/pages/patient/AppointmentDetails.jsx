import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

const AppointmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [clinic, setClinic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (id) {
      fetchAppointmentDetails();
    }
  }, [id]);

  const fetchAppointmentDetails = async () => {
    try {
      // Get all appointments for the logged-in patient
      const response = await API.get('/appointments/my');
      const apt = response.data.find(a => a.id === parseInt(id));
      
      if (!apt) {
        toast.error('Appointment not found');
        navigate('/patient/appointments');
        return;
      }
      
      setAppointment(apt);
      
      // Fetch doctor and clinic details
      const [doctorRes, clinicRes] = await Promise.all([
        API.get(`/doctors/${apt.doctor_id}`),
        API.get(`/clinics/${apt.clinic_id}`)
      ]);
      setDoctor(doctorRes.data);
      setClinic(clinicRes.data);
      
    } catch (error) {
      console.error('Error fetching appointment:', error);
      toast.error('Failed to load appointment details');
      navigate('/patient/appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    
    setCancelling(true);
    try {
      await API.put(`/appointments/${id}/cancel`);
      toast.success('Appointment cancelled successfully');
      fetchAppointmentDetails();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast.error(error.response?.data?.detail || 'Failed to cancel appointment');
    } finally {
      setCancelling(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: '⏳', text: 'Pending Confirmation' },
      approved: { color: 'bg-green-100 text-green-800', icon: '✅', text: 'Approved' },
      completed: { color: 'bg-blue-100 text-blue-800', icon: '✔️', text: 'Completed' },
      cancelled: { color: 'bg-red-100 text-red-800', icon: '❌', text: 'Cancelled' }
    };
    return configs[status] || configs.pending;
  };

  if (loading) return <LoadingSpinner />;

  if (!appointment) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Appointment not found.</p>
        <button onClick={() => navigate('/patient/appointments')} className="mt-4 text-cyan-600 hover:underline">
          ← Back to Appointments
        </button>
      </div>
    );
  }

  const statusConfig = getStatusConfig(appointment.status);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2">
        ← Back
      </button>

      {/* Status Header */}
      <div className={`${statusConfig.color} rounded-lg p-4 mb-8 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{statusConfig.icon}</span>
          <div>
            <p className="font-semibold">Appointment #{appointment.id}</p>
            <p className="text-sm">{statusConfig.text}</p>
          </div>
        </div>
        {(appointment.status === 'pending' || appointment.status === 'approved') && (
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm disabled:opacity-50"
          >
            {cancelling ? 'Cancelling...' : 'Cancel Appointment'}
          </button>
        )}
      </div>

      {/* Appointment Details */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="bg-gray-50 px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">📅 Appointment Details</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Appointment Date</p>
              <p className="font-medium text-gray-900">
                {new Date(appointment.appointment_date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Appointment Time</p>
              <p className="font-medium text-gray-900">{appointment.appointment_time || 'Time TBD'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                {appointment.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Doctor Information */}
      {doctor && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="bg-gray-50 px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">👨‍⚕️ Doctor Information</h2>
          </div>
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center text-2xl">
                {doctor.photo_url ? (
                  <img src={doctor.photo_url} alt={doctor.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  '👨‍⚕️'
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Dr. {doctor.name}</h3>
                <p className="text-cyan-600">{doctor.specialization}</p>
                <p className="text-sm text-gray-500 mt-1">{doctor.experience_years}+ years experience</p>
                <Link to={`/patient/doctor/${doctor.id}`} className="inline-block mt-3 text-cyan-600 hover:text-cyan-800 text-sm">
                  View Full Profile →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clinic Information */}
      {clinic && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="bg-gray-50 px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">🏥 Clinic Information</h2>
          </div>
          <div className="p-6">
            <div className="space-y-2">
              <p><span className="font-medium">Clinic Name:</span> {clinic.name}</p>
              <p><span className="font-medium">Location:</span> {clinic.district}, {clinic.location}</p>
              <p><span className="font-medium">Phone:</span> {clinic.phone}</p>
              <p><span className="font-medium">Hours:</span> {clinic.opening_time} - {clinic.closing_time}</p>
              {clinic.emergency_available && (
                <p className="text-red-600 mt-2">🚨 Emergency Services Available</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Preparation Tips */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-3">📋 Preparation Tips</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">✓ Arrive 15 minutes before your scheduled time</li>
          <li className="flex items-start gap-2">✓ Bring a valid ID and any previous medical records</li>
          <li className="flex items-start gap-2">✓ List your current medications and allergies</li>
          <li className="flex items-start gap-2">✓ Prepare questions you want to ask the doctor</li>
        </ul>
      </div>
    </div>
  );
};

export default AppointmentDetails;