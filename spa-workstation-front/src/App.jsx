import React, { useState, useMemo, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box, Typography } from '@mui/material';

// Context (확장자 .jsx 명시)
import { ColorModeContext } from './context/ColorModeContext.jsx';

// 1. 페이지 및 레이아웃 컴포넌트 불러오기 (확장자 .jsx 명시)
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Employees from './pages/Employees.jsx';
import Customers from './pages/Customers';
import Contracts from './pages/Contracts.jsx';
import MainLayout from './components/MainLayout.jsx';

// 2. 임시 페이지 컴포넌트
const PlaceholderPage = ({ title }) => (
    <Box>
        <Typography variant="h4" fontWeight="bold">{title}</Typography>
        <Typography sx={{ mt: 2 }}>이 기능은 개발 중입니다.</Typography>
    </Box>
);

function App() {
    const [mode, setMode] = useState('dark');

    useEffect(() => {
        if (mode === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [mode]);

    const colorMode = useMemo(
        () => ({
            toggleColorMode: () => {
                setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
            },
        }),
        [],
    );

    const theme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode,
                    ...(mode === 'dark' && {
                        background: {
                            default: '#0a1929',
                            paper: '#1a2c3d',
                        },
                    }),
                },
                typography: {
                    fontFamily: 'Pretendard, sans-serif',
                }
            }),
        [mode],
    );



    return (
        <ColorModeContext.Provider value={colorMode}>
            <ThemeProvider theme={theme}>
                <CssBaseline />

                <Box
                    sx={{
                        minHeight: '100vh',
                        background: mode === 'dark'
                            ? 'linear-gradient(to bottom, #1a2c3d, #000305)'
                            : '#f5f5f5',
                        transition: 'background 0.5s ease',
                    }}
                >
                    <Routes>
                        <Route path="/" element={<Login />} />

                        <Route element={<MainLayout />}>
                            <Route path="/dashboard" element={<Dashboard />} />

                            <Route path="/employees" element={<Employees />} />

                            <Route path="/request" element={<PlaceholderPage title="작업 요청" />} />
                            <Route path="/partners" element={<PlaceholderPage title="파트너 관리" />} />

                            <Route path="/customers" element={<Customers />} />

                            <Route path="/sales" element={<PlaceholderPage title="영업 관리" />} />
                            <Route path="/contracts" element={<Contracts title="계약 관리" />} />
                            <Route path="/products" element={<PlaceholderPage title="제품 관리" />} />
                        </Route>

                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Box>
            </ThemeProvider>
        </ColorModeContext.Provider>
    );
}

export default App;