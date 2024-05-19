import React, { useState, useEffect } from 'react';
import { Container, AppBar, Toolbar, Button, Typography, Table, TableBody, TableCell, TableHead, TableRow, Link, Box, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import axios from '../../api/axios';
import useAuth from '../../hooks/useAuth';
import { Link as RouterLink } from 'react-router-dom';

const Navigation = ({ handleLogout }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <AppBar position="static" sx={{ bgcolor: '#FAF8FC' }}>
      <Toolbar>
        {!isMobile && (
          <Typography variant="h6" sx={{ flexGrow: 1, color: '#003366' }}>
            Crypto Payment Gateway
          </Typography>
        )}
        <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', mx: 'auto' }}>
          <Link component={RouterLink} to="/dashboard" color="inherit" sx={{ m: 3, color: '#003366' }}>
            Dashboard
          </Link>
          <Link component={RouterLink} to="/earnings" color="inherit" sx={{ m: 3, color: '#003366' }}>
            Earnings
          </Link>
          <Link component={RouterLink} to="/profile" color="inherit" sx={{ m: 3, color: '#003366' }}>
            Profile
          </Link>
        </Box>
        <Button onClick={handleLogout} variant="contained" sx={{ m: 2, bgcolor: '#003366', color: '#FAF8FC' }}>
          Log Out
        </Button>
      </Toolbar>
    </AppBar>
  );
};

const EarningsPage = () => {
  const [earnings, setEarnings] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [error, setError] = useState('');
  const [openWithdrawDialog, setOpenWithdrawDialog] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawCurrency, setWithdrawCurrency] = useState('BTC');
  const [withdrawWallet, setWithdrawWallet] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const auth = useAuth();

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const response = await axios.get('/Earnings/view-earnings', {
          headers: { Authorization: `Bearer ${auth.accessToken}` }
        });
        setEarnings(response.data);
      } catch (err) {
        setError('Failed to fetch earnings');
      }
    };

    const fetchWithdrawals = async () => {
      try {
        const response = await axios.get('/Earnings/view-withdrawal-history', {
          headers: { Authorization: `Bearer ${auth.accessToken}` }
        });
        setWithdrawals(response.data);
      } catch (err) {
        setError('Failed to fetch withdrawals');
      }
    };

    fetchEarnings();
    fetchWithdrawals();
  }, [auth.accessToken]);

  const handleWithdraw = async () => {
    try {
      await axios.post('/Earnings/withdraw-earnings', {
        WalletNumber: withdrawWallet,
        Amount: parseFloat(withdrawAmount),
        CurrencyCode: withdrawCurrency
      }, {
        headers: { Authorization: `Bearer ${auth.accessToken}` }
      });
      setOpenWithdrawDialog(false);
    } catch (err) {
      setError('Failed to withdraw earnings');
    }
  };

  const handleGenerateReport = async () => {
    try {
      const response = await axios.get('/Earnings/generate-earnings-report', {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        },
        headers: { Authorization: `Bearer ${auth.accessToken}` }
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'EarningsReport.pdf');
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      setError('Failed to generate report');
    }
  };

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/auth/logout', {}, {
        headers: { Authorization: `Bearer ${auth.accessToken}` }
      });
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } catch (err) {
      setError('Log out failed');
    }
  };

  return (
    <Box sx={{ bgcolor: '#FAF8FC', minHeight: '100vh', color: '#003366', fontFamily: 'Montserrat, sans-serif' }}>
      <Navigation handleLogout={handleLogout} />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {error && <Typography color="error">{error}</Typography>}
        <Typography variant="h4" sx={{ mb: 2, color: '#003366' }}>Earnings</Typography>
        {earnings && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6">Total Earnings</Typography>
            <Typography variant="body1">BTC: {earnings.TotalEarningsBtc}</Typography>
            <Typography variant="body1">ETH: {earnings.TotalEarningsEth}</Typography>
            <Typography variant="body1">USD: {earnings.TotalEarningsUsd}</Typography>
          </Box>
        )}
        <Button variant="contained" sx={{ mb: 2, bgcolor: '#003366', color: '#FAF8FC' }} onClick={() => setOpenWithdrawDialog(true)}>
          Withdraw Earnings
        </Button>
        <Button variant="contained" sx={{ mb: 2, bgcolor: '#003366', color: '#FAF8FC' }} onClick={handleGenerateReport}>
          Generate PDF Report
        </Button>
        {withdrawals.length === 0 ? (
          <Typography variant="body1">You have no withdrawal history.</Typography>
        ) : (
          <Table sx={{ minWidth: 650, bgcolor: '#FAF8FC', borderRadius: 2 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: '#003366' }}>ID</TableCell>
                <TableCell sx={{ color: '#003366' }}>Amount</TableCell>
                <TableCell sx={{ color: '#003366' }}>Currency</TableCell>
                <TableCell sx={{ color: '#003366' }}>Status</TableCell>
                <TableCell sx={{ color: '#003366' }}>Requested Date</TableCell>
                <TableCell sx={{ color: '#003366' }}>Completed Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {withdrawals.map((withdrawal) => (
                <TableRow key={withdrawal.id}>
                  <TableCell sx={{ color: '#003366' }}>{withdrawal.id}</TableCell>
                  <TableCell sx={{ color: '#003366' }}>{withdrawal.amountDetails.amountCrypto}</TableCell>
                  <TableCell sx={{ color: '#003366' }}>{withdrawal.amountDetails.currency.currencyCode}</TableCell>
                  <TableCell sx={{ color: '#003366' }}>{withdrawal.status}</TableCell>
                  <TableCell sx={{ color: '#003366' }}>{new Date(withdrawal.requestedDate).toLocaleDateString()}</TableCell>
                  <TableCell sx={{ color: '#003366' }}>{withdrawal.completedDate ? new Date(withdrawal.completedDate).toLocaleDateString() : 'Pending'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <Dialog
          open={openWithdrawDialog}
          onClose={() => setOpenWithdrawDialog(false)}
        >
          <DialogTitle>Withdraw Earnings</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Enter the details to withdraw your earnings.
              </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              label="Amount"
              type="number"
              fullWidth
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
            />
            <TextField
              margin="dense"
              label="Wallet Address"
              type="text"
              fullWidth
              value={withdrawWallet}
              onChange={(e) => setWithdrawWallet(e.target.value)}
            />
            <TextField
              margin="dense"
              label="Currency (BTC/ETH)"
              type="text"
              fullWidth
              value={withdrawCurrency}
              onChange={(e) => setWithdrawCurrency(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenWithdrawDialog(false)} color="primary">
              Cancel
            </Button>
            <Button onClick={handleWithdraw} color="primary">
              Withdraw
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default EarningsPage;
