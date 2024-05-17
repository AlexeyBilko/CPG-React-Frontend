import React, { useState, useEffect } from 'react';
import { Container, AppBar, Toolbar, Link, TextField, Button, Typography, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Box } from '@mui/material';
import axios from '../../api/axios';
import useAuth from '../../hooks/useAuth';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

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

const ProfilePage = () => {
    const auth = useAuth();
    const [displayName, setDisplayName] = useState('');
    const [originalDisplayName, setOriginalDisplayName] = useState('');
    const [error, setError] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [isEditingDisplayName, setIsEditingDisplayName] = useState(false);
    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogType, setDialogType] = useState('');
    
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch user data
        const fetchUserData = async () => {
            try {
                const response = await axios.get(`/auth/user-details`, {
                    headers: { Authorization: `Bearer ${auth.accessToken}` }
                });
                setDisplayName(response.data.displayName);
                setOriginalDisplayName(response.data.displayName);
            } catch (err) {
                console.error('Failed to fetch user data:', err);
            }
        };

        fetchUserData();
    }, [auth.accessToken]);

    const handleDisplayNameChange = (e) => {
        setDisplayName(e.target.value);
        setIsEditingDisplayName(e.target.value !== originalDisplayName);
    };

    const handleOldPasswordChange = (e) => setOldPassword(e.target.value);
    const handleNewPasswordChange = (e) => setNewPassword(e.target.value);
    const handleConfirmNewPasswordChange = (e) => setConfirmNewPassword(e.target.value);

    const handleSaveDisplayName = () => {
        setDialogType('displayName');
        setOpenDialog(true);
    };

    const handleSavePassword = () => {
        setDialogType('password');
        setOpenDialog(true);
    };

    const handleDialogClose = () => setOpenDialog(false);

    const handleDialogConfirm = async () => {
        if (dialogType === 'displayName') {
            // Update display name
            try {
                await axios.put('/auth/updateDisplayName', { displayName }, {
                    headers: { Authorization: `Bearer ${auth.accessToken}` }
                });
                setIsEditingDisplayName(false);
                setOriginalDisplayName(displayName);
            } catch (err) {
                console.error('Failed to update display name:', err);
            }
        } else if (dialogType === 'password') {
            // Update password
            try {
                if (newPassword !== confirmNewPassword) {
                    throw new Error('New passwords do not match');
                }

                await axios.put('/auth/updatePassword', { oldPassword, newPassword }, {
                    headers: { Authorization: `Bearer ${auth.accessToken}` }
                });
                setOldPassword('');
                setNewPassword('');
                setConfirmNewPassword('');
                setIsEditingPassword(false);
            } catch (err) {
                console.error('Failed to update password:', err);
            }
        }
        setOpenDialog(false);
    };

    const handleLogout = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/auth/logout', {}, {
                headers: { Authorization: `Bearer ${auth.accessToken}` }
            });
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('userId');
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Log out failed');
        }
    };

    return (
        <Container maxWidth="lg">
            <Navigation handleLogout={handleLogout}/>
            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                minHeight="80vh"
                maxWidth="sm"
                mx="auto"
            >
                <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
                    User Profile
                </Typography>
                {error && <Typography color="error">{error}</Typography>}
                <Box component="form" sx={{ mt: 3 }}>
                    <TextField
                        fullWidth
                        label="Display Name"
                        name="displayName"
                        value={displayName}
                        onChange={handleDisplayNameChange}
                        margin="normal"
                    />
                    {isEditingDisplayName && (
                        <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={handleSaveDisplayName}>
                            Save
                        </Button>
                    )}
                    <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                        Change Password
                    </Typography>
                    <TextField
                        fullWidth
                        label="Old Password"
                        type="password"
                        name="oldPassword"
                        value={oldPassword}
                        onChange={handleOldPasswordChange}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="New Password"
                        type="password"
                        name="newPassword"
                        value={newPassword}
                        onChange={handleNewPasswordChange}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="Confirm New Password"
                        type="password"
                        name="confirmNewPassword"
                        value={confirmNewPassword}
                        onChange={handleConfirmNewPasswordChange}
                        margin="normal"
                    />
                    <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={handleSavePassword}>
                        Save Password
                    </Button>
                </Box>

                <Dialog open={openDialog} onClose={handleDialogClose}>
                    <DialogTitle>Confirm {dialogType === 'displayName' ? 'Display Name Change' : 'Password Change'}</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Are you sure you want to {dialogType === 'displayName' ? 'change your display name?' : 'change your password?'}
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleDialogClose} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={handleDialogConfirm} color="primary">
                            Confirm
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Container>
    );
};

export default ProfilePage;
