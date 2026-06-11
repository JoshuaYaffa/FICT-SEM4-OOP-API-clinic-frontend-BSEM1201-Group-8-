import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';

const ClinicAnnualReport = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [downloading, setDownloading] = useState(false);

  const years = [2022, 2023, 2024, 2025, 2026];

  useEffect(() => {
    fetchDoctorProfile();
  }, []);

  useEffect(() => {
    if (doctorProfile) {
      fetchReportData();
    }
  }, [doctorProfile, selectedYear]);

  const fetchDoctorProfile = async () => {
    try {
      const response = await API.get('/doctors');
      const doctor = response.data.find(d => d.name === user?.name || d.user_id === user?.id);
      if (doctor) {
        setDoctorProfile(doctor);
      } else {
        toast.error('Doctor profile not found');
      }
    } catch (error) {
      console.error('Error fetching doctor profile:', error);
      toast.error('Failed to load doctor profile');
    }
  };

  const fetchReportData = async () => {
    if (!doctorProfile) return;
    
    setLoading(true);
    try {
      const response = await API.get(`/doctors/${doctorProfile.id}/annual-report-data?year=${selectedYear}`);
      setReportData(response.data);
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (format) => {
    if (!doctorProfile) return;
    
    setDownloading(true);
    try {
      let url = '';
      let filename = `doctor_report_${doctorProfile.name.replace(/\s/g, '_')}_${selectedYear}`;
      
      if (format === 'excel') {
        url = `/doctors/${doctorProfile.id}/download-report/excel?year=${selectedYear}`;
        filename += '.csv';
      } else if (format === 'text') {
        url = `/doctors/${doctorProfile.id}/download-report/text?year=${selectedYear}`;
        filename += '.txt';
      } else {
        toast.error('Format not available');
        setDownloading(false);
        return;
      }
      
      const response = await API.get(url, {
        responseType: 'blob'
      });
      
      // Create download link
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
      
      toast.success(`Report downloaded as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('Failed to download report');
    } finally {
      setDownloading(false);
    }
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
        <h1 className="text-3xl font-bold mb-2">📊 Annual Performance Report</h1>
        <p className="text-gray-600">View and download your annual performance statistics</p>
      </div>

      {/* Year Selector and Download Buttons */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <label className="font-medium text-gray-700">Select Year:</label>
            <div className="flex gap-2">
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
          
          <div className="flex gap-2">
            <button
              onClick={() => downloadReport('excel')}
              disabled={downloading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
            >
              <span>📊</span> Download Excel
            </button>
            <button
              onClick={() => downloadReport('text')}
              disabled={downloading}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
            >
              <span>📃</span> Download Text
            </button>
          </div>
        </div>
      </div>

      {reportData && (
        <>
          {/* Doctor Information */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center text-xl">
                👨‍⚕️
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Doctor Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium text-gray-900">Dr. {reportData.doctor.name}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Specialization</p>
                <p className="font-medium text-gray-900">{reportData.doctor.specialization}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Qualification</p>
                <p className="font-medium text-gray-900">{reportData.doctor.qualification || 'N/A'}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Experience</p>
                <p className="font-medium text-gray-900">{reportData.doctor.experience_years} years</p>
              </div>
            </div>
          </div>

          {/* Clinic Information */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-xl">
                🏥
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Clinic Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Clinic Name</p>
                <p className="font-medium text-gray-900">{reportData.clinic.name}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">District</p>
                <p className="font-medium text-gray-900">{reportData.clinic.district}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium text-gray-900">{reportData.clinic.location}</p>
              </div>
            </div>
          </div>

          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-xl p-6 text-center">
              <p className="text-blue-100 text-sm">Total Appointments</p>
              <p className="text-3xl font-bold">{reportData.statistics.total_appointments}</p>
            </div>
            <div className="bg-gradient-to-br from-green-600 to-green-700 text-white rounded-xl p-6 text-center">
              <p className="text-green-100 text-sm">Completed</p>
              <p className="text-3xl font-bold">{reportData.statistics.completed}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-xl p-6 text-center">
              <p className="text-purple-100 text-sm">Completion Rate</p>
              <p className="text-3xl font-bold">{reportData.statistics.completion_rate}%</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 text-white rounded-xl p-6 text-center">
              <p className="text-yellow-100 text-sm">Avg Rating</p>
              <p className="text-3xl font-bold">{reportData.statistics.average_rating} ⭐</p>
            </div>
          </div>

          {/* Detailed Statistics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">📈 Appointment Statistics</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Total Appointments</span>
                  <span className="font-bold text-gray-900">{reportData.statistics.total_appointments}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                  <span className="text-gray-600">Pending</span>
                  <span className="font-bold text-yellow-600">{reportData.statistics.pending}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-gray-600">Approved</span>
                  <span className="font-bold text-green-600">{reportData.statistics.approved}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-gray-600">Completed</span>
                  <span className="font-bold text-blue-600">{reportData.statistics.completed}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <span className="text-gray-600">Cancelled</span>
                  <span className="font-bold text-red-600">{reportData.statistics.cancelled}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="text-gray-600">Unique Patients</span>
                  <span className="font-bold text-purple-600">{reportData.statistics.unique_patients}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">⭐ Rating & Performance</h2>
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-2">Average Patient Rating</p>
                  <div className="flex items-center justify-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={`text-3xl ${i < Math.round(reportData.statistics.average_rating) ? 'text-yellow-400' : 'text-gray-300'}`}>
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="text-2xl font-bold mt-2">{reportData.statistics.average_rating} / 5.0</p>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">Completion Rate</span>
                    <span className="text-sm font-medium text-gray-900">{reportData.statistics.completion_rate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-green-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${reportData.statistics.completion_rate}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">Cancellation Rate</span>
                    <span className="text-sm font-medium text-gray-900">{reportData.statistics.cancellation_rate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-red-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${reportData.statistics.cancellation_rate}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Breakdown Table */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">📅 Monthly Breakdown</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Completed</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Cancelled</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Completion Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reportData.monthly_breakdown.map((month) => {
                    const completionRate = month.total > 0 ? Math.round((month.completed / month.total) * 100) : 0;
                    return (
                      <tr key={month.month} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{month.month_name}</td>
                        <td className="px-4 py-3 text-sm text-center text-gray-600">{month.total}</td>
                        <td className="px-4 py-3 text-sm text-center text-green-600 font-medium">{month.completed}</td>
                        <td className="px-4 py-3 text-sm text-center text-red-600">{month.cancelled}</td>
                        <td className="px-4 py-3 text-sm text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-cyan-600 h-2 rounded-full"
                                style={{ width: `${completionRate}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium">{completionRate}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Report Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">
              Report generated on {reportData.report_date}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Smart Clinic Service | Supporting SDG 3: Good Health & Well-being in Sierra Leone
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default ClinicAnnualReport;