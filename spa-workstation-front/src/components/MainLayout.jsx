import React, { useState, useContext, useMemo, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    Box, CssBaseline, AppBar as MuiAppBar, Toolbar, Typography, IconButton,
    Drawer as MuiDrawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
    Divider, useTheme, useMediaQuery, Avatar, GlobalStyles, Fade, Tooltip, Badge,
    Popover, Button
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';

// --- 아이콘 불러오기 ---
import MenuIcon from '@mui/icons-material/Menu';
import BadgeIcon from '@mui/icons-material/Badge';
import HandshakeIcon from '@mui/icons-material/Handshake';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import DescriptionIcon from '@mui/icons-material/Description';
import InventoryIcon from '@mui/icons-material/Inventory';
import LogoutIcon from '@mui/icons-material/Logout';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import PersonIcon from '@mui/icons-material/Person';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';

import Swal from 'sweetalert2';
import { ColorModeContext } from '../context/ColorModeContext.jsx';
import RainbowLoader from '../components/RainbowLoader';

const drawerWidth = 200;
const headerHeight = 64;

// --- Mock Data ---
const INITIAL_NOTIFICATIONS = [
    { id: 1, type: 'warning', message: '재고 부족 경고: 제품 A-102', time: '10분 전', read: false },
    { id: 2, type: 'success', message: '신규 계약 체결 완료 (주)테크', time: '1시간 전', read: false },
    { id: 3, type: 'info', message: '주간 영업 회의 일정 안내', time: '3시간 전', read: true },
    { id: 4, type: 'info', message: '서버 정기 점검 예정', time: '1일 전', read: true },
];

const INITIAL_PROFILE_DATA = {
    name: '관리자',
    position: '시스템 관리팀',
    email: 'admin@workstation.com',
    phone: '010-0000-0000',
    department: 'Management'
};

// --- Mixins ---
const openedMixin = (theme) => ({
    width: drawerWidth,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
    borderRight: 'none',
});

const closedMixin = (theme) => ({
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: `calc(${theme.spacing(7)} + 1px)`,
    borderRight: 'none',
    [theme.breakpoints.up('sm')]: {
        width: `calc(${theme.spacing(9)} + 1px)`,
    },
});

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: theme.spacing(0, 2),
    minHeight: headerHeight,
}));

const AppBar = styled(MuiAppBar)(({ theme }) => ({
    zIndex: theme.zIndex.drawer + 1,
    backdropFilter: 'blur(8px)',
    backgroundColor: theme.palette.mode === 'dark'
        ? 'rgba(18, 18, 18, 0.8)'
        : 'rgba(255, 255, 255, 0.8)',
    color: theme.palette.text.primary,
    boxShadow: theme.palette.mode === 'dark'
        ? '0 1px 3px 0 rgba(0, 0, 0, 0.3)'
        : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    borderBottom: `1px solid ${theme.palette.divider}`,
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
        width: open ? drawerWidth : `calc(${theme.spacing(9)} + 1px)`,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        '& .MuiDrawer-paper': {
            width: open ? drawerWidth : `calc(${theme.spacing(9)} + 1px)`,
            position: 'fixed',
            backgroundColor: theme.palette.mode === 'dark'
                ? 'rgba(18, 18, 18, 0.95)'
                : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRight: 'none',
            overflowX: 'hidden',
            transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
            }),
            ...(open && {
                boxShadow: theme.palette.mode === 'dark'
                    ? '4px 0 24px rgba(0, 0, 0, 0.5)'
                    : '4px 0 24px rgba(0, 0, 0, 0.1)',
            }),
            ...(!open && {
                ...closedMixin(theme),
                '& .MuiDrawer-paper': closedMixin(theme),
            }),
        },
    }),
);

const TextWrapper = styled(Box)(({ theme, open }) => ({
    overflow: 'hidden',
    flex: 1,
    opacity: open ? 1 : 0,
    transition: 'opacity 0.2s ease-in-out',
    whiteSpace: 'nowrap',
    display: open ? 'block' : 'none',
}));

