import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import BackButton from './components/BackButton';
import Footer from './components/Footer';

// Public Pages
import HomePage from './pages/HomePage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import RoleLogin from './pages/auth/RoleLogin';

// Patient Pages
import PatientDashboard from './pages/patient/PatientDashboard';
import PatientClinics from './pages/patient/PatientClinics';
import PatientDoctors from './pages/patient/PatientDoctors';
import BookAppointment from './pages/patient/BookAppointment';
import MyAppointments from './pages/patient/MyAppointments';
import ClinicDetails from './pages/patient/ClinicDetails';
import DoctorDetails from './pages/patient/DoctorDetails';
import AppointmentDetails from './pages/patient/AppointmentDetails';
import PatientProfile from './pages/patient/PatientProfile';
import Notifications from './pages/patient/Notifications';

// Doctor Pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import DoctorPatients from './pages/doctor/DoctorPatients';
import DoctorReviews from './pages/doctor/DoctorReviews';
import DoctorProfile from './pages/doctor/DoctorProfile';
import ClinicAnnualReport from './pages/doctor/ClinicAnnualReport';
import AppointmentReply from './pages/doctor/AppointmentReply';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProfile from './pages/admin/AdminProfile';
import ManageClinics from './pages/admin/ManageClinics';
import ManageDoctors from './pages/admin/ManageDoctors';
import ManageUsers from './pages/admin/ManageUsers';
import ManageAppointments from './pages/admin/ManageAppointments';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import ManageReviews from './pages/admin/ManageReviews';
import AuditLogs from './pages/admin/AuditLogs';
import AnnualRecords from './pages/admin/AnnualRecords';
import ManageServices from './pages/admin/ManageServices';

