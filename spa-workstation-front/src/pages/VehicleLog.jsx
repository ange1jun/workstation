import React, { useState, useMemo, useEffect } from 'react';
import {
    Box, Paper, Typography, Button, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, IconButton, TextField, InputAdornment, Chip,
    Dialog, DialogTitle, DialogContent, DialogActions, Grid, MenuItem, useTheme
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';

// 아이콘
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';

import Swal from 'sweetalert2';

// --- Styled Components ---
const StyledTableHeadRow = styled(TableRow)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark'
        ? alpha(theme.palette.primary.main, 0.2)
        : alpha(theme.palette.primary.main, 0.08),
    '& th': {
        fontWeight: 700,
        color: theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.main,
    }
}));

// --- Mock Data ---
const INITIAL_LOGS = [
    { id: 1, date: '2023-12-01', carNum: '12가 3456', driver: '김철수', purpose: '거래처 미팅', departure: '본사', arrival: '테크(주)', startDist: 10500, endDist: 10530, totalDist: 30, remarks: '하이패스 사용' },
    { id: 2, date: '2023-12-02', carNum: '98나 1234', driver: '이영희', purpose: '현장 점검', departure: '본사', arrival: '군산 공장', startDist: 5200, endDist: 5350, totalDist: 150, remarks: '' },
    { id: 3, date: '2023-12-03', carNum: '12가 3456', driver: '박민수', purpose: '자재 구매', departure: '본사', arrival: '이마트', startDist: 10530, endDist: 10545, totalDist: 15, remarks: '' },
];

const VehicleLog = () => {
    const theme = useTheme();

    // States
    const [logs, setLogs] = useState(INITIAL_LOGS);
    const [searchTerm, setSearchTerm] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    // Form State
    const initialFormState = {
        id: null, date: new Date().toISOString().split('T')[0],
        carNum: '', driver: '', purpose: '',
        departure: '', arrival: '',
        startDist: '', endDist: '', totalDist: 0, remarks: ''
    };
    const [formData, setFormData] = useState(initialFormState);

    // --- Handlers ---

    // 검색 필터링
    const filteredLogs = useMemo(() => {
        return logs.filter(log =>
            log.carNum.includes(searchTerm) ||
            log.driver.includes(searchTerm) ||
            log.purpose.includes(searchTerm)
        );
    }, [logs, searchTerm]);

    // 입력값 변경 핸들러 (거리 자동계산 포함)
    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => {
            const newData = { ...prev, [name]: value };

            // 거리 계산 로직
            if (name === 'startDist' || name === 'endDist') {
                const start = parseFloat(name === 'startDist' ? value : prev.startDist) || 0;
                const end = parseFloat(name === 'endDist' ? value : prev.endDist) || 0;
                newData.totalDist = end > start ? end - start : 0;
            }
            return newData;
        });
    };

    // 모달 열기 (등록/수정)
    const handleOpenDialog = (log = null) => {
        if (log) {
            setIsEditMode(true);
            setFormData(log);
        } else {
            setIsEditMode(false);
            setFormData(initialFormState);
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    // 저장 (등록/수정)
    const handleSave = () => {
        if (!formData.carNum || !formData.driver || !formData.date) {
            Swal.fire('필수 입력', '날짜, 차량번호, 운전자는 필수 항목입니다.', 'warning');
            return;
        }

        if (isEditMode) {
            setLogs(prev => prev.map(log => log.id === formData.id ? formData : log));
            Swal.fire('수정 완료', '운행일지가 수정되었습니다.', 'success');
        } else {
            const newLog = { ...formData, id: Date.now() };
            setLogs(prev => [newLog, ...prev]);
            Swal.fire('등록 완료', '새로운 운행일지가 등록되었습니다.', 'success');
        }
        handleCloseDialog();
    };

    // 삭제
    const handleDelete = (id) => {
        Swal.fire({
            title: '삭제하시겠습니까?',
            text: "이 작업은 되돌릴 수 없습니다.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: '삭제',
            cancelButtonText: '취소'
        }).then((result) => {
            if (result.isConfirmed) {
                setLogs(prev => prev.filter(log => log.id !== id));
                Swal.fire('삭제됨', '운행일지가 삭제되었습니다.', 'success');
            }
        });
    };

    return (
        <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto' }}>
            {/* Header Area */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h5" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DirectionsCarIcon color="primary" /> 차량 운행 일지
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        법인 차량 운행 내역을 기록하고 관리합니다.
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                    sx={{ borderRadius: '8px', px: 3, py: 1, fontWeight: 600, boxShadow: theme.shadows[2] }}
                >
                    일지 작성
                </Button>
            </Box>

            {/* Filter Area */}
            <Paper elevation={0} sx={{ p: 2, mb: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: '12px', display: 'flex', alignItems: 'center' }}>
                <TextField
                    placeholder="차량번호, 운전자, 목적 검색..."
                    size="small"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon color="action" />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ width: { xs: '100%', sm: 300 } }}
                />
            </Paper>

            {/* Table Area */}
            <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: '12px', overflow: 'hidden' }}>
                <Table sx={{ minWidth: 800 }} aria-label="vehicle log table">
                    <TableHead>
                        <StyledTableHeadRow>
                            <TableCell align="center">날짜</TableCell>
                            <TableCell align="center">차량번호</TableCell>
                            <TableCell align="center">운전자</TableCell>
                            <TableCell>운행목적</TableCell>
                            <TableCell align="center">구간(출발-도착)</TableCell>
                            <TableCell align="right">주행거리(km)</TableCell>
                            <TableCell>비고</TableCell>
                            <TableCell align="center">관리</TableCell>
                        </StyledTableHeadRow>
                    </TableHead>
                    <TableBody>
                        {filteredLogs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                                    운행 기록이 없습니다.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredLogs.map((log) => (
                                <TableRow key={log.id} hover>
                                    <TableCell align="center">{log.date}</TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            icon={<DirectionsCarIcon fontSize="small"/>}
                                            label={log.carNum}
                                            size="small"
                                            variant="outlined"
                                            color="default"
                                            sx={{ borderRadius: '4px' }}
                                        />
                                    </TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 600 }}>{log.driver}</TableCell>
                                    <TableCell>{log.purpose}</TableCell>
                                    <TableCell align="center">
                                        <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>{log.departure} → {log.arrival}</Typography>
                                    </TableCell>
                                    <TableCell align="right" sx={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>
                                        {log.totalDist.toLocaleString()} km
                                    </TableCell>
                                    <TableCell sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>{log.remarks}</TableCell>
                                    <TableCell align="center">
                                        <IconButton size="small" onClick={() => handleOpenDialog(log)} color="primary">
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" onClick={() => handleDelete(log.id)} color="error">
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Write/Edit Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '12px' } }}>
                <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
                    {isEditMode ? '운행일지 수정' : '운행일지 작성'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="운행일자"
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleInputChange}
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="운전자"
                                name="driver"
                                value={formData.driver}
                                onChange={handleInputChange}
                                fullWidth
                                placeholder="예: 홍길동"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="차량번호"
                                name="carNum"
                                value={formData.carNum}
                                onChange={handleInputChange}
                                fullWidth
                                placeholder="예: 12가 3456"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="운행목적"
                                name="purpose"
                                value={formData.purpose}
                                onChange={handleInputChange}
                                fullWidth
                                placeholder="예: 거래처 미팅, 자재 구매"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="출발지"
                                name="departure"
                                value={formData.departure}
                                onChange={handleInputChange}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="도착지"
                                name="arrival"
                                value={formData.arrival}
                                onChange={handleInputChange}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField
                                label="출발 누적거리"
                                name="startDist"
                                type="number"
                                value={formData.startDist}
                                onChange={handleInputChange}
                                fullWidth
                                InputProps={{ endAdornment: <InputAdornment position="end">km</InputAdornment> }}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField
                                label="도착 누적거리"
                                name="endDist"
                                type="number"
                                value={formData.endDist}
                                onChange={handleInputChange}
                                fullWidth
                                InputProps={{ endAdornment: <InputAdornment position="end">km</InputAdornment> }}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField
                                label="총 주행거리"
                                value={formData.totalDist}
                                fullWidth
                                disabled
                                sx={{ bgcolor: alpha(theme.palette.action.disabledBackground, 0.1) }}
                                InputProps={{ endAdornment: <InputAdornment position="end">km</InputAdornment> }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="비고"
                                name="remarks"
                                value={formData.remarks}
                                onChange={handleInputChange}
                                fullWidth
                                multiline
                                rows={2}
                                placeholder="특이사항, 주유비, 하이패스 등"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={handleCloseDialog} color="inherit" sx={{ borderRadius: '8px' }}>취소</Button>
                    <Button onClick={handleSave} variant="contained" sx={{ borderRadius: '8px' }}>저장</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default VehicleLog;