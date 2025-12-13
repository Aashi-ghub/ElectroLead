import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import BuyerDashboard from './pages/BuyerDashboard';
import SellerDashboard from './pages/SellerDashboard';
import CreateEnquiry from './pages/CreateEnquiry';
import MyEnquiries from './pages/MyEnquiries';
import EnquiryDetail from './pages/EnquiryDetail';
import AvailableEnquiries from './pages/AvailableEnquiries';
import SubmitQuote from './pages/SubmitQuote';
import MyQuotations from './pages/MyQuotations';
import Profile from './pages/Profile';
import Subscription from './pages/Subscription';
import AdminDashboard from './pages/AdminDashboard';
import PrivateRoute from './components/PrivateRoute';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to={`/dashboard/${user.role}`} />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to={`/dashboard/${user.role}`} />} />

      <Route
        path="/dashboard/buyer"
        element={
          <PrivateRoute role="buyer">
            <BuyerDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard/buyer/create-enquiry"
        element={
          <PrivateRoute role="buyer">
            <CreateEnquiry />
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard/buyer/enquiries"
        element={
          <PrivateRoute role="buyer">
            <MyEnquiries />
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard/buyer/enquiries/:id"
        element={
          <PrivateRoute role="buyer">
            <EnquiryDetail />
          </PrivateRoute>
        }
      />

      <Route
        path="/dashboard/seller"
        element={
          <PrivateRoute role="seller">
            <SellerDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard/seller/enquiries"
        element={
          <PrivateRoute role="seller">
            <AvailableEnquiries />
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard/seller/enquiries/:id/quote"
        element={
          <PrivateRoute role="seller">
            <SubmitQuote />
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard/seller/quotations"
        element={
          <PrivateRoute role="seller">
            <MyQuotations />
          </PrivateRoute>
        }
      />

      <Route
        path="/dashboard/admin"
        element={
          <PrivateRoute role="admin">
            <AdminDashboard />
          </PrivateRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        }
      />

      <Route
        path="/subscription"
        element={
          <PrivateRoute role="seller">
            <Subscription />
          </PrivateRoute>
        }
      />

      <Route path="/" element={<Navigate to={user ? `/dashboard/${user.role}` : '/login'} />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