// Manager Pages
import ManagerDashboard from './pages/manager/ManagerDashboard';
import ManagerDoctors from './pages/manager/ManagerDoctors';
import ManagerAppointments from './pages/manager/ManagerAppointments';
import ManagerReviews from './pages/manager/ManagerReviews';
import AnnualReports from './pages/manager/AnnualReports';
import ManagerServices from './pages/manager/ManagerServices';
import ManagerProfile from './pages/manager/ManagerProfile';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex flex-col">
          <Navbar />
          <BackButton />
          <main className="flex-grow max-w-7xl w-full mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/role-login" element={<RoleLogin />} />

              {/* Patient Routes */}
              <Route path="/patient/dashboard" element={
                <ProtectedRoute allowedRoles={['patient', 'admin']}>
                  <PatientDashboard />
                </ProtectedRoute>
              } />
              <Route path="/patient/clinics" element={
                <ProtectedRoute allowedRoles={['patient', 'admin']}>
                  <PatientClinics />
                </ProtectedRoute>
              } />
              <Route path="/patient/doctors" element={
                <ProtectedRoute allowedRoles={['patient', 'admin']}>
                  <PatientDoctors />
                </ProtectedRoute>
              } />
              <Route path="/patient/clinic/:id" element={
                <ProtectedRoute allowedRoles={['patient', 'admin']}>
                  <ClinicDetails />
                </ProtectedRoute>
              } />
              <Route path="/patient/doctor/:id" element={
                <ProtectedRoute allowedRoles={['patient', 'admin']}>
                  <DoctorDetails />
                </ProtectedRoute>
              } />
              <Route path="/patient/book/:doctorId" element={
                <ProtectedRoute allowedRoles={['patient', 'admin']}>
                  <BookAppointment />
                </ProtectedRoute>
              } />
              <Route path="/patient/appointments" element={
                <ProtectedRoute allowedRoles={['patient', 'admin']}>
                  <MyAppointments />
                </ProtectedRoute>
              } />
              <Route path="/patient/appointment/:id" element={
                <ProtectedRoute allowedRoles={['patient', 'admin']}>
                  <AppointmentDetails />
                </ProtectedRoute>
              } />
              <Route path="/patient/profile" element={
                <ProtectedRoute allowedRoles={['patient', 'admin']}>
                  <PatientProfile />
                </ProtectedRoute>
              } />
              <Route path="/patient/notifications" element={
                <ProtectedRoute allowedRoles={['patient', 'admin']}>
                  <Notifications />
                </ProtectedRoute>
              } />

              {/* Doctor Routes */}
              <Route path="/doctor/dashboard" element={
                <ProtectedRoute allowedRoles={['doctor', 'admin']}>
                  <DoctorDashboard />
                </ProtectedRoute>
              } />
              <Route path="/doctor/appointments" element={
                <ProtectedRoute allowedRoles={['doctor', 'admin']}>
                  <DoctorAppointments />
                </ProtectedRoute>
              } />
              <Route path="/doctor/patients" element={
                <ProtectedRoute allowedRoles={['doctor', 'admin']}>
                  <DoctorPatients />
                </ProtectedRoute>
              } />
              <Route path="/doctor/reviews" element={
                <ProtectedRoute allowedRoles={['doctor', 'admin']}>
                  <DoctorReviews />
                </ProtectedRoute>
              } />
              <Route path="/doctor/profile" element={
                <ProtectedRoute allowedRoles={['doctor', 'admin']}>
                  <DoctorProfile />
                </ProtectedRoute>
              } />
              <Route path="/doctor/clinic-report" element={
                <ProtectedRoute allowedRoles={['doctor', 'admin']}>
                  <ClinicAnnualReport />
                </ProtectedRoute>
              } />
              <Route path="/doctor/appointment/:id/reply" element={
                <ProtectedRoute allowedRoles={['doctor', 'admin']}>
                  <AppointmentReply />
                </ProtectedRoute>
              } />

              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={
                <ProtectedRoute allowedRoles="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/profile" element={
                <ProtectedRoute allowedRoles="admin">
                  <AdminProfile />
                </ProtectedRoute>
              } />
              <Route path="/admin/clinics" element={
                <ProtectedRoute allowedRoles="admin">
                  <ManageClinics />
                </ProtectedRoute>
              } />
              <Route path="/admin/doctors" element={
                <ProtectedRoute allowedRoles="admin">
                  <ManageDoctors />
                </ProtectedRoute>
              } />
              <Route path="/admin/users" element={
                <ProtectedRoute allowedRoles="admin">
                  <ManageUsers />
                </ProtectedRoute>
              } />
              <Route path="/admin/appointments" element={
                <ProtectedRoute allowedRoles="admin">
                  <ManageAppointments />
                </ProtectedRoute>
              } />
              <Route path="/admin/analytics" element={
                <ProtectedRoute allowedRoles="admin">
                  <AdminAnalytics />
                </ProtectedRoute>
              } />
              <Route path="/admin/reviews" element={
                <ProtectedRoute allowedRoles="admin">
                  <ManageReviews />
                </ProtectedRoute>
              } />
              <Route path="/admin/audit-logs" element={
                <ProtectedRoute allowedRoles="admin">
                  <AuditLogs />
                </ProtectedRoute>
              } />
              <Route path="/admin/annual-records" element={
                <ProtectedRoute allowedRoles="admin">
                  <AnnualRecords />
                </ProtectedRoute>
              } />
              <Route path="/admin/services" element={
                <ProtectedRoute allowedRoles="admin">
                  <ManageServices />
                </ProtectedRoute>
              } />

              {/* Manager Routes */}
              <Route path="/manager/dashboard" element={
                <ProtectedRoute allowedRoles={['manager', 'admin']}>
                  <ManagerDashboard />
                </ProtectedRoute>
              } />
              <Route path="/manager/profile" element={
                <ProtectedRoute allowedRoles={['manager', 'admin']}>
                  <ManagerProfile />
                </ProtectedRoute>
              } />
              <Route path="/manager/doctors" element={
                <ProtectedRoute allowedRoles={['manager', 'admin']}>
                  <ManagerDoctors />
                </ProtectedRoute>
              } />
              <Route path="/manager/appointments" element={
                <ProtectedRoute allowedRoles={['manager', 'admin']}>
                  <ManagerAppointments />
                </ProtectedRoute>
              } />
              <Route path="/manager/reviews" element={
                <ProtectedRoute allowedRoles={['manager', 'admin']}>
                  <ManagerReviews />
                </ProtectedRoute>
              } />
              <Route path="/manager/annual-reports" element={
                <ProtectedRoute allowedRoles={['manager', 'admin']}>
                  <AnnualReports />
                </ProtectedRoute>
              } />
              <Route path="/manager/services" element={
                <ProtectedRoute allowedRoles={['manager', 'admin']}>
                  <ManagerServices />
                </ProtectedRoute>
              } />

              {/* Default Route */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <PatientDashboard />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;