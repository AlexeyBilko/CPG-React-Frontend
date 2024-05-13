import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Container, Box, Link, TextField, Button, Typography } from '@mui/material';
import axios from '../../api/axios';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const [userData, setUserData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
  
    if (!/^(?=.*[A-Z])(?=.*\d).{8,}$/.test(userData.password)) {
      setError("Password must be at least 8 characters long, include a number and an uppercase letter.");
      return;
    }
  
    if (userData.password !== userData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
  
    try {
      const regResponse = await axios.post('/Auth/register', {
        email: userData.email,
        password: userData.password,
        displayName: userData.displayName
      });
      console.log('Registered:', regResponse.data);
      const loginResponse = await axios.post('/Auth/login', {
        email: userData.email,
        password: userData.password
      });
      if (loginResponse.status === 200) {
        localStorage.setItem('accessToken', loginResponse.data.jwtToken);
        localStorage.setItem('refreshToken', loginResponse.data.refreshToken);
        navigate('/dashboard');
      } else {
        throw new Error(`Something went wrong, try to log in ${loginResponse.status} ${loginResponse.data.message}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };
  

  return (
    <Container component="main" maxWidth="sm" sx={{
      height: '100vh', // full height of the viewport
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center', // centers vertically
      alignItems: 'center' // centers horizontally
    }}>
      <Box 
        sx={{ 
          height: '100vh',
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', // Centers vertically
          width: { xs: '95%', sm: '50%' }, // Responsive width
          margin: 'auto' // Centering the form
        }}
      >
        <Typography component="h1" variant="h5" align="center" sx={{ mb: 3 }}>
          Register
        </Typography>
        <form onSubmit={handleRegister} style={{ width: '100%' }}>
          <TextField
            label="Email"
            variant="outlined"
            type="email"
            name="email"
            value={userData.email}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Password"
            variant="outlined"
            type="password"
            name="password"
            value={userData.password}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Confirm Password"
            variant="outlined"
            type="password"
            name="confirmPassword"
            value={userData.confirmPassword}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Display Name"
            variant="outlined"
            type="text"
            name="displayName"
            value={userData.displayName}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2, mb: 2 }}>
            Register
          </Button>
          {error && <Typography color="error" style={{ marginTop: '10px' }}>{error}</Typography>}
          <Link component={RouterLink} to="/login" variant="body2" style={{ marginBottom: '20px' }}>
            Already have an account? Login here
          </Link>
        </form>
      </Box>
    </Container>
  );
};

export default RegisterPage;
