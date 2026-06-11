import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';

const AppointmentReply = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [doctorProfile, setDoctorProfile] = useState(null);

  useEffect(() => {
    fetchAppointmentAndDoctor();
  }, [id]);

  const fetchAppointmentAndDoctor = async () => {
    try {
      // First, get the current logged-in user (doctor)
      const userRes = await API.get('/users/me');
      const currentUser = userRes.data;
      
      // Get doctor profile
      const doctorsRes = await API.get('/doctors');
      const doctor = doctorsRes.data.find(d => d.name === currentUser.name || d.user_id === currentUser.id);
      
      if (doctor) {
        setDoctorProfile(doctor);
        
        // Get appointments for this doctor
        const appointmentsRes = await API.get('/appointments/all');
        const allAppointments = appointmentsRes.data || [];
        
        // Find the specific appointment
        const apt = allAppointments.find(a => a.id === parseInt(id));
        
        if (apt) {
          setAppointment(apt);
        } else {
          toast.error('Appointment not found');
          navigate('/doctor/appointments');
        }
      } else {
        toast.error('Doctor profile not found');
        navigate('/doctor/appointments');
      }
    } catch (error) {
      console.error('Error fetching appointment:', error);
      toast.error('Failed to load appointment details');
      navigate('/doctor/appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async () => {
    if (!reply.trim()) {
      toast.error('Please enter a reply message');
      return;
    }

    setSending(true);
    try {
      // Send notification to patient
      await API.post('/notifications/send', {
        title: 'Appointment Update',
        message: `Doctor's reply regarding appointment #${id}: ${reply}`,
        user_id: appointment.patient_id
      });
      
      toast.success('Reply sent to patient successfully!');
      navigate('/doctor/appointments');
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error(error.response?.data?.detail || 'Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (!appointment) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center">
        <p className="text-gray-500">Appointment not found.</p>
        <button 
          onClick={() => navigate('/doctor/appointments')}
          className="mt-4 text-cyan-600 hover:underline"
        >
          ← Back to Appointments
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2">
        ← Back
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">💬 Reply to Patient</h1>
        <p className="text-gray-600">Send a message regarding the appointment</p>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Appointment Details */}
        <div className="bg-gray-50 p-6 border-b">
          <h3 className="font-semibold text-gray-900 mb-3">Appointment Details</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Appointment ID:</span>
              <span className="ml-2 text-gray-900">#{appointment.id}</span>
            </div>
            <div>
              <span className="text-gray-500">Patient ID:</span>
              <span className="ml-2 text-gray-900">#{appointment.patient_id}</span>
            </div>
            <div>
              <span className="text-gray-500">Date:</span>
              <span className="ml-2 text-gray-900">{appointment.appointment_date}</span>
            </div>
            <div>
              <span className="text-gray-500">Time:</span>
              <span className="ml-2 text-gray-900">{appointment.appointment_time || 'TBD'}</span>
            </div>
            <div>
              <span className="text-gray-500">Status:</span>
              <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                appointment.status === 'approved' ? 'bg-green-100 text-green-800' :
                appointment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                'bg-red-100 text-red-800'
              }`}>
                {appointment.status}
              </span>
            </div>
          </div>
        </div>

        {/* Reply Form */}
        <div className="p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Message to Patient
          </label>
          <textarea
            rows="6"
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg focus:ring-cyan-500 focus:border-cyan-500"
            placeholder="Dear patient, ..."
          />
          
          <div className="mt-4 bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 Tip: Be clear about appointment confirmation, what documents to bring, 
              or any preparation needed before the visit.
            </p>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSendReply}
              disabled={sending}
              className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50"
            >
              {sending ? 'Sending...' : 'Send Reply'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentReply;