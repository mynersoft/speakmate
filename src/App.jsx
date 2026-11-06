import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import IncomingCall from './components/IncomingCall';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Matching from './pages/Matching';
import VideoCallPage from './pages/VideoCallPage';
import Settings from './pages/Settings';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900">
          
          {/* Global incoming call pop-up notification */}
          <IncomingCall />

          {/* Navigation Bar */}
          <Navbar />

          {/* Main View Router */}
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />

              {/* Protected Member Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />

              {/* Protected Practice Routes */}
              <Route
                path="/matching"
                element={
                  <ProtectedRoute>
                    <Matching />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/call/:callId"
                element={
                  <ProtectedRoute>
                    <VideoCallPage />
                  </ProtectedRoute>
                }
              />

              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Footer */}
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
