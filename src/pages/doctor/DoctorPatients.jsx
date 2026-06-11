import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';

const DoctorPatients = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientAppointments, setPatientAppointments] = useState([]);
  const [doctorProfile, setDoctorProfile] = useState(null);

  useEffect(() => {
    fetchDoctorProfile();
  }, []);

  useEffect(() => {
    if (doctorProfile) {
      fetchPatients();
    }
  }, [doctorProfile]);

  const fetchDoctorProfile = async () => {
    try {
      const response = await API.get('/doctors');
      const doctor = response.data.find(d => d.name === user?.name || d.user_id === user?.id);
      setDoctorProfile(doctor);
    } catch (error) {
      console.error('Error fetching doctor profile:', error);
      toast.error('Failed to load doctor profile');
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    if (!doctorProfile) return;
    
    try {
      // Get all appointments for this doctor
      const appointmentsRes = await API.get('/appointments/all');
      const allAppointments = appointmentsRes.data || [];
      
      // Filter appointments for this doctor
      const doctorAppointments = allAppointments.filter(apt => apt.doctor_id === doctorProfile.id);
      
      // Get unique patients
      const uniquePatients = [];
      const patientIds = new Set();
      
      for (const apt of doctorAppointments) {
        if (!patientIds.has(apt.patient_id)) {
          patientIds.add(apt.patient_id);
          
          // Try to get patient details
          let patientName = `Patient #${apt.patient_id}`;
          let patientEmail = 'N/A';
          
          try {
            const userRes = await API.get(`/users/${apt.patient_id}`);
            patientName = userRes.data.name;
            patientEmail = userRes.data.email;
          } catch (e) {
            console.log('Could not fetch patient details for ID:', apt.patient_id);
          }
          
          // Get all appointments for this patient with this doctor
          const patientApps = doctorAppointments.filter(a => a.patient_id === apt.patient_id);
          
          uniquePatients.push({
            id: apt.patient_id,
            name: patientName,
            email: patientEmail,
            appointmentCount: patientApps.length,
            lastVisit: apt.appointment_date,
            lastStatus: apt.status,
            appointments: patientApps
          });
        }
      }
      
      // Sort by last visit date (most recent first)
      uniquePatients.sort((a, b) => new Date(b.lastVisit) - new Date(a.lastVisit));
      
      setPatients(uniquePatients);
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const viewPatientDetails = async (patient) => {
    setSelectedPatient(patient);
    setPatientAppointments(patient.appointments || []);
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.id.toString().includes(searchTerm) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) return <LoadingSpinner />;

  if (!doctorProfile) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Doctor profile not found.</p>
        <p className="text-gray-500 text-sm mt-2">Please contact administrator.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2">
        ← Back
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">👥 My Patients</h1>
        <p className="text-gray-600">View and manage all your patients</p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by patient name, ID, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
          <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
        </div>
      </div>

      {patients.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Patients Yet</h3>
          <p className="text-gray-600">
            When patients book appointments with you, they will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patients List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b">
                <h2 className="text-xl font-semibold text-gray-900">Patient List</h2>
                <p className="text-sm text-gray-500">{filteredPatients.length} patients found</p>
              </div>
              <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                {filteredPatients.map((patient) => (
                  <div 
                    key={patient.id} 
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition ${selectedPatient?.id === patient.id ? 'bg-cyan-50' : ''}`}
                    onClick={() => viewPatientDetails(patient)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center text-lg">
                            👤
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{patient.name}</h3>
                            <p className="text-sm text-gray-500">{patient.email}</p>
                          </div>
                        </div>
                        <div className="flex gap-3 mt-2 text-sm">
                          <span className="text-gray-500">
                            📅 {patient.appointmentCount} appointments
                          </span>
                          <span className="text-gray-500">
                            🏥 Last visit: {patient.lastVisit}
                          </span>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(patient.lastStatus)}`}>
                        {patient.lastStatus}
                      </span>
                    </div>
                  </div>
                ))}
                {filteredPatients.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    No patients found matching your search.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Patient Details Panel */}
          <div className="lg:col-span-1">
            {selectedPatient ? (
              <div className="bg-white rounded-lg shadow-md overflow-hidden sticky top-20">
                <div className="px-6 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white">
                  <h2 className="text-xl font-semibold">Patient Details</h2>
                  <p className="text-cyan-100 text-sm">ID: #{selectedPatient.id}</p>
                </div>
                
                <div className="p-4">
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-500">Patient Information</h3>
                    <div className="mt-2 space-y-2">
                      <p><span className="font-medium">Name:</span> {selectedPatient.name}</p>
                      <p><span className="font-medium">Email:</span> {selectedPatient.email}</p>
                      <p><span className="font-medium">Total Visits:</span> {selectedPatient.appointmentCount}</p>
                      <p><span className="font-medium">Last Visit:</span> {selectedPatient.lastVisit}</p>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Appointment History</h3>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto">
                      {patientAppointments.length > 0 ? (
                        patientAppointments.map((apt, idx) => (
                          <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {new Date(apt.appointment_date).toLocaleDateString()}
                                </p>
                                <p className="text-xs text-gray-500">{apt.appointment_time || 'Time TBD'}</p>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(apt.status)}`}>
                                {apt.status}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">No appointment history</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="text-5xl mb-3">👈</div>
                <p className="text-gray-500">Select a patient from the list</p>
                <p className="text-sm text-gray-400 mt-1">to view their details and appointment history</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorPatients;