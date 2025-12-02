import React from 'react';
import { TableRow, TableCell, Box, CircularProgress, Typography } from '@mui/material';

const TableLoader = ({ colSpan = 10 }) => {
    return (
        <TableRow>
            <TableCell colSpan={colSpan} align="center" sx={{ height: '300px' }}>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 2
                    }}
                >
                    {/* MUI 기본 스피너 */}
                    <CircularProgress size={40} thickness={4} color="primary" />

                    {/* 깜빡임 효과 텍스트 */}
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ animation: 'pulse 1.5s infinite ease-in-out' }}
                    >
                        서버 데이터를 로드중입니다.
                    </Typography>

                    {/* Pulse 애니메이션 정의 */}
                    <style>
                        {`
                            @keyframes pulse {
                                0% { opacity: 0.6; }
                                50% { opacity: 1; }
                                100% { opacity: 0.6; }
                            }
                        `}
                    </style>
                </Box>
            </TableCell>
        </TableRow>
    );
};

export default TableLoader;