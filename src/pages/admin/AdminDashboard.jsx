import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement 
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import toast from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total_users: 0,
    total_clinics: 0,
    total_doctors: 0,
    total_appointments: 0,
    total_reviews: 0,
    total_services: 0
  });
  const [appointmentStats, setAppointmentStats] = useState(null);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pending Approvals State
  const [pendingManagers, setPendingManagers] = useState([]);
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [clinics, setClinics] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    fetchPendingApprovals();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, aptStatsRes, aptRes, clinicsRes] = await Promise.all([
        API.get('/dashboard/stats'),
        API.get('/dashboard/appointment-statistics'),
        API.get('/appointments/all'),
        API.get('/clinics?limit=1000')
      ]);
      setStats(statsRes.data);
      setAppointmentStats(aptStatsRes.data);
      setRecentAppointments((aptRes.data || []).slice(0, 10));
      setClinics(clinicsRes.data || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingApprovals = async () => {
    try {
      // Get all users
      const usersRes = await API.get('/users');
      
      // Filter users who are managers (not yet assigned to clinic) or pending
      const managers = usersRes.data.filter(user => 
        (user.role === 'manager' || user.role === 'pending_manager')
      );
      setPendingManagers(managers);
      
      // Get pending doctors
      const doctorsRes = await API.get('/doctors/pending');
      setPendingDoctors(doctorsRes.data || []);
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
    }
  };

  const approveManager = async (userId, clinicId) => {
    if (!clinicId) {
      toast.error('Please select a clinic');
      return;
    }
    
    try {
      // Update user role to manager
      await API.put(`/users/${userId}?role=manager`);
      // Assign to clinic
      await API.put(`/clinics/${clinicId}/assign-manager?manager_id=${userId}`);
      toast.success('Manager approved and assigned to clinic');
      fetchDashboardData();
      fetchPendingApprovals();
    } catch (error) {
      console.error('Error approving manager:', error);
      toast.error(error.response?.data?.detail || 'Failed to approve manager');
    }
  };

  const rejectManager = async (userId) => {
    if (!window.confirm('Are you sure you want to reject this manager application?')) return;
    try {
      await API.delete(`/users/${userId}`);
      toast.success('Manager application rejected');
      fetchPendingApprovals();
    } catch (error) {
      console.error('Error rejecting manager:', error);
      toast.error('Failed to reject manager');
    }
  };

  const approveDoctor = async (doctorId) => {
    try {
      await API.put(`/doctors/${doctorId}/approve`);
      toast.success('Doctor approved successfully');
      fetchPendingApprovals();
      fetchDashboardData();
    } catch (error) {
      console.error('Error approving doctor:', error);
      toast.error('Failed to approve doctor');
    }
  };

  const rejectDoctor = async (doctorId) => {
    if (!window.confirm('Are you sure you want to reject this doctor application?')) return;
    try {
      await API.delete(`/doctors/${doctorId}/reject`);
      toast.success('Doctor application rejected');
      fetchPendingApprovals();
    } catch (error) {
      console.error('Error rejecting doctor:', error);
      toast.error('Failed to reject doctor');
    }
  };

  const barChartData = {
    labels: ['Pending', 'Approved', 'Completed', 'Cancelled'],
    datasets: [{
      label: 'Appointments',
      data: appointmentStats ? [
        appointmentStats.pending,
        appointmentStats.approved,
        appointmentStats.completed,
        appointmentStats.cancelled
      ] : [0, 0, 0, 0],
      backgroundColor: ['#f59e0b', '#10b981', '#3b82f6', '#ef4444'],
      borderRadius: 8,
    }],
  };

  const pieChartData = {
    labels: ['Users', 'Clinics', 'Doctors', 'Services'],
    datasets: [{
      data: [
        stats.total_users,
        stats.total_clinics,
        stats.total_doctors,
        stats.total_services
      ],
      backgroundColor: ['#0891b2', '#10b981', '#8b5cf6', '#f97316'],
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' } }
  };

  const totalPending = pendingManagers.length + pendingDoctors.length;

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6">
      <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2">
        ← Back
      </button>

      <h1 className="text-3xl font-bold mb-2">📊 Admin Dashboard</h1>
      <p className="text-gray-600 mb-6">Monitor and manage your healthcare system</p>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <div className="bg-gradient-to-br from-cyan-600 to-cyan-700 text-white rounded-xl p-4">
          <p className="text-cyan-100 text-sm">Total Users</p>
          <p className="text-2xl font-bold">{stats.total_users}</p>
          <Link to="/admin/users" className="text-cyan-200 text-xs hover:text-white">Manage →</Link>
        </div>
        <div className="bg-gradient-to-br from-green-600 to-green-700 text-white rounded-xl p-4">
          <p className="text-green-100 text-sm">Total Clinics</p>
          <p className="text-2xl font-bold">{stats.total_clinics}</p>
          <Link to="/admin/clinics" className="text-green-200 text-xs hover:text-white">Manage →</Link>
        </div>
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-xl p-4">
          <p className="text-blue-100 text-sm">Total Doctors</p>
          <p className="text-2xl font-bold">{stats.total_doctors}</p>
          <Link to="/admin/doctors" className="text-blue-200 text-xs hover:text-white">Manage →</Link>
        </div>
        <div className="bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-xl p-4">
          <p className="text-purple-100 text-sm">Appointments</p>
          <p className="text-2xl font-bold">{stats.total_appointments}</p>
          <Link to="/admin/appointments" className="text-purple-200 text-xs hover:text-white">View →</Link>
        </div>
        <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 text-white rounded-xl p-4">
          <p className="text-yellow-100 text-sm">Reviews</p>
          <p className="text-2xl font-bold">{stats.total_reviews}</p>
          <Link to="/admin/reviews" className="text-yellow-200 text-xs hover:text-white">Manage →</Link>
        </div>
        <div className="bg-gradient-to-br from-pink-600 to-pink-700 text-white rounded-xl p-4">
          <p className="text-pink-100 text-sm">Services</p>
          <p className="text-2xl font-bold">{stats.total_services}</p>
          <Link to="/admin/services" className="text-pink-200 text-xs hover:text-white">Manage →</Link>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Appointment Status Distribution</h2>
          <div className="h-80">
            <Bar data={barChartData} options={chartOptions} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">System Overview</h2>
          <div className="h-80">
            <Pie data={pieChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <Link to="/admin/clinics" className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg p-4 text-center hover:shadow-lg transition">
          <div className="text-2xl mb-1">🏥</div>
          <p className="font-semibold">Manage Clinics</p>
        </Link>
        <Link to="/admin/doctors" className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg p-4 text-center hover:shadow-lg transition">
          <div className="text-2xl mb-1">👨‍⚕️</div>
          <p className="font-semibold">Manage Doctors</p>
        </Link>
        <Link to="/admin/annual-records" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg p-4 text-center hover:shadow-lg transition">
          <div className="text-2xl mb-1">📊</div>
          <p className="font-semibold">Annual Records</p>
        </Link>
        <Link to="/admin/analytics" className="bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg p-4 text-center hover:shadow-lg transition">
          <div className="text-2xl mb-1">📈</div>
          <p className="font-semibold">Analytics</p>
        </Link>
        <button
          onClick={() => setShowPendingModal(true)}
          className="bg-gradient-to-r from-yellow-600 to-amber-600 text-white rounded-lg p-4 text-center hover:shadow-lg transition relative"
        >
          <div className="text-2xl mb-1">⏳</div>
          <p className="font-semibold">Pending Approvals</p>
          {totalPending > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {totalPending}
            </span>
          )}
        </button>
      </div>

      {/* Recent Appointments */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">📅 Recent Appointments</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Patient</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Doctor</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentAppointments.map((apt) => (
                <tr key={apt.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">#{apt.id}</td>
                  <td className="px-4 py-3 text-sm">Patient #{apt.patient_id}</td>
                  <td className="px-4 py-3 text-sm">Doctor #{apt.doctor_id}</td>
                  <td className="px-4 py-3 text-sm">{apt.appointment_date}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      apt.status === 'approved' ? 'bg-green-100 text-green-800' :
                      apt.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {apt.status}
                    </span>
                  </td>
                </tr>
              ))}
              {recentAppointments.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500">
                    No appointments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending Approvals Modal */}
      {showPendingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">⏳ Pending Approvals</h2>
                <button onClick={() => setShowPendingModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl">
                  ✕
                </button>
              </div>
              
              {/* Pending Clinic Managers */}
              {pendingManagers.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-3 text-purple-700">🏥 Clinic Manager Applications ({pendingManagers.length})</h3>
                  <div className="space-y-3">
                    {pendingManagers.map(manager => (
                      <div key={manager.id} className="border rounded-lg p-4 bg-purple-50">
                        <div className="flex flex-wrap justify-between items-start gap-3">
                          <div className="flex-1">
                            <p className="font-semibold text-lg">{manager.name}</p>
                            <p className="text-gray-600 text-sm">{manager.email}</p>
                            <p className="text-xs text-gray-500 mt-1">Status: {manager.role}</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <select 
                              id={`clinic-${manager.id}`}
                              className="px-3 py-1 border rounded text-sm bg-white"
                              defaultValue=""
                            >
                              <option value="" disabled>Select Clinic</option>
                              {clinics.map(clinic => (
                                <option key={clinic.id} value={clinic.id}>
                                  {clinic.name} ({clinic.district})
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => {
                                const select = document.getElementById(`clinic-${manager.id}`);
                                const clinicId = select.value;
                                approveManager(manager.id, clinicId);
                              }}
                              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => rejectManager(manager.id)}
                              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pending Doctors */}
              {pendingDoctors.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-blue-700">👨‍⚕️ Doctor Applications ({pendingDoctors.length})</h3>
                  <div className="space-y-3">
                    {pendingDoctors.map(doctor => (
                      <div key={doctor.id} className="border rounded-lg p-4 bg-blue-50">
                        <div className="flex flex-wrap justify-between items-start gap-3">
                          <div className="flex-1">
                            <p className="font-semibold text-lg">Dr. {doctor.name}</p>
                            <p className="text-blue-600 text-sm">{doctor.specialization}</p>
                            <p className="text-gray-600 text-sm">{doctor.qualification}</p>
                            <p className="text-xs text-gray-500">{doctor.experience_years}+ years experience</p>
                            {doctor.bio && <p className="text-sm text-gray-600 mt-1">{doctor.bio.substring(0, 100)}...</p>}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => approveDoctor(doctor.id)}
                              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => rejectDoctor(doctor.id)}
                              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {totalPending === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-5xl mb-3">✅</p>
                  <p>No pending approvals</p>
                  <p className="text-sm mt-1">All manager and doctor applications have been processed</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;