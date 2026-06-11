import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

const PatientClinics = () => {
  const navigate = useNavigate();
  const [clinics, setClinics] = useState([]);
  const [filteredClinics, setFilteredClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [emergencyOnly, setEmergencyOnly] = useState(false);

  const districts = ['', 'Western Area Urban', 'Western Area Rural', 'Bo', 'Kenema', 'Bombali', 'Kailahun', 'Port Loko', 'Kono', 'Tonkolili', 'Kambia', 'Moyamba', 'Pujehun', 'Bonthe'];

  useEffect(() => {
    fetchClinics();
  }, []);

  useEffect(() => {
    filterClinics();
  }, [searchTerm, selectedDistrict, emergencyOnly, clinics]);

  const fetchClinics = async () => {
    try {
      setLoading(true);
      // Get all clinics without limit
      const response = await API.get('/clinics?limit=1000');
      console.log('Fetched clinics:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        setClinics(response.data);
        setFilteredClinics(response.data);
      } else {
        setClinics([]);
        setFilteredClinics([]);
        toast.error('No clinics found');
      }
    } catch (error) {
      console.error('Error fetching clinics:', error);
      toast.error('Failed to load clinics');
      setClinics([]);
      setFilteredClinics([]);
    } finally {
      setLoading(false);
    }
  };

  const filterClinics = () => {
    let filtered = [...clinics];

    if (searchTerm) {
      filtered = filtered.filter(clinic =>
        clinic.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clinic.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedDistrict) {
      filtered = filtered.filter(clinic => clinic.district === selectedDistrict);
    }

    if (emergencyOnly) {
      filtered = filtered.filter(clinic => clinic.emergency_available === true);
    }

    setFilteredClinics(filtered);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6">
      <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2">
        ← Back
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">🏥 Find Clinics in Sierra Leone</h1>
        <p className="text-gray-600">Found {filteredClinics.length} clinics in our system</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search by name or location</label>
            <input
              type="text"
              placeholder="Search clinics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-cyan-500 focus:border-cyan-500"
            >
              {districts.map(district => (
                <option key={district} value={district}>{district || 'All Districts'}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={emergencyOnly}
                onChange={(e) => setEmergencyOnly(e.target.checked)}
                className="mr-2 w-4 h-4 text-cyan-600 focus:ring-cyan-500"
              />
              <span>🚨 Emergency Services Available</span>
            </label>
          </div>
        </div>
      </div>

      {/* Clinics Grid */}
      {filteredClinics.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 text-lg">No clinics found matching your criteria.</p>
          <button 
            onClick={fetchClinics}
            className="mt-4 text-cyan-600 hover:underline"
          >
            Refresh List
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClinics.map((clinic) => (
            <div key={clinic.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
              <div className="h-48 bg-gradient-to-r from-cyan-400 to-blue-400 flex items-center justify-center">
                {clinic.image_url ? (
                  <img src={clinic.image_url} alt={clinic.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-6xl">🏥</span>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900">{clinic.name}</h3>
                <p className="text-gray-600 mt-2">📍 {clinic.district}, {clinic.location}</p>
                <p className="text-gray-600">📞 {clinic.phone}</p>
                <p className="text-gray-600">🕐 {clinic.opening_time} - {clinic.closing_time}</p>
                
                <div className="mt-4 flex flex-wrap gap-2">
                  {clinic.emergency_available && (
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">🚨 Emergency</span>
                  )}
                  {clinic.ambulance_available && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">🚑 Ambulance</span>
                  )}
                </div>

                <Link
                  to={`/patient/clinic/${clinic.id}`}
                  className="mt-4 inline-block w-full text-center bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition"
                >
                  View Clinic Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientClinics;