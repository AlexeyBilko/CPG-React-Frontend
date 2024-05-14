import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes
} from "react-router-dom";

import LoginPage from './Pages/AuthPage/LoginPage';
import RegisterPage from './Pages/AuthPage/RegisterPage';
import Dashboard from './Pages/Dashboard/Dashboard';
import CreatePaymentPage from './Pages/Dashboard/CreatePaymentPage';

function App() {
  return (
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create-payment-page" element={<CreatePaymentPage />} />
          <Route path="/edit-payment-page/:id" element={<CreatePaymentPage />} />
        </Routes>
      </Router>
  );
}

export default App;
