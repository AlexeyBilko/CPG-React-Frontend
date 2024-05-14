import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import { Container, AppBar, Toolbar, Button, Typography, TextField, Link, Select, MenuItem, Box } from '@mui/material';
import axios from '../../api/axios';
import useAuth from '../../hooks/useAuth';

const Navigation = ({ handleLogout }) => (
  <AppBar position="static">
    <Toolbar>
      <Typography variant="h6" sx={{ flexGrow: 1 }}>
        Crypto Payment Gateway
      </Typography>
      <Link component={RouterLink} to="/dashboard" color="inherit" sx={{ ml: 2 }}>
        Dashboard
      </Link>
      <Link component={RouterLink} to="/earnings" color="inherit" sx={{ ml: 2 }}>
        Earnings
      </Link>
      <Link component={RouterLink} to="/profile" color="inherit" sx={{ ml: 2 }}>
        Profile
      </Link>
      <Button component={RouterLink} to="/dashboard" variant="contained" color="primary">
        Back to Dashboard
      </Button>
    </Toolbar>
  </AppBar>
);

const CreatePaymentPage = () => {
  const { id } = useParams();
  const [paymentPage, setPaymentPage] = useState({
    description: '',
    amountUSD: '',
    amountCrypto: '',
    currencyCode: 'BTC',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const auth = useAuth();

  useEffect(() => {
    const fetchPaymentPage = async () => {
      try {
        const response = await axios.get(`/PaymentPage/${id}`, {
          headers: { Authorization: `Bearer ${auth.accessToken}` }
        });
        if (response.data.userId !== auth.userId) {
            navigate('/dashboard');
          } else {
            setPaymentPage({
              description: response.data.description,
              amountUSD: response.data.amountDetails.amountUSD,
              amountCrypto: response.data.amountDetails.amountCrypto,
              currencyCode: response.data.amountDetails.currency.currencyCode,
            });
          }
      } catch (err) {
        setError('Failed to fetch payment page');
        navigate('/dashboard');
      }
    };

    if (id) {
      fetchPaymentPage();
    }
  }, [id, auth.accessToken, auth.userId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPaymentPage(prevState => ({
      ...prevState,
      [name]: value
    }));

    if (name === 'amountCrypto' && value) {
        convertCryptoToUSD(value);
      } else if (name === 'amountUSD' && value) {
        convertUSDToCrypto(value);
      }
  };

  const convertCryptoToUSD = async (cryptoAmount) => {
    try {
      const response = await axios.post('/PaymentPage/convertToUSD', {
        cryptoAmount: parseFloat(cryptoAmount),
        currencyCode: paymentPage.currencyCode
      }, {
        headers: { Authorization: `Bearer ${auth.accessToken}` }
      });
      setPaymentPage(prevState => ({
        ...prevState,
        amountUSD: response.data.amountUSD
      }));
    } catch (err) {
        setError('Failed to convert crypto to USD: ' + err.response?.data?.Error || err.message);
    }
  };

  const convertUSDToCrypto = async (usdAmount) => {
    try {
      const response = await axios.post('/PaymentPage/convertToCrypto', {
        usdAmount: parseFloat(usdAmount),
        currencyCode: paymentPage.currencyCode
      }, {
        headers: { Authorization: `Bearer ${auth.accessToken}` }
      });
      setPaymentPage(prevState => ({
        ...prevState,
        amountCrypto: response.data.amountCrypto
      }));
    } catch (err) {
        setError('Failed to convert USD to crypto: ' + err.response?.data?.Error || err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (paymentPage.amountUSD < 100) {
        setError('Amount USD must be at least 100.');
        return;
    }
    if (paymentPage.amountCrypto < 0.001) {
        setError('Amount Crypto must be at least 0.001.');
        return;
    }

    try {
      const payload = {
        description: paymentPage.description,
        amountUSD: paymentPage.amountUSD,
        amountCrypto: paymentPage.amountCrypto,
        currencyCode: paymentPage.currencyCode
      };

      if (id) {
        await axios.put('/PaymentPage/update', payload, {
          headers: { Authorization: `Bearer ${auth.accessToken}` }
        });
      } else {
        await axios.post('/PaymentPage/create', payload, {
          headers: { Authorization: `Bearer ${auth.accessToken}` }
        });
      }
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to save payment page');
    }
  };

  return (
    <Container maxWidth="lg">
      <Navigation  />
      <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
        {id ? 'Update' : 'Create'} Payment Page
      </Typography>
      {error && <Typography color="error">{error}</Typography>}
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
        <TextField
          fullWidth
          label="Description"
          name="description"
          value={paymentPage.description}
          onChange={handleChange}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Amount USD"
          name="amountUSD"
          value={paymentPage.amountUSD}
          onChange={handleChange}
          margin="normal"
          required
          disabled={!!id} // Disable amount fields when editing
        />
        <TextField
          fullWidth
          label="Amount Crypto"
          name="amountCrypto"
          value={paymentPage.amountCrypto}
          onChange={handleChange}
          margin="normal"
          required
          disabled={!!id} // Disable amount fields when editing
        />
        <Select
          fullWidth
          label="Currency Code"
          name="currencyCode"
          value={paymentPage.currencyCode}
          onChange={handleChange}
          margin="normal"
          required
          disabled={!!id} // Disable currency selection when editing
        >
          <MenuItem value="BTC">BTC</MenuItem>
          <MenuItem value="ETH">ETH</MenuItem>
        </Select>
        <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
          {id ? 'Update' : 'Create'} Payment Page
        </Button>
      </Box>
    </Container>
  );
};

export default CreatePaymentPage;