const LoaderContainer = styled('div', { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
        position: 'fixed',
        top: headerHeight,
        right: 0,
        zIndex: 1300,
        left: 0,
        transition: theme.transitions.create(['left', 'width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        [theme.breakpoints.up('sm')]: {
            ...(open && {
                marginLeft: drawerWidth,
                width: `calc(100% - ${drawerWidth}px)`,
                transition: theme.transitions.create(['margin', 'width'], {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.enteringScreen,
                }),
            }),
            ...(!open && {
                marginLeft: `calc(${theme.spacing(9)} + 1px)`,
                width: `calc(100% - calc(${theme.spacing(9)} + 1px))`,
            }),
        },
        [theme.breakpoints.down('sm')]: {
            marginLeft: 0,
            width: '100%',
        }
    }),
);

const StyledListItemButton = styled(ListItemButton)(({ theme, selected }) => ({
    margin: '4px 8px',
    borderRadius: '12px',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    '&.Mui-selected': {
        backgroundColor: theme.palette.mode === 'dark'
            ? 'rgba(144, 202, 249, 0.12)'
            : 'rgba(25, 118, 210, 0.08)',
        '&:hover': {
            backgroundColor: theme.palette.mode === 'dark'
                ? 'rgba(144, 202, 249, 0.16)'
                : 'rgba(25, 118, 210, 0.12)',
        },
    },
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
    },
}));

const PopoverPaperProps = (theme) => ({
    elevation: 4,
    sx: {
        overflow: 'visible',
        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
        mt: 1.5,
        borderRadius: '16px',
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(30, 30, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(12px)',
        border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
        '&::before': {
            content: '""',
            display: 'block',
            position: 'absolute',
            top: 0,
            right: 14,
            width: 10,
            height: 10,
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(30, 30, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)',
            transform: 'translateY(-50%) rotate(45deg)',
            zIndex: 0,
            borderLeft: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
            borderTop: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
        },
    },
});

const MainLayout = () => {
    const theme = useTheme();
    const colorMode = useContext(ColorModeContext);
    const isDesktop = useMediaQuery(theme.breakpoints.up('sm'));
    const navigate = useNavigate();
    const location = useLocation();

    const [mobileOpen, setMobileOpen] = useState(false);
    const [open, setOpen] = useState(false);

    // --- Popover States ---
    const [anchorElProfile, setAnchorElProfile] = useState(null);
    const [anchorElNoti, setAnchorElNoti] = useState(null);
    const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

    const [profileData, setProfileData] = useState(INITIAL_PROFILE_DATA);

    // --- Handlers ---
    const handleDrawerToggle = () => {
        if (!isDesktop) setMobileOpen(!mobileOpen);
        else setOpen(!open);
    };
    const handleMouseEnter = () => { if (isDesktop) setOpen(true); };
    const handleMouseLeave = () => { if (isDesktop) setOpen(false); };

    // Profile Handlers
    const handleProfileOpen = (event) => setAnchorElProfile(event.currentTarget);
    const handleProfileClose = () => setAnchorElProfile(null);

    // Notification Handlers
    const handleNotiOpen = (event) => setAnchorElNoti(event.currentTarget);
    const handleNotiClose = () => setAnchorElNoti(null);

    const handleMarkAsRead = (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };
    const handleMarkAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleSettings = () => {
        handleProfileClose();
        Swal.fire({
            icon: 'info',
            title: '서비스 준비중',
            text: '설정 페이지는 추후 업데이트 될 예정입니다.',
            confirmButtonColor: '#3085d6',
        });
    };

    const handleLogout = () => {
        handleProfileClose();
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
        { text: '직원 관리', icon: <BadgeIcon />, path: '/employees' },
        { text: '파트너 관리', icon: <HandshakeIcon />, path: '/partners' },
        { text: '고객 관리', icon: <PeopleIcon />, path: '/customers' },
        { text: 'Work Flow', icon: <TrendingUpIcon />, path: '/sales' },
        { text: '계약 관리', icon: <DescriptionIcon />, path: '/contracts' },
        { text: '제품 관리', icon: <InventoryIcon />, path: '/products' },
        { text: '차량 운행 일지', icon: <DirectionsCarIcon />, path: '/vehicle-log' },
    ];

    const currentTitle = useMemo(() => {
        const currentItem = menuItems.find(item => item.path === location.pathname);
        return currentItem ? currentItem.text : 'Work Station';
    }, [location.pathname]);

    const iconBoxWidth = (theme) => `calc(${theme.spacing(9)} + 1px - 16px)`;

    const drawerList = (
        <>
            <List sx={{ flexGrow: 1, p: 0 }}>
                {menuItems.map((item) => (
                    <Tooltip key={item.text} title={!open ? item.text : ''} placement="right" arrow>
                        <ListItem disablePadding sx={{ display: 'block', mb: 0.5 }}>
                            <StyledListItemButton
                                selected={location.pathname === item.path}
                                onClick={() => {
                                    navigate(item.path);
                                    if (!isDesktop) setMobileOpen(false);
                                }}
                                sx={{ minHeight: 48, justifyContent: 'flex-start', px: 0 }}
                            >
                                <ListItemIcon
                                    sx={{
                                        minWidth: iconBoxWidth(theme),
                                        justifyContent: 'center',
                                        mr: 0,
                                        color: location.pathname === item.path ? theme.palette.primary.main : theme.palette.text.secondary
                                    }}
                                >
                                    {item.icon}
                                </ListItemIcon>
                                <Fade in={open}>
                                    <ListItemText
                                        primary={item.text}
                                        sx={{
                                            opacity: open ? 1 : 0,
                                            display: open ? 'block' : 'none',
                                            color: location.pathname === item.path ? theme.palette.primary.main : theme.palette.text.primary,
                                        }}
                                        primaryTypographyProps={{ fontSize: '0.95rem', fontWeight: location.pathname === item.path ? 600 : 400, noWrap: true }}
                                    />
                                </Fade>
                            </StyledListItemButton>
                        </ListItem>
                    </Tooltip>
                ))}
            </List>
            <Divider sx={{ mx: 2 }} />
            <List sx={{ p: 0, pb: 2 }}>
                <Tooltip title={!open ? '로그아웃' : ''} placement="right" arrow>
                    <ListItem disablePadding sx={{ display: 'block', mt: 0.5 }}>
                        <StyledListItemButton onClick={handleLogout} sx={{ minHeight: 48, justifyContent: 'flex-start', px: 0 }}>
                            <ListItemIcon sx={{ minWidth: iconBoxWidth(theme), justifyContent: 'center', mr: 0, color: 'error.main', transition: 'color 0.2s' }}>
                                <LogoutIcon />
                            </ListItemIcon>
                            <TextWrapper open={open}>
                                <ListItemText primary="로그아웃" sx={{ color: 'error.main' }} primaryTypographyProps={{ fontSize: '0.95rem', fontWeight: 500, noWrap: true }} />
                            </TextWrapper>
                        </StyledListItemButton>
                    </ListItem>
                </Tooltip>
            </List>
        </>
    );

    const getNotiIcon = (type) => {
        switch (type) {
            case 'success': return <CheckCircleIcon color="success" fontSize="small" />;
            case 'warning': return <WarningIcon color="warning" fontSize="small" />;
            case 'info': default: return <InfoIcon color="info" fontSize="small" />;
        }
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <GlobalStyles styles={{ '.swal2-container': { zIndex: '2400 !important' } }} />

            <LoaderContainer open={open}>
                <RainbowLoader />
            </LoaderContainer>

            <AppBar position="fixed" elevation={0}>
                <Toolbar sx={{ minHeight: `${headerHeight}px !important` }}>
                    <IconButton
                        color="inherit"
                        aria-label="toggle drawer"
                        onClick={handleDrawerToggle}
                        edge="start"
                        sx={{ mr: 2, '&:hover': { backgroundColor: theme.palette.action.hover, transform: 'scale(1.1)' }, transition: 'all 0.2s' }}
                    >
                        <MenuIcon />
                    </IconButton>

                    <Typography
                        variant="h6"
                        noWrap
                        component="div"
                        sx={{
                            flexGrow: 1,
                            fontWeight: 600,
                            background: theme.palette.mode === 'dark'
                                ? 'linear-gradient(45deg, #90caf9 30%, #ce93d8 90%)'
                                : 'linear-gradient(45deg, #1976d2 30%, #9c27b0 90%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        {currentTitle}
                    </Typography>

                    <Tooltip title="알림" arrow>
                        <IconButton
                            color="inherit"
                            onClick={handleNotiOpen}
                            sx={{ mr: 1, '&:hover': { backgroundColor: theme.palette.action.hover } }}
                        >
                            <Badge badgeContent={unreadCount} color="error" max={99}>
                                <NotificationsIcon />
                            </Badge>
                        </IconButton>
                    </Tooltip>
                    <Popover
                        open={Boolean(anchorElNoti)}
                        anchorEl={anchorElNoti}
                        onClose={handleNotiClose}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                        PaperProps={PopoverPaperProps(theme)}
                    >
                        <Box sx={{ width: 360, maxHeight: 480, display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${theme.palette.divider}` }}>
                                <Typography variant="subtitle1" fontWeight={700}>알림 ({unreadCount})</Typography>
                                {unreadCount > 0 && (
                                    <Button size="small" startIcon={<DoneAllIcon />} onClick={handleMarkAllRead} sx={{ fontSize: '0.75rem' }}>
                                        모두 읽음
                                    </Button>
                                )}
                            </Box>
                            <List sx={{ overflowY: 'auto', p: 0 }}>
                                {notifications.length === 0 ? (
                                    <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                                        <Typography variant="body2">새로운 알림이 없습니다.</Typography>
                                    </Box>
                                ) : (
                                    notifications.map((noti) => (
                                        <ListItemButton
                                            key={noti.id}
                                            onClick={() => handleMarkAsRead(noti.id)}
                                            sx={{
                                                bgcolor: noti.read ? 'transparent' : alpha(theme.palette.primary.main, 0.05),
                                                borderLeft: noti.read ? '3px solid transparent' : `3px solid ${theme.palette.primary.main}`,
                                                '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.1) },
                                                transition: 'all 0.2s',
                                                py: 2
                                            }}
                                        >
                                            <ListItemIcon sx={{ minWidth: 40 }}>
                                                {getNotiIcon(noti.type)}
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={
                                                    <Typography variant="body2" fontWeight={noti.read ? 400 : 600} sx={{ mb: 0.5 }}>
                                                        {noti.message}
                                                    </Typography>
                                                }
                                                secondary={noti.time}
                                                secondaryTypographyProps={{ fontSize: '0.75rem' }}
                                            />
                                            {!noti.read && (
                                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'error.main', ml: 1 }} />
                                            )}
                                        </ListItemButton>
                                    ))
                                )}
                            </List>
                        </Box>
                    </Popover>

                    <Tooltip title={theme.palette.mode === 'dark' ? '라이트 모드' : '다크 모드'} arrow>
                        <IconButton
                            onClick={colorMode.toggleColorMode}
                            color="inherit"
                            sx={{
                                mr: 1,
                                '&:hover': { backgroundColor: theme.palette.action.hover, transform: 'rotate(180deg)' },
                                transition: 'all 0.3s'
                            }}
                        >
                            {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="프로필 설정" arrow>
                        <IconButton
                            onClick={handleProfileOpen}
                            sx={{ p: 0, '&:hover': { transform: 'scale(1.05)' }, transition: 'all 0.2s' }}
                        >
                            <Avatar
                                sx={{
                                    bgcolor: theme.palette.primary.main,
                                    width: 40, height: 40,
                                    border: `2px solid ${theme.palette.background.paper}`,
                                    boxShadow: theme.shadows[3]
                                }}
                            >
                                <PersonIcon />
                            </Avatar>
                        </IconButton>
                    </Tooltip>
                    <Popover
                        open={Boolean(anchorElProfile)}
                        anchorEl={anchorElProfile}
                        onClose={handleProfileClose}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                        PaperProps={PopoverPaperProps(theme)}
                    >
                        <Box sx={{ width: 300, p: 0 }}>
                            <Box sx={{
                                p: 3,
                                background: theme.palette.mode === 'dark'
                                    ? 'linear-gradient(135deg, rgba(144, 202, 249, 0.2) 0%, rgba(206, 147, 216, 0.2) 100%)'
                                    : 'linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(156, 39, 176, 0.1) 100%)',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5,
                                borderBottom: `1px solid ${theme.palette.divider}`
                            }}>
                                <Avatar sx={{ width: 64, height: 64, bgcolor: theme.palette.primary.main, boxShadow: theme.shadows[4] }}>
                                    <PersonIcon sx={{ fontSize: 40 }} />
                                </Avatar>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="h6" fontWeight={700}>{profileData.name}</Typography>
                                    <Typography variant="body2" color="text.secondary">{profileData.position}</Typography>
                                </Box>
                            </Box>
                            <Box sx={{ p: 2 }}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                                    <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: theme.palette.text.secondary }}>부서</span>
                                        <span style={{ fontWeight: 500 }}>{profileData.department}</span>
                                    </Typography>
                                    <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: theme.palette.text.secondary }}>이메일</span>
                                        <span style={{ fontWeight: 500 }}>{profileData.email}</span>
                                    </Typography>
                                    <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: theme.palette.text.secondary }}>연락처</span>
                                        <span style={{ fontWeight: 500 }}>{profileData.phone}</span>
                                    </Typography>
                                </Box>
                                <Divider sx={{ my: 2 }} />
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button
                                        variant="outlined"
                                        fullWidth
                                        startIcon={<SettingsIcon />}
                                        onClick={handleSettings}
                                        sx={{ borderRadius: '8px', textTransform: 'none' }}
                                    >
                                        설정
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="error"
                                        fullWidth
                                        startIcon={<LogoutIcon />}
                                        onClick={handleLogout}
                                        sx={{ borderRadius: '8px', textTransform: 'none', boxShadow: 'none' }}
                                    >
                                        로그아웃
                                    </Button>
                                </Box>
                            </Box>
                        </Box>
                    </Popover>
                </Toolbar>
            </AppBar>

            <MuiDrawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', sm: 'none' },
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        width: drawerWidth,
                        borderRight: 'none',
                    },
                }}
            >
                <DrawerHeader>
                    <Typography
                        variant="h6"
                        fontWeight="bold"
                        sx={{
                            background: theme.palette.mode === 'dark'
                                ? 'linear-gradient(45deg, #90caf9 30%, #ce93d8 90%)'
                                : 'linear-gradient(45deg, #1976d2 30%, #9c27b0 90%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        Work Station
                    </Typography>
                </DrawerHeader>
                <Divider sx={{ mx: 2 }} />

                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <List sx={{ flexGrow: 1, px: 1, pt: 2 }}>
                        {menuItems.map((item) => (
                            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                                <StyledListItemButton
                                    selected={location.pathname === item.path}
                                    onClick={() => {
                                        navigate(item.path);
                                        setMobileOpen(false);
                                    }}
                                >
                                    <ListItemIcon
                                        sx={{
                                            color: location.pathname === item.path
                                                ? theme.palette.primary.main
                                                : theme.palette.text.secondary
                                        }}
                                    >
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={item.text}
                                        sx={{
                                            color: location.pathname === item.path
                                                ? theme.palette.primary.main
                                                : theme.palette.text.primary
                                        }}
                                        primaryTypographyProps={{
                                            fontSize: '0.95rem',
                                            fontWeight: location.pathname === item.path ? 600 : 400
                                        }}
                                    />
                                </StyledListItemButton>
                            </ListItem>
                        ))}
                    </List>
                    <Divider sx={{ mx: 2 }} />
                    <List sx={{ px: 1, pb: 2 }}>
                        <ListItem disablePadding sx={{ mt: 0.5 }}>
                            <StyledListItemButton onClick={handleLogout}>
                                <ListItemIcon sx={{ color: 'error.main' }}>
                                    <LogoutIcon />
                                </ListItemIcon>
                                <ListItemText
                                    primary="로그아웃"
                                    sx={{ color: 'error.main' }}
                                    primaryTypographyProps={{
                                        fontSize: '0.95rem',
                                        fontWeight: 500
                                    }}
                                />
                            </StyledListItemButton>
                        </ListItem>
                    </List>
                </Box>
            </MuiDrawer>

            <Drawer
                variant="permanent"
                open={open}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                sx={{
                    display: { xs: 'none', sm: 'block' },
                }}
            >
                <DrawerHeader>
                    <Fade in={open}>
                        <Typography
                            variant="h6"
                            fontWeight="bold"
                            sx={{
                                opacity: open ? 1 : 0,
                                background: theme.palette.mode === 'dark'
                                    ? 'linear-gradient(45deg, #90caf9 30%, #ce93d8 90%)'
                                    : 'linear-gradient(45deg, #1976d2 30%, #9c27b0 90%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            Work Station
                        </Typography>
                    </Fade>
                </DrawerHeader>
                <Divider sx={{ mx: 2 }} />

                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', pt: 2 }}>
                    {drawerList}
                </Box>
            </Drawer>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    marginLeft: { xs: 0, sm: `calc(${theme.spacing(9)} + 1px)` },
                    transition: theme.transitions.create(['margin'], {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.leavingScreen,
                    }),
                }}
            >
                <DrawerHeader />
                <Outlet />
            </Box>
        </Box>
    );
};

export default MainLayout;