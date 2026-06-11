import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';

const AnnualReports = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [clinic, setClinic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchClinicAndReports();
  }, []);

  const fetchClinicAndReports = async () => {
    try {
      setLoading(true);
      const clinicsRes = await API.get('/clinics?limit=1000');
      const managerClinic = clinicsRes.data.find(c => c.clinic_manager_id === user?.id);
      setClinic(managerClinic);
      
      if (managerClinic) {
        const reportsRes = await API.get(`/annual-records/clinic/${managerClinic.id}`);
        setReports(reportsRes.data || []);
      } else {
        toast.error('You are not assigned to any clinic');
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error(error.response?.data?.detail || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const getReportForYear = (year) => {
    return reports.find(r => r.year === year);
  };

  const years = [2022, 2023, 2024, 2025, 2026];
  const currentReport = getReportForYear(selectedYear);

  if (loading) return <LoadingSpinner />;

  if (!clinic) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">You are not assigned to any clinic.</p>
        <p className="text-gray-500 mt-2">Please contact the administrator.</p>
        <button 
          onClick={() => navigate('/manager/dashboard')}
          className="mt-4 text-cyan-600 hover:underline"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2">
        ← Back
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">📊 Annual Reports</h1>
        <p className="text-gray-600">Performance reports for {clinic.name}</p>
        <p className="text-sm text-gray-500 mt-1">📍 {clinic.district} | 📞 {clinic.phone}</p>
      </div>

      {/* Year Selector */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <label className="font-medium text-gray-700">Select Year:</label>
          <div className="flex gap-2 flex-wrap">
            {years.map(year => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`px-4 py-2 rounded-lg transition ${
                  selectedYear === year
                    ? 'bg-cyan-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>
      </div>

      {currentReport ? (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-xl p-6">
              <p className="text-blue-100 text-sm">Total Patients</p>
              <p className="text-3xl font-bold">{currentReport.total_patients?.toLocaleString() || 0}</p>
            </div>
            <div className="bg-gradient-to-br from-green-600 to-green-700 text-white rounded-xl p-6">
              <p className="text-green-100 text-sm">Total Appointments</p>
              <p className="text-3xl font-bold">{currentReport.total_appointments?.toLocaleString() || 0}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-xl p-6">
              <p className="text-purple-100 text-sm">Completion Rate</p>
              <p className="text-3xl font-bold">
                {currentReport.total_appointments > 0 
                  ? ((currentReport.completed_appointments / currentReport.total_appointments) * 100).toFixed(1)
                  : 0}%
              </p>
            </div>
            <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 text-white rounded-xl p-6">
              <p className="text-yellow-100 text-sm">Revenue Estimate</p>
              <p className="text-2xl font-bold">Le {currentReport.revenue_estimate?.toLocaleString() || 0}</p>
            </div>
          </div>

          {/* Detailed Stats */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Detailed Statistics for {selectedYear}</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-gray-600">Total Patients Served</span>
                    <span className="font-bold text-gray-900">{currentReport.total_patients?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-gray-600">Total Appointments</span>
                    <span className="font-bold text-gray-900">{currentReport.total_appointments?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-gray-600">Completed Appointments</span>
                    <span className="font-bold text-green-600">{currentReport.completed_appointments?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-gray-600">Cancelled Appointments</span>
                    <span className="font-bold text-red-600">{currentReport.cancelled_appointments?.toLocaleString() || 0}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-gray-600">Total Doctors</span>
                    <span className="font-bold text-gray-900">{currentReport.total_doctors || 0}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-gray-600">Total Services Offered</span>
                    <span className="font-bold text-gray-900">{currentReport.total_services || 0}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-gray-600">Average Patients per Doctor</span>
                    <span className="font-bold text-gray-900">
                      {currentReport.total_doctors > 0 
                        ? (currentReport.total_patients / currentReport.total_doctors).toFixed(1)
                        : 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-gray-600">Revenue Estimate</span>
                    <span className="font-bold text-green-600">Le {currentReport.revenue_estimate?.toLocaleString() || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Indicators */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">📈 Performance Indicators</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">Appointment Completion Rate</span>
                  <span className="text-sm font-medium text-gray-900">
                    {currentReport.total_appointments > 0 
                      ? ((currentReport.completed_appointments / currentReport.total_appointments) * 100).toFixed(1)
                      : 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${currentReport.total_appointments > 0 ? (currentReport.completed_appointments / currentReport.total_appointments) * 100 : 0}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">Cancellation Rate</span>
                  <span className="text-sm font-medium text-gray-900">
                    {currentReport.total_appointments > 0 
                      ? ((currentReport.cancelled_appointments / currentReport.total_appointments) * 100).toFixed(1)
                      : 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-600 h-2 rounded-full"
                    style={{ width: `${currentReport.total_appointments > 0 ? (currentReport.cancelled_appointments / currentReport.total_appointments) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Report Footer */}
          <div className="text-center text-xs text-gray-400">
            <p>Report generated for {clinic.name} - {selectedYear}</p>
            <p className="mt-1">Smart Clinic Service | Supporting SDG 3: Good Health & Well-being in Sierra Leone</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-gray-500 text-lg">No report available for {selectedYear}</p>
          <p className="text-sm text-gray-400 mt-1">Annual records are added by administrators</p>
          <button 
            onClick={() => setSelectedYear(new Date().getFullYear())}
            className="mt-4 text-cyan-600 hover:underline"
          >
            Check current year
          </button>
        </div>
      )}
    </div>
  );
};

export default AnnualReports;