import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Services from './pages/Services';
import Doctors from './pages/Doctors';
import Booking from './pages/Booking';
import PatientDashboard from './pages/PatientDashboard';
import PatientHome from './pages/patient/PatientHome';
import PatientAppointments from './pages/patient/PatientAppointments';
import MedicalHistory from './pages/patient/MedicalHistory';
import PatientSettings from './pages/patient/PatientSettings';
import DoctorDashboard from './pages/DoctorDashboard';
import DoctorSchedule from './pages/doctor/DoctorSchedule';
import DoctorPatients from './pages/doctor/DoctorPatients';
import DoctorEarnings from './pages/doctor/DoctorEarnings';
import DoctorSettings from './pages/doctor/DoctorSettings';
import DoctorSlots from './pages/doctor/DoctorSlots';
import AdminDashboard from './pages/AdminDashboard';
import Unauthorized from './pages/Unauthorized';

function App() {
  return (
    <AuthProvider>
    <Router>
      <Routes>
        {/* Public routes with standard layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="services" element={<Services />} />
          <Route path="doctors" element={<Doctors />} />

          {/* Protected: Patient only */}
          <Route path="booking/:doctorId" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <Booking />
            </ProtectedRoute>
          } />

          {/* Protected: Patient Dashboard */}
          <Route path="dashboard" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PatientDashboard />
            </ProtectedRoute>
          }>
            <Route index element={<PatientHome />} />
            <Route path="appointments" element={<PatientAppointments />} />
            <Route path="medical-history" element={<MedicalHistory />} />
            <Route path="settings" element={<PatientSettings />} />
          </Route>

          {/* Protected: Doctor only — nested sub-routes */}
          <Route path="doctor-panel" element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorDashboard />
            </ProtectedRoute>
          }>
            <Route index element={<DoctorSchedule />} />
            <Route path="patients" element={<DoctorPatients />} />
            <Route path="earnings" element={<DoctorEarnings />} />
            <Route path="settings" element={<DoctorSettings />} />
            <Route path="slots" element={<DoctorSlots />} />
          </Route>
        </Route>

        {/* Protected: Admin only (no standard layout — admin has its own) */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        {/* Auth routes (full screen, no layout) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Unauthorized page */}
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Routes>
    </Router>
    </AuthProvider>
  );
}

export default App;
