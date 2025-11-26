import React, { useState, useContext } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    Box, CssBaseline, AppBar, Toolbar, Typography, IconButton,
    Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
    Divider, useTheme, useMediaQuery, Avatar, GlobalStyles
} from '@mui/material';

// 아이콘 불러오기
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BadgeIcon from '@mui/icons-material/Badge';
import HandshakeIcon from '@mui/icons-material/Handshake';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import DescriptionIcon from '@mui/icons-material/Description';
import InventoryIcon from '@mui/icons-material/Inventory';
import LogoutIcon from '@mui/icons-material/Logout';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

import Swal from 'sweetalert2';

// Context import (확장자 .jsx 명시하여 오류 해결)
import { ColorModeContext } from '../context/ColorModeContext.jsx';

const drawerWidth = 240;

const MainLayout = () => {
    const theme = useTheme();
    const colorMode = useContext(ColorModeContext);
    const isDesktop = useMediaQuery(theme.breakpoints.up('sm'));
    const navigate = useNavigate();
    const location = useLocation();

    const [mobileOpen, setMobileOpen] = useState(false);
    const [desktopOpen, setDesktopOpen] = useState(true);

    const handleDrawerToggle = () => {
        if (!isDesktop) {
            setMobileOpen(!mobileOpen);
        } else {
            setDesktopOpen(!desktopOpen);
        }
    };

    // 로그아웃 핸들러
    const handleLogout = () => {

        Swal.fire({
            title: '로그아웃',
            text: "정말로 로그아웃 하시겠습니까?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d6303e',
            cancelButtonColor: '#222b91',
            confirmButtonText: '네, 로그아웃합니다.',
            cancelButtonText: '아니요, 유지할래요'
        }).then((result) => {
            if (result.isConfirmed) {
                navigate('/');
            }
        });
    };

    const menuItems = [
        { text: '대시보드', icon: <DashboardIcon />, path: '/dashboard' },
        { text: '직원관리', icon: <BadgeIcon />, path: '/employees' },
        { text: '파트너관리', icon: <HandshakeIcon />, path: '/partners' },
        { text: '고객관리', icon: <PeopleIcon />, path: '/customers' },
        { text: '영업관리', icon: <TrendingUpIcon />, path: '/sales' },
        { text: '계약관리', icon: <DescriptionIcon />, path: '/contracts' },
        { text: '제품관리', icon: <InventoryIcon />, path: '/products' },
    ];

    const drawerContent = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Toolbar sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Typography variant="h6" noWrap component="div" fontWeight="bold">
                    Work Station
                </Typography>
            </Toolbar>
            <Divider />

            <List sx={{ flexGrow: 1 }}>
                {menuItems.map((item) => (
                    <ListItem key={item.text} disablePadding>
                        <ListItemButton
                            selected={location.pathname === item.path}
                            onClick={() => {
                                navigate(item.path);
                                if(!isDesktop) setMobileOpen(false);
                            }}
                            sx={{
                                '&.Mui-selected': {
                                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(144, 202, 249, 0.16)' : 'rgba(25, 118, 210, 0.08)',
                                    borderRight: `4px solid ${theme.palette.primary.main}`
                                },
                                '&:hover': {
                                    backgroundColor: theme.palette.action.hover,
                                }
                            }}
                        >
                            <ListItemIcon sx={{ color: location.pathname === item.path ? theme.palette.primary.main : 'inherit' }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>

            <Divider />

            <List>
                <ListItem disablePadding>
                    <ListItemButton
                        onClick={handleLogout}
                        sx={{
                            justifyContent: 'center',
                            py: 1.5
                        }}
                    >
                        <ListItemIcon sx={{
                            minWidth: 'auto',
                            mr: 1,
                            color: 'error.main'
                        }}>
                            <LogoutIcon />
                        </ListItemIcon>
                    </ListItemButton>
                </ListItem>
            </List>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <CssBaseline />

            {/* SweetAlert2 z-index 보정 (로컬 사용 시 유효) */}
            <GlobalStyles styles={{
                '.swal2-container': {
                    zIndex: '2400 !important'
                }
            }} />

            <AppBar
                position="fixed"
                sx={{
                    width: { sm: desktopOpen ? `calc(100% - ${drawerWidth}px)` : '100%' },
                    ml: { sm: desktopOpen ? `${drawerWidth}px` : 0 },
                    bgcolor: theme.palette.background.paper,
                    color: theme.palette.text.primary,
                    boxShadow: 1,
                    backgroundImage: 'none',
                    transition: theme.transitions.create(['width', 'margin'], {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.leavingScreen,
                    }),
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2 }}
                    >
                        <MenuIcon />
                    </IconButton>

                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                        {menuItems.find(item => item.path === location.pathname)?.text || 'Work Station'}
                    </Typography>

                    <IconButton onClick={colorMode.toggleColorMode} color="inherit">
                        {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                    </IconButton>

                    <Box sx={{ ml: 2 }}>
                        <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 32, height: 32 }}>K</Avatar>
                    </Box>
                </Toolbar>
            </AppBar>

            <Box
                component="nav"
                sx={{
                    width: { sm: desktopOpen ? drawerWidth : 0 },
                    flexShrink: { sm: 0 },
                    transition: theme.transitions.create('width', {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.leavingScreen,
                    }),
                }}
            >
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                >
                    {drawerContent}
                </Drawer>

                <Drawer
                    variant="persistent"
                    open={desktopOpen}
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                >
                    {drawerContent}
                </Drawer>
            </Box>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { sm: desktopOpen ? `calc(100% - ${drawerWidth}px)` : '100%' },
                    mt: 8,
                    transition: theme.transitions.create(['width', 'margin'], {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.leavingScreen,
                    }),
                }}
            >
                <Outlet />
            </Box>
        </Box>
    );
};

export default MainLayout;