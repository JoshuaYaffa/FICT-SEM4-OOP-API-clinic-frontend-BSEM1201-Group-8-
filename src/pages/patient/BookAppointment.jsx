import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';

const BookAppointment = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    appointment_date: '',
    appointment_time: '',
    clinic_id: '',
    doctor_id: doctorId
  });

  useEffect(() => {
    fetchData();
  }, [doctorId]);

  const fetchData = async () => {
    try {
      const [doctorRes, clinicsRes] = await Promise.all([
        API.get(`/doctors/${doctorId}`),
        API.get('/clinics')
      ]);
      setDoctor(doctorRes.data);
      setClinics(clinicsRes.data);
      setFormData(prev => ({ ...prev, clinic_id: doctorRes.data.clinic_id }));
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load doctor information');
      navigate('/patient/doctors');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.appointment_date) {
      toast.error('Please select a date');
      return;
    }
    if (!formData.appointment_time) {
      toast.error('Please select a time');
      return;
    }
    
    setSubmitting(true);
    try {
      await API.post('/appointments', formData);
      toast.success('Appointment booked successfully!');
      navigate('/patient/appointments');
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error(error.response?.data?.detail || 'Failed to book appointment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
    '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'
  ];

  const getNextDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2">
        ← Back
      </button>
      
      <h1 className="text-3xl font-bold mb-6">📅 Book Appointment</h1>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white p-6">
          <h2 className="text-2xl font-bold">Dr. {doctor?.name}</h2>
          <p className="text-cyan-100">{doctor?.specialization}</p>
          <p className="text-cyan-100 text-sm mt-1">{doctor?.experience_years || 5}+ years experience</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Clinic</label>
            <select
              name="clinic_id"
              value={formData.clinic_id}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-cyan-500 focus:border-cyan-500"
            >
              <option value="">Select a clinic</option>
              {clinics.map(clinic => (
                <option key={clinic.id} value={clinic.id}>
                  {clinic.name} - {clinic.district}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
            <select
              name="appointment_date"
              value={formData.appointment_date}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-cyan-500 focus:border-cyan-500"
            >
              <option value="">Select a date</option>
              {getNextDays().map(date => (
                <option key={date} value={date}>
                  {new Date(date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Time</label>
            <select
              name="appointment_time"
              value={formData.appointment_time}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-cyan-500 focus:border-cyan-500"
            >
              <option value="">Select a time</option>
              {timeSlots.map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Appointment Information</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>✓ Please arrive 15 minutes before your appointment time</li>
              <li>✓ Bring your ID and any relevant medical records</li>
              <li>✓ You can cancel up to 24 hours in advance</li>
            </ul>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/patient/doctors')}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-cyan-600 text-white px-6 py-3 rounded-lg hover:bg-cyan-700 transition disabled:opacity-50"
            >
              {submitting ? 'Booking...' : 'Confirm Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookAppointment;