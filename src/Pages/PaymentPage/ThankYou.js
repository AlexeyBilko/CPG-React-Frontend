// src/Pages/ThankYou.js
import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const ThankYou = () => {
  return (
    <Container component="main" maxWidth="sm" sx={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <Box sx={{ width: '100%', textAlign: 'center' }}>
        <Typography component="h1" variant="h4">Thank You!</Typography>
        <Typography component="h2" variant="h6">Your payment has been successfully verified.</Typography>
      </Box>
    </Container>
  );
};

export default ThankYou;
