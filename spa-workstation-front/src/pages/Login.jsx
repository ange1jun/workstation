import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, TextField, Button, Typography, Box, Paper, useTheme, IconButton } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { ColorModeContext } from '../context/ColorModeContext';
import Swal from 'sweetalert2';
import axios from 'axios'; // 1. axios 임포트 추가

const Login = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const colorMode = useContext(ColorModeContext);

    const [loginData, setLoginData] = useState({
        userId: '',
        password: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLoginData({ ...loginData, [name]: value });
    };

    // 2. 로그인 핸들러 수정 (async/await 적용)
    const handleLogin = async (e) => {
        e.preventDefault();

        // 유효성 검사
        if (!loginData.userId || !loginData.password) {
            Swal.fire({
                icon: 'warning',
                title: '입력 확인',
                text: '아이디와 비밀번호를 모두 입력해주세요.'
            });
            return;
        }

        try {
            // 백엔드 통신 (포트 8080)
            const response = await axios.post('/api/auth/login', {
                userId: loginData.userId,
                password: loginData.password
            });

            // 3. 성공 시 처리
            const { token } = response.data; // 백엔드에서 보낸 token 추출

            // 토큰을 로컬 스토리지에 저장 (브라우저를 닫아도 유지됨)
            localStorage.setItem('accessToken', token);

            // 이후 요청 헤더에 토큰 자동 포함 설정 (선택 사항, 전역 설정 추천)
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            Swal.fire({
                icon: 'success',
                title: '로그인 성공',
                text: `${loginData.userId}님 환영합니다.`,
                timer: 1500,
                showConfirmButton: false
            }).then(() => {
                navigate('/Employees'); // 대시보드로 이동
            });

        } catch (error) {
            // 4. 실패 시 처리
            console.error("Login Error:", error);

            const errorMessage = error.response?.data || '접속 불가능합니다. 서버에 없는 계정입니다.';

            Swal.fire({
                icon: 'error',
                title: 'warning',
                text: typeof errorMessage === 'string' ? errorMessage : '서버 오류가 발생했습니다.'
            });
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