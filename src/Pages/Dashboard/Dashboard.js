import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Button, Typography } from '@mui/material';
import axios from '../../api/axios';

const Dashboard = () => {
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Validate token and check user authentication
    validateToken();
  }, [navigate]);

  const validateToken = async () => {
    const accessToken = localStorage.getItem('accessToken');
    console.log(accessToken);
    if (!accessToken) {
      navigate('/login');
    } else {
      try {
        const response = await axios.get('/auth/user-details', {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
        if (response.status !== 200) {
          throw new Error('User not authenticated');
        }
      } catch (err) {
        console.error('Authentication error:', err);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        navigate('/login');
      }
    }
  };

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      const accessToken = localStorage.getItem('accessToken');
      const regResponse = await axios.post('/auth/logout', {}, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      console.log('Logged Out:', regResponse.data);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Log out failed');
    }
  };

  return (
    <div style={{ width: '100%', textAlign: 'center' }}>
      {error && <Typography color="error">{error}</Typography>}
      <Typography variant="h5" sx={{ mb: 2 }}>
        Dashboard
      </Typography>
      <Button onClick={handleLogout} variant="contained" color="primary">
        Log Out
      </Button>
    </div>
  );
};

export default Dashboard;
