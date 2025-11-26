import React, { useState } from 'react';
import {
    Box, Typography, Button, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, IconButton, Dialog,
    DialogTitle, DialogContent, TextField, DialogActions, Chip, Grid,
    InputAdornment, GlobalStyles
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import BusinessIcon from '@mui/icons-material/Business';
import GroupsIcon from '@mui/icons-material/Groups';
import BadgeIcon from '@mui/icons-material/Badge';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import SettingsIcon from '@mui/icons-material/Settings';
import Swal from 'sweetalert2';

const Employees = () => {
    // 1. 초기 더미 데이터
    const [employees, setEmployees] = useState([
        { id: 1, name: '김범준', company: '본사', department: '경영지원', position: '대표', contact: '010-1234-5678', email: 'ceo@workstation.com', status: '재직', note: '관리자 권한 보유' },
        { id: 2, name: '이영희', company: '본사', department: '개발팀', position: '팀장', contact: '010-9876-5432', email: 'young@workstation.com', status: '재직', note: '' },
        { id: 3, name: '박철수', company: '지사', department: '영업팀', position: '사원', contact: '010-5555-4444', email: 'chulsoo@workstation.com', status: '휴직', note: '병가 휴직 중' },
    ]);

    // 검색어 상태 관리
    const [searchTerm, setSearchTerm] = useState("");

    // 2. 직원 등록 모달 상태
    const [open, setOpen] = useState(false);
    const [newEmployee, setNewEmployee] = useState({
        name: '', company: '', department: '', position: '', contact: '', email: '', note: ''
    });

    // 3. 직원 상세(수정) 모달 상태
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    // --- 검색 필터링 로직 ---
    const filteredEmployees = employees.filter((emp) => {
        const term = searchTerm.toLowerCase();
        return (
            emp.name.toLowerCase().includes(term) ||
            emp.company.toLowerCase().includes(term) ||
            emp.contact.includes(term) ||
            emp.email.toLowerCase().includes(term)
        );
    });

    // --- 핸들러 함수들 ---

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setNewEmployee({ name: '', company: '', department: '', position: '', contact: '', email: '', note: '' });
    };

    const handleRowClick = (employee) => {
        setSelectedEmployee({ ...employee });
        setDetailOpen(true);
    };
    const handleDetailClose = () => {
        setDetailOpen(false);
        setSelectedEmployee(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewEmployee({ ...newEmployee, [name]: value });
    };

    const handleDetailChange = (e) => {
        const { name, value } = e.target;
        setSelectedEmployee({ ...selectedEmployee, [name]: value });
    };

    // 직원 등록 실행 (SweetAlert2 적용)
    const handleAddEmployee = () => {
        if (!newEmployee.name || !newEmployee.email) {
            Swal.fire({
                icon: 'error',
                title: '입력 오류',
                text: '이름과 이메일은 필수 입력 항목입니다.',
                confirmButtonColor: '#3085d6',
                confirmButtonText: '확인'
            });
            return;
        }

        const newId = employees.length > 0 ? Math.max(...employees.map(e => e.id)) + 1 : 1;
        const employeeToAdd = {
            id: newId,
            ...newEmployee,
            status: '재직'
        };

        setEmployees([...employees, employeeToAdd]);

        Swal.fire({
            icon: 'success',
            title: '등록 완료',
            text: `${newEmployee.name} 직원이 등록되었습니다.`,
            timer: 1500,
            showConfirmButton: false
        });
        handleClose();
    };

    // 직원 상세 정보 저장 (SweetAlert2 Confirm 적용)
    const handleUpdateEmployee = () => {
        Swal.fire({
            title: '정보 수정',
            text: "입력한 정보로 수정하시겠습니까?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: '수정',
            cancelButtonText: '취소'
        }).then((result) => {
            if (result.isConfirmed) {
                setEmployees(employees.map(emp =>
                    emp.id === selectedEmployee.id ? selectedEmployee : emp
                ));
                handleDetailClose();
                Swal.fire({
                    icon: 'success',
                    title: '수정 완료!',
                    text: '직원 정보가 성공적으로 수정되었습니다.',
                    timer: 1500,
                    showConfirmButton: false
                });
            }
        });
    };

    // 직원 삭제 (SweetAlert2 Confirm 적용)
    const handleDeleteEmployee = (e, id) => {
        if(e) e.stopPropagation(); // 테이블 행 클릭 이벤트 전파 방지

        Swal.fire({
            title: '정말로 삭제하시겠습니까?',
            text: "삭제된 직원 정보는 복구할 수 없습니다!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: '삭제',
            cancelButtonText: '취소'
        }).then((result) => {
            if (result.isConfirmed) {
                setEmployees(employees.filter(emp => emp.id !== id));

                // 만약 상세 모달이 열려있는 상태에서 삭제했다면 모달 닫기
                if (selectedEmployee && selectedEmployee.id === id) {
                    handleDetailClose();
                }

                Swal.fire({
                    icon: 'success',
                    title: '삭제 완료!',
                    text: '해당 직원이 삭제되었습니다.',
                    timer: 1500,
                    showConfirmButton: false
                });
            }
        });
    };

    return (
        <Box>
            {/* [중요] SweetAlert2 팝업이 MUI 모달(Dialog) 뒤에 숨는 문제를 해결하기 위한 스타일 */}
            <GlobalStyles styles={{
                '.swal2-container': {
                    zIndex: '2400 !important' // MUI Dialog(1300)보다 높은 값
                }
            }} />

            {/* 상단 영역: 검색창과 버튼을 한 줄에 배치 */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                {/* 좌측 여백 */}
                <Box sx={{ flex: 1 }} />

                {/* 중앙 검색창 */}
                <TextField
                    placeholder="검색 (이름, 회사, 연락처, 이메일)"
                    variant="outlined"
                    size="small"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ width: '400px', backgroundColor: 'background.paper' }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon color="action" />
                            </InputAdornment>
                        ),
                    }}
                />

                {/* 우측 버튼 */}
                <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleOpen}
                        sx={{ fontWeight: 'bold' }}
                    >
                        직원 등록
                    </Button>
                </Box>
            </Box>

            {/* 직원 목록 테이블 */}
            <TableContainer component={Paper} elevation={3} sx={{ borderRadius: '12px' }}>
                <Table sx={{ minWidth: 650 }} aria-label="employee table">
                    <TableHead>
                        <TableRow sx={{ backgroundColor: 'action.hover' }}>
                            <TableCell sx={{ fontWeight: 'bold', width: '15%' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <PersonIcon fontSize="small" color="primary" />
                                    이름
                                </Box>
                            </TableCell>
                            <TableCell sx={{ fontWeight: 'bold', width: '10%' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <BusinessIcon fontSize="small" color="primary" />
                                    소속
                                </Box>
                            </TableCell>
                            <TableCell sx={{ fontWeight: 'bold', width: '10%' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <GroupsIcon fontSize="small" color="primary" />
                                    부서
                                </Box>
                            </TableCell>
                            <TableCell sx={{ fontWeight: 'bold', width: '10%' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <BadgeIcon fontSize="small" color="primary" />
                                    직급
                                </Box>
                            </TableCell>
                            <TableCell sx={{ fontWeight: 'bold', width: '15%' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <PhoneIcon fontSize="small" color="primary" />
                                    연락처
                                </Box>
                            </TableCell>
                            <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <EmailIcon fontSize="small" color="primary" />
                                    이메일
                                </Box>
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold', width: '10%' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                    <SettingsIcon fontSize="small" color="primary" />
                                    관리
                                </Box>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredEmployees.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                                    {searchTerm ? '검색 결과가 없습니다.' : '등록된 직원이 없습니다.'}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredEmployees.map((row) => (
                                <TableRow
                                    key={row.id}
                                    hover
                                    onClick={() => handleRowClick(row)}
                                    sx={{
                                        cursor: 'pointer',
                                        '&:last-child td, &:last-child th': { border: 0 }
                                    }}
                                >
                                    <TableCell component="th" scope="row">
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <PersonIcon color="action" />
                                            {row.name}
                                        </Box>
                                    </TableCell>
                                    <TableCell>{row.company}</TableCell>
                                    <TableCell>{row.department}</TableCell>
                                    <TableCell>{row.position}</TableCell>
                                    <TableCell>{row.contact}</TableCell>
                                    <TableCell>{row.email}</TableCell>
                                    <TableCell align="center">
                                        <IconButton
                                            aria-label="delete"
                                            color="error"
                                            onClick={(e) => handleDeleteEmployee(e, row.id)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* 1. 직원 등록 모달 */}
            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle fontWeight="bold">신규 직원 등록</DialogTitle>
                <DialogContent>
                    <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField label="이름" name="name" value={newEmployee.name} onChange={handleChange} fullWidth required />
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <TextField label="소속" name="company" value={newEmployee.company} onChange={handleChange} fullWidth required />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField label="부서" name="department" value={newEmployee.department} onChange={handleChange} fullWidth />
                            </Grid>
                        </Grid>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <TextField label="직급" name="position" value={newEmployee.position} onChange={handleChange} fullWidth />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField label="연락처" name="contact" value={newEmployee.contact} onChange={handleChange} fullWidth />
                            </Grid>
                        </Grid>
                        <TextField label="이메일" name="email" type="email" value={newEmployee.email} onChange={handleChange} fullWidth required />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={handleClose} color="inherit">취소</Button>
                    <Button onClick={handleAddEmployee} variant="contained" color="primary">등록하기</Button>
                </DialogActions>
            </Dialog>

            {/* 2. 직원 상세 정보 모달 */}
            <Dialog open={detailOpen} onClose={handleDetailClose} maxWidth="sm" fullWidth>
                <DialogTitle fontWeight="bold">직원 상세 정보</DialogTitle>
                <DialogContent>
                    {selectedEmployee && (
                        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                            <TextField
                                label="이름" name="name" value={selectedEmployee.name} onChange={handleDetailChange} fullWidth
                                InputProps={{ readOnly: true }} variant="filled"
                            />

                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <TextField label="소속" name="company" value={selectedEmployee.company} onChange={handleDetailChange} fullWidth variant="filled" InputProps={{ readOnly: true }} />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField label="부서" name="department" value={selectedEmployee.department} onChange={handleDetailChange} fullWidth />
                                </Grid>
                            </Grid>

                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <TextField label="직급" name="position" value={selectedEmployee.position} onChange={handleDetailChange} fullWidth />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField label="연락처" name="contact" value={selectedEmployee.contact} onChange={handleDetailChange} fullWidth />
                                </Grid>
                            </Grid>

                            <TextField label="이메일" name="email" value={selectedEmployee.email} onChange={handleDetailChange} fullWidth />

                            <TextField
                                label="메모"
                                name="note"
                                value={selectedEmployee.note}
                                onChange={handleDetailChange}
                                fullWidth
                                multiline
                                rows={4}
                                placeholder="직원에 대한 특이사항이나 메모를 입력하세요."
                            />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3, justifyContent: 'space-between' }}>
                    <Button onClick={() => handleDeleteEmployee({ stopPropagation: () => {} }, selectedEmployee?.id)} color="error">
                        직원 삭제
                    </Button>
                    <Box>
                        <Button onClick={handleDetailClose} color="inherit" sx={{ mr: 1 }}>닫기</Button>
                        <Button onClick={handleUpdateEmployee} variant="contained" color="primary">저장</Button>
                    </Box>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Employees;