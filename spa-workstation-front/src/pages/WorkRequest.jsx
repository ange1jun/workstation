import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Box, MenuItem, Select, InputLabel, FormControl } from '@mui/material';

const WorkRequest = () => {
    // 입력 폼 상태 관리
    const [formData, setFormData] = useState({
        title: '',
        type: 'GENERAL', // 업무 유형 (일반, 구매, 영업)
        sapModule: '',   // 연관 SAP 모듈 (MM, SD, FI...)
        content: '',
    });

    // 입력값 변경 핸들러
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    // 등록 버튼 클릭 핸들러 (나중에 여기서 Java로 데이터를 보냄)
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("전송할 데이터:", formData);
        alert("업무 요청이 생성되었습니다! (백엔드 연동 예정)");
        // TODO: axios.post('/api/work/request', formData) 호출 예정
    };

    return (
        <Container maxWidth="sm" style={{ marginTop: '50px' }}>
            <Typography variant="h4" gutterBottom>
                업무 요청 등록
            </Typography>

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>

                {/* 제목 입력 */}
                <TextField
                    fullWidth
                    label="업무 제목"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    margin="normal"
                    required
                />

                {/* 업무 유형 선택 */}
                <FormControl fullWidth margin="normal">
                    <InputLabel>업무 유형</InputLabel>
                    <Select
                        name="type"
                        value={formData.type}
                        label="업무 유형"
                        onChange={handleChange}
                    >
                        <MenuItem value="GENERAL">일반 업무</MenuItem>
                        <MenuItem value="PURCHASE">구매 요청 (SAP MM)</MenuItem>
                        <MenuItem value="SALES">영업 오더 (SAP SD)</MenuItem>
                    </Select>
                </FormControl>

                {/* 연관 SAP 모듈 입력 (예시) */}
                <TextField
                    fullWidth
                    label="연관 SAP 모듈 (예: MM, SD)"
                    name="sapModule"
                    value={formData.sapModule}
                    onChange={handleChange}
                    margin="normal"
                    helperText="이 업무가 연동될 SAP 모듈을 입력하세요."
                />

                {/* 내용 입력 */}
                <TextField
                    fullWidth
                    label="상세 내용"
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    margin="normal"
                    multiline
                    rows={4}
                />

                {/* 제출 버튼 */}
                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    sx={{ mt: 3, mb: 2 }}
                >
                    등록하기
                </Button>
            </Box>
        </Container>
    );
};

export default WorkRequest;