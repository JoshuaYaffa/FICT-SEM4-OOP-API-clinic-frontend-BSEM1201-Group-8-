import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

const PatientDoctors = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [selectedClinic, setSelectedClinic] = useState('');
  const [clinics, setClinics] = useState([]);
  const [specializations, setSpecializations] = useState([]);

  useEffect(() => {
    fetchDoctors();
    fetchClinics();
  }, []);

  useEffect(() => {
    filterDoctors();
  }, [searchTerm, selectedSpecialization, selectedClinic, doctors]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      // FIXED: Increase limit to get all doctors (1000 instead of default 20)
      const response = await API.get('/doctors?limit=1000');
      console.log('Fetched doctors:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        setDoctors(response.data);
        setFilteredDoctors(response.data);
        
        // Get unique specializations
        const uniqueSpecs = [...new Set(response.data.map(d => d.specialization).filter(Boolean))];
        setSpecializations(uniqueSpecs);
      } else {
        setDoctors([]);
        setFilteredDoctors([]);
        toast.error('No doctors found');
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      toast.error(error.response?.data?.detail || 'Failed to load doctors');
      setDoctors([]);
      setFilteredDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchClinics = async () => {
    try {
      // FIXED: Increase limit to get all clinics
      const response = await API.get('/clinics?limit=1000');
      setClinics(response.data || []);
    } catch (error) {
      console.error('Error fetching clinics:', error);
    }
  };

  const filterDoctors = () => {
    let filtered = [...doctors];

    if (searchTerm) {
      filtered = filtered.filter(doctor =>
        doctor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedSpecialization) {
      filtered = filtered.filter(doctor => doctor.specialization === selectedSpecialization);
    }

    if (selectedClinic) {
      filtered = filtered.filter(doctor => doctor.clinic_id === parseInt(selectedClinic));
    }

    setFilteredDoctors(filtered);
  };

  const getClinicName = (clinicId) => {
    const clinic = clinics.find(c => c.id === clinicId);
    return clinic ? clinic.name : 'Loading...';
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6">
      <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2">
        ← Back
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">👨‍⚕️ Our Doctors</h1>
        <p className="text-gray-600">Find and book appointments with qualified doctors across Sierra Leone</p>
        <p className="text-sm text-cyan-600 mt-1">Total doctors available: {doctors.length}</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search by name or specialization</label>
            <input
              type="text"
              placeholder="Search doctors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
            <select
              value={selectedSpecialization}
              onChange={(e) => setSelectedSpecialization(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-cyan-500 focus:border-cyan-500"
            >
              <option value="">All Specializations</option>
              {specializations.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Clinic</label>
            <select
              value={selectedClinic}
              onChange={(e) => setSelectedClinic(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-cyan-500 focus:border-cyan-500"
            >
              <option value="">All Clinics</option>
              {clinics.map(clinic => (
                <option key={clinic.id} value={clinic.id}>{clinic.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-gray-600">
          Found {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? 's' : ''}
          {selectedSpecialization && ` in ${selectedSpecialization}`}
          {selectedClinic && ` at ${clinics.find(c => c.id === parseInt(selectedClinic))?.name}`}
        </p>
      </div>

      {/* Doctors Grid */}
      {filteredDoctors.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <div className="text-6xl mb-4">👨‍⚕️</div>
          <p className="text-gray-500 text-lg">No doctors found matching your criteria.</p>
          <button 
            onClick={() => {
              setSearchTerm('');
              setSelectedSpecialization('');
              setSelectedClinic('');
            }}
            className="mt-4 text-cyan-600 hover:underline"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doctor) => (
            <div key={doctor.id} className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
              <div className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-20 h-20 bg-cyan-600 rounded-full flex items-center justify-center text-white text-3xl">
                    {doctor.photo_url ? (
                      <img src={doctor.photo_url} alt={doctor.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span>👨‍⚕️</span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Dr. {doctor.name}</h3>
                    <p className="text-cyan-600 font-medium">{doctor.specialization}</p>
                    {doctor.is_approved && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Available</span>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  {doctor.qualification && (
                    <p className="text-gray-700 text-sm">
                      <span className="font-medium">Qualification:</span> {doctor.qualification}
                    </p>
                  )}
                  <p className="text-gray-700 text-sm">
                    <span className="font-medium">Experience:</span> {doctor.experience_years || 5}+ years
                  </p>
                  <p className="text-gray-700 text-sm">
                    <span className="font-medium">Availability:</span> {doctor.availability || 'Weekdays 9AM-5PM'}
                  </p>
                  <p className="text-gray-700 text-sm">
                    <span className="font-medium">Clinic:</span> {getClinicName(doctor.clinic_id)}
                  </p>
                  {doctor.bio && (
                    <p className="text-gray-600 text-sm mt-2 line-clamp-2">{doctor.bio.substring(0, 100)}...</p>
                  )}
                </div>

                <div className="mt-6 flex gap-3">
                  <Link
                    to={`/patient/doctor/${doctor.id}`}
                    className="flex-1 text-center bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition"
                  >
                    View Profile
                  </Link>
                  <Link
                    to={`/patient/book/${doctor.id}`}
                    className="flex-1 text-center border-2 border-cyan-600 text-cyan-600 px-4 py-2 rounded-lg hover:bg-cyan-50 transition"
                  >
                    Book Appointment
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientDoctors;