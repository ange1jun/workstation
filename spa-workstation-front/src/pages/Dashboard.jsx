import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';


const Dashboard = () => {
    return (
        <Box>
            <Typography variant="h4" gutterBottom fontWeight="bold">
                대시보드
            </Typography>
            <Typography paragraph color="text.secondary">
                전체 업무 현황을 한눈에 확인하세요.
            </Typography>

            <Grid container spacing={3}>
                {/* 예시 카드 1 */}
                <Grid item xs={12} md={6} lg={3}>
                    <Paper
                        sx={{
                            p: 3,
                            display: 'flex',
                            flexDirection: 'column',
                            height: 140,
                            justifyContent: 'center',
                            alignItems: 'center',
                            bgcolor: 'primary.light',
                            color: 'white'
                        }}
                    >
                        <Typography variant="h6">총 매출</Typography>
                        <Typography variant="h4" fontWeight="bold">₩ 120M</Typography>
                    </Paper>
                </Grid>
                {/* 예시 카드 2 */}
                <Grid item xs={12} md={6} lg={3}>
                    <Paper sx={{ p: 3, height: 140, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="h6">신규 고객</Typography>
                        <Typography variant="h4" color="primary">32명</Typography>
                    </Paper>
                </Grid>
                {/* 예시 카드 3 */}
                <Grid item xs={12} md={12} lg={6}>
                    <Paper sx={{ p: 3, height: 140 }}>
                        <Typography variant="h6">이번 달 목표 달성률</Typography>
                        <Box sx={{ mt: 2, height: '20px', bgcolor: 'grey.300', borderRadius: 1 }}>
                            <Box sx={{ width: '75%', height: '100%', bgcolor: 'success.main', borderRadius: 1 }} />
                        </Box>
                        <Typography align="right" sx={{ mt: 1 }}>75%</Typography>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard;