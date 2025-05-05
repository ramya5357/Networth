import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CustomerProvider } from './contexts/CustomerContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import CustomerDetail from './pages/CustomerDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import AddCustomer from './pages/AddCustomer';
import AddLoan from './pages/AddLoan';
import RecordRepayment from './pages/RecordRepayment';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <CustomerProvider>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                <Route path="/" element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }>
                  <Route index element={<Dashboard />} />
                  <Route path="customers/add" element={<AddCustomer />} />
                  <Route path="customers/:id" element={<CustomerDetail />} />
                  <Route path="customers/:id/loans/add" element={<AddLoan />} />
                  <Route path="customers/:id/repayments/add" element={<RecordRepayment />} />
                </Route>
                
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </CustomerProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;