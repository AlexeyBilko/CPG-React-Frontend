import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container, AppBar, Toolbar, Button, Typography, Table, TableBody, TableCell, TableHead, TableRow,
  IconButton, Link, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Box, useMediaQuery
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PreviewIcon from '@mui/icons-material/Preview';
import axios from '../../api/axios';
import useAuth from '../../hooks/useAuth';
import { useTheme } from '@mui/material/styles';

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

const Dashboard = () => {
  const [paymentPages, setPaymentPages] = useState([]);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPaymentPages = async () => {
      try {
        const getUserresponse = await axios.get('/auth/user-details', {
          headers: { Authorization: `Bearer ${auth.accessToken}` }
        });
        const response = await axios.get(`/PaymentPage/allbyuserid/${getUserresponse.data.id}`, {
          headers: { Authorization: `Bearer ${auth.accessToken}` }
        });
        setPaymentPages(response.data);
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setError('No payment pages found for this user. Please create a new payment page.');
        } else {
          setError('Failed to fetch payment pages');
        }
      }
    };

    if (auth.accessToken) {
      fetchPaymentPages();
    }
  }, [auth.accessToken]);

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/auth/logout', {}, {
        headers: { Authorization: `Bearer ${auth.accessToken}` }
      });
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Log out failed');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/PaymentPage/delete/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      setPaymentPages(prevPages => prevPages.filter(page => page.id !== id));
      setOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete payment page');
    }
  };

  const handleClickOpen = (id) => {
    setDeleteId(id);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ bgcolor: '#FAF8FC', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#003366', fontFamily: 'Montserrat, sans-serif' }}>
      <Navigation handleLogout={handleLogout} />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {error && <Typography color="error">{error}</Typography>}
        <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
          Dashboard
        </Typography>
        <Button
          component={RouterLink}
          to="/create-payment-page"
          variant="contained"
          sx={{ mb: 2, bgcolor: '#003366', color: '#FAF8FC' }}
        >
          Create Payment Page
        </Button>
        {paymentPages.length === 0 ? (
          <Typography variant="body1" sx={{ mt: 4 }}>
            You haven't created any payment pages yet. You can create one by pressing "Create Payment Page".
          </Typography>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: 650, bgcolor: '#FAF8FC', borderRadius: 2 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: '#003366' }}>ID</TableCell>
                  <TableCell sx={{ color: '#003366' }}>Title</TableCell>
                  <TableCell sx={{ color: '#003366' }}>Description</TableCell>
                  <TableCell sx={{ color: '#003366' }}>Amount USD</TableCell>
                  <TableCell sx={{ color: '#003366' }}>Amount Crypto</TableCell>
                  <TableCell sx={{ color: '#003366' }}>Currency Code</TableCell>
                  <TableCell sx={{ color: '#003366' }}>Is Donation</TableCell>
                  <TableCell sx={{ color: '#003366' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paymentPages.map((page) => (
                  <TableRow key={page.id}>
                    <TableCell sx={{ color: '#003366' }}>{page.id}</TableCell>
                    <TableCell sx={{ color: '#003366' }}>{page.title}</TableCell>
                    <TableCell sx={{ color: '#003366', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 150 }}>{page.description}</TableCell>
                    <TableCell sx={{ color: '#003366' }}>{page.isDonation ? '-' : page.amountDetails.amountUSD}</TableCell>
                    <TableCell sx={{ color: '#003366' }}>{page.isDonation ? '-' : page.amountDetails.amountCrypto}</TableCell>
                    <TableCell sx={{ color: '#003366' }}>{page.amountDetails.currency.currencyCode}</TableCell>
                    <TableCell sx={{ color: '#003366' }}>{page.isDonation ? 'Yes' : 'No'}</TableCell>
                    <TableCell sx={{ color: '#003366', whiteSpace: 'nowrap' }}>
                      <IconButton onClick={() => navigate(`/payment/${page.id}`)} sx={{ color: '#003366' }}><PreviewIcon /></IconButton>
                      <IconButton onClick={() => navigate(`/edit-payment-page/${page.id}`)} sx={{ color: '#003366' }}><EditIcon /></IconButton>
                      <IconButton onClick={() => handleClickOpen(page.id)} sx={{ color: '#003366' }}><DeleteIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
        <Dialog
          open={open}
          onClose={handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title" sx={{ color: '#003366' }}>{"Delete Payment Page"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description" sx={{ color: '#E65B40' }}>
              Are you sure you want to delete this payment page? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} sx={{ color: '#003366' }}>
              Cancel
            </Button>
            <Button onClick={() => handleDelete(deleteId)} sx={{ color: '#E65B40' }} autoFocus>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
        <Typography variant="body1" sx={{ mt: 4, textAlign: 'center', color: '#003366' }}>
          Our project aims to simplify cryptocurrency payments, making them as easy as traditional methods.
        </Typography>
      </Container>
    </Box>
  );
};

export default Dashboard;
