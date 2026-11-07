import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import IncomingCall from './components/IncomingCall';
import ProtectedRoute from './components/ProtectedRoute';

// Existing Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import Profile from './pages/Profile';
import Matching from './pages/Matching';
import VideoCallPage from './pages/VideoCallPage';
import Settings from './pages/Settings';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';

// Learn, Earn & Monetization Pages
import Courses from './pages/Courses';
import CourseDetails from './pages/CourseDetails';
import CoursePlayer from './pages/CoursePlayer';
import MyCourses from './pages/MyCourses';
import LiveClasses from './pages/LiveClasses';
import LiveClassroom from './pages/LiveClassroom';
import MyClasses from './pages/MyClasses';
import Mentors from './pages/Mentors';
import MentorProfile from './pages/MentorProfile';
import MentorApply from './pages/MentorApply';
import MentorDashboard from './pages/MentorDashboard';
import Pricing from './pages/Pricing';
import LearningTools from './pages/LearningTools';
import Progress from './pages/Progress';
import AdminDashboard from './pages/AdminDashboard';

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
              {/* Public & Marketplaces */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/courses/:courseId" element={<CourseDetails />} />
              <Route path="/classes" element={<LiveClasses />} />
              <Route path="/mentors" element={<Mentors />} />
              <Route path="/mentors/:mentorId" element={<MentorProfile />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/tools" element={<LearningTools />} />

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
                path="/members"
                element={
                  <ProtectedRoute>
                    <Members />
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

              {/* Practice & Calling */}
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

              {/* Learning Hub & Student Routes */}
              <Route
                path="/learn/courses/:courseId"
                element={
                  <ProtectedRoute>
                    <CoursePlayer />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-courses"
                element={
                  <ProtectedRoute>
                    <MyCourses />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-classes"
                element={
                  <ProtectedRoute>
                    <MyClasses />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/classroom/:classId"
                element={
                  <ProtectedRoute>
                    <LiveClassroom />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/progress"
                element={
                  <ProtectedRoute>
                    <Progress />
                  </ProtectedRoute>
                }
              />

              {/* Mentor Studio & Applications */}
              <Route
                path="/mentor/apply"
                element={
                  <ProtectedRoute>
                    <MentorApply />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mentor/dashboard"
                element={
                  <ProtectedRoute>
                    <MentorDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Admin Portal */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
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
