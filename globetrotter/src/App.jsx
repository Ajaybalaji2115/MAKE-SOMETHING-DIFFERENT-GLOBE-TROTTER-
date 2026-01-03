import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import CreateTrip from './pages/CreateTrip';
import MyTrips from './pages/MyTrips';
import Search from './pages/Search';
import TripDetails from './pages/TripDetails';
import Profile from './pages/Profile';
import SharedItinerary from './pages/SharedItinerary';
import AdminDashboard from './pages/AdminDashboard';

import Signup from './pages/Signup';

// Placeholder components for future tasks

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

import { LanguageProvider } from './context/LanguageContext';

function App() {
  return (
    <LanguageProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/share/:id" element={<SharedItinerary />} />

          {/* Protected Routes */}
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="my-trips" element={<MyTrips />} />
            <Route path="create-trip" element={<CreateTrip />} />
            <Route path="edit-trip/:id" element={<CreateTrip />} />
            <Route path="trips/:id" element={<TripDetails />} />
            <Route path="search" element={<Search />} />
            <Route path="profile" element={<Profile />} />
            <Route path="dashboard/admin" element={<AdminDashboard />} />
          </Route>
        </Routes>
      </Router>
    </LanguageProvider>
  );
}

export default App;
