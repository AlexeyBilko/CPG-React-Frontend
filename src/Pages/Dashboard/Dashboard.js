import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Container, AppBar, Toolbar, Button, Typography, Table, TableBody, TableCell, TableHead, TableRow, IconButton, Link, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
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
      <Button onClick={handleLogout} variant="contained" color="primary">
        Log Out
      </Button>
    </Toolbar>
  </AppBar>
);

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
        console.log(getUserresponse.data);
        const response = await axios.get(`/PaymentPage/allbyuserid/${getUserresponse.data.id}`, {
          headers: { Authorization: `Bearer ${auth.accessToken}` }
        });
        setPaymentPages(response.data);
        console.log(response.data);
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

  return (
    // <div style={{ width: '100%', textAlign: 'center' }}>
    //   {error && <Typography color="error">{error}</Typography>}
    //   <Typography variant="h5" sx={{ mb: 2 }}>
    //     Dashboard
    //   </Typography>
    //   <Button onClick={handleLogout} variant="contained" color="primary">
    //     Log Out
    //   </Button>
    // </div>
    <Container maxWidth="lg">
      <Navigation handleLogout={handleLogout}/>
      {error && <Typography color="error">{error}</Typography>}
      <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
          Dashboard
      </Typography>
      <Button component={RouterLink} to="/create-payment-page" variant="contained" color="primary" sx={{ mb: 2 }}>
          Create Payment Page
      </Button>
      <Table>
          <TableHead>
              <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Amount USD</TableCell>
                  <TableCell>Amount Crypto</TableCell>
                  <TableCell>Currency Code</TableCell>
                  <TableCell>Actions</TableCell>
              </TableRow>
          </TableHead>
          <TableBody>
              {paymentPages.map((page) => (
                  <TableRow key={page.id}>
                      <TableCell>{page.id}</TableCell>
                      <TableCell>{page.description}</TableCell>
                      <TableCell>{page.amountDetails.amountUSD}</TableCell>
                      <TableCell>{page.amountDetails.amountCrypto}</TableCell>
                      <TableCell>{page.amountDetails.currency.currencyCode}</TableCell>
                      <TableCell>
                          <IconButton onClick={() => navigate(`/edit-payment-page/${page.id}`)}><EditIcon /></IconButton>
                          <IconButton onClick={() => handleClickOpen(page.id)}><DeleteIcon /></IconButton>
                      </TableCell>
                  </TableRow>
              ))}
          </TableBody>
      </Table>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Delete Payment Page"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this payment page? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={() => handleDelete(deleteId)} color="primary" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Dashboard;
