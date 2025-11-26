import React, { useState, useContext } from 'react'; // useContext 추가
import { useNavigate } from 'react-router-dom';
// IconButton 추가
import { Container, TextField, Button, Typography, Box, Paper, useTheme, IconButton } from '@mui/material';
// 아이콘 추가
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

// Context import 수정 (확장자 제거)
import { ColorModeContext } from '../context/ColorModeContext';

import Swal from 'sweetalert2';

const Login = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const colorMode = useContext(ColorModeContext); // [추가] 모드 변경 기능 가져오기

    const [loginData, setLoginData] = useState({
        userId: '',
        password: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLoginData({ ...loginData, [name]: value });
    };

    const handleLogin = (e) => {
        e.preventDefault();
        if (loginData.userId) {
            alert(`${loginData.userId}님 환영합니다.`);
            navigate('/dashboard');
        } else {
            alert("아이디를 입력해주세요.");
        }
    };

    return (
        <Box
            sx={{
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative'
            }}
        >
            <Box sx={{ position: 'absolute', top: 20, right: 20 }}>
                <IconButton onClick={colorMode.toggleColorMode} color="inherit" size="large">
                    {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>
            </Box>

            <Container maxWidth="xs">
                <Paper
                    elevation={6}
                    sx={{
                        padding: '40px 30px',
                        borderRadius: '16px',
                        backdropFilter: 'blur(10px)',
                    }}
                >
                    <Typography variant="h4" align="center" gutterBottom fontWeight="bold" color="text.primary">
                        Work Station
                    </Typography>

                    <Box component="form" onSubmit={handleLogin} sx={{ mt: 1 }}>
                        <TextField
                            fullWidth
                            label="계정"
                            name="userId"
                            variant="outlined"
                            margin="normal"
                            value={loginData.userId}
                            onChange={handleChange}
                            autoFocus
                        />
                        <TextField
                            fullWidth
                            label="비밀번호"
                            name="password"
                            type="password"
                            variant="outlined"
                            margin="normal"
                            value={loginData.password}
                            onChange={handleChange}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            sx={{
                                mt: 4,
                                mb: 2,
                                height: '50px',
                                fontSize: '1.1rem',
                                fontWeight: 'bold',
                                borderRadius: '8px',
                                ...(theme.palette.mode === 'dark' && {
                                    backgroundColor: '#90caf9',
                                    color: '#000',
                                    '&:hover': { backgroundColor: '#42a5f5' }
                                })
                            }}
                        >
                            접속
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default Login;