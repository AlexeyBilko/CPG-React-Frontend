// src/Pages/PaymentPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, TextField, Button, Box, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import axios from '../../api/axios';

const PaymentPage = () => {
  const { id } = useParams();
  const [paymentPage, setPaymentPage] = useState({});
  const [guestWalletAddress, setGuestWalletAddress] = useState('');
  const [copyText, setCopyText] = useState('Copy');
  const [copyCryptoText, setCopyCryptoText] = useState('Copy');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');

  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPaymentPage = async () => {
      try {
        const response = await axios.get(`/PaymentPage/${id}`);
        setPaymentPage(response.data);
      } catch (err) {
        console.error('Failed to fetch payment page:', err);
      }
    };

    if (id) {
      fetchPaymentPage();
    }
  }, [id]);

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text).then(() => {
        if (type === 'address') {
            setCopyText('Copied!');
            setTimeout(() => setCopyText('Copy'), 2000);
        } else if (type === 'crypto') {
            setCopyCryptoText('Copied!');
            setTimeout(() => setCopyCryptoText('Copy'), 2000);
        }
    });
  };

  const handleVerifyPayment = async () => {
    try {
      const response = await axios.get('/Transaction/verify', {
        params: {
          type: paymentPage.amountDetails.currency.currencyCode.toLowerCase(),
          fromWallet: guestWalletAddress,
          toWallet: paymentPage.systemWallet.walletNumber,
          amountCrypto: paymentPage.amountDetails.amountCrypto,
          isTestnet: true
        }
      });

      if (response.data.status === 'not found') {
        setDialogMessage('Transaction not found.');
      } else if (response.data.status === 'pending') {
        setDialogMessage('Transaction pending.');
      } else if (response.data.status === 'successful') {
        navigate('/thank-you');
      }
    } catch (err) {
      setDialogMessage('Failed to verify payment.');
    }
    setDialogOpen(true);
  };

  return (
    <Container component="main" maxWidth="sm" sx={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <Box sx={{ width: '100%', textAlign: 'center' }}>
        <Typography component="h1" variant="h4">{paymentPage.title}</Typography>
        <Typography component="h2" variant="h6">{paymentPage.description}</Typography>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1">Cryptocurrency: {paymentPage.amountDetails?.currency?.currencyCode}</Typography>
          <Typography variant="body1">Amount USD: {paymentPage.amountDetails?.amountUSD}</Typography>
          <TextField
            fullWidth
            label="Amount Crypto:"
            value={paymentPage.amountDetails?.amountCrypto || ''}
            InputProps={{
              readOnly: true,
              endAdornment: (
                <Button onClick={() => handleCopy(paymentPage.amountDetails.amountCrypto, 'crypto')}>{copyCryptoText}</Button>
              )
            }}
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            label="System Wallet Address"
            value={paymentPage.systemWallet?.walletNumber || ''}
            InputProps={{
              readOnly: true,
              endAdornment: (
                <Button onClick={() => handleCopy(paymentPage.systemWallet?.address, 'address')}>{copyText}</Button>
              )
            }}
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            label="Your Wallet Address"
            value={guestWalletAddress}
            onChange={(e) => setGuestWalletAddress(e.target.value)}
            sx={{ mt: 2 }}
          />
          <Button variant="contained" color="primary" onClick={handleVerifyPayment} sx={{ mt: 2 }}>Verify Payment</Button>
        </Box>
      </Box>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Payment Status</DialogTitle>
        <DialogContent>
          <DialogContentText>{dialogMessage}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="primary">Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PaymentPage;