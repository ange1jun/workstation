import React, { useState, useEffect } from 'react';
import axios from 'axios';

import TableLoader from '../components/TableLoader';

// 백엔드 API
const API_BASE_URL = 'http://localhost:8889/api/employee';

// 아이콘 컴포넌트
const PlusIcon = () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>;
const TrashIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>;
const DocumentIcon = ({ className }) => <svg className={className || "w-4 h-4"} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;

// 페이지네이션 UI 컴포넌트
const Pagination = ({ totalItems, itemsPerPage, currentPage, onPageChange }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
        const pages = [];
        let start = Math.max(1, currentPage - 2);
        let end = Math.min(totalPages, start + 4);
        if (end - start < 4) start = Math.max(1, end - 4);
        for (let i = start; i <= end; i++) pages.push(i);
        return pages;
    };

    return (
        <div className="flex items-center justify-center gap-2 py-4 border-t border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800">
            <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            {getPageNumbers().map(num => (
                <button key={num} onClick={() => onPageChange(num)} className={`w-7 h-7 rounded-md text-xs font-medium transition-all ${currentPage === num ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'}`}>
                    {num}
                </button>
            ))}
            <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
        </div>
    );
};

// 모달 컴포넌트 (스타일 미세 조정)
const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-24">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden animate-[fadeIn_0.3s_ease-out] border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
};

// 입력 필드 컴포넌트
const InputField = ({ label, name, value, onChange, type = 'text', icon, required = false, multiline = false }) => (
    <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
            {icon && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {icon}
                </div>
            )}
            {multiline ? (
                <textarea
                    name={name}
                    value={value || ''}
                    onChange={onChange}
                    rows={3}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                />
            ) : (
                <input
                    type={type}
                    name={name}
                    value={value || ''}
                    onChange={onChange}
                    className={`w-full ${icon ? 'pl-10' : 'pl-3'} pr-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
                />
            )}
        </div>
    </div>
);

// 메인 컴포넌트
const Employees = () => {
    // 상태 관리
    const [isLoading, setIsLoading] = useState(true);
    const [employees, setEmployees] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [open, setOpen] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [newEmployee, setNewEmployee] = useState({
        name: '', company: '', department: '', position: '', contact: '', email: '', note: ''
    });

    // 페이지네이션
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // 데이터 로드
    useEffect(() => {
        fetchEmployees();
    }, []);

    // 검색어가 바뀌면 1페이지로 리셋
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const fetchEmployees = async () => {
        setIsLoading(true);
        try {
            const [response, _] = await Promise.all([
                axios.get(API_BASE_URL),
                new Promise(resolve => setTimeout(resolve, 1000))
            ]);

            if (Array.isArray(response.data)) {
                setEmployees(response.data);
            } else {
                setEmployees([]);
            }
        } catch (error) {
            console.error("직원 목록 로드 실패:", error);
            alert("데이터를 불러오는데 실패했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    // 로딩 없이 데이터만 갱신
    const fetchEmployeesOnly = async () => {
        try {
            const response = await axios.get(API_BASE_URL);
            if (Array.isArray(response.data)) setEmployees(response.data);
        } catch (e) { console.error(e); }
    };

    const filteredEmployees = employees.filter((emp) => {
        const term = searchTerm.toLowerCase();
        return (
            emp.name.toLowerCase().includes(term) ||
            emp.company.toLowerCase().includes(term) ||
            (emp.contact && emp.contact.includes(term)) ||
            (emp.email && emp.email.toLowerCase().includes(term))
        );
    });

    // 페이지네이션 적용
    const paginatedEmployees = filteredEmployees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // 핸들러 함수들
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
        setNewEmployee(prev => ({ ...prev, [name]: value }));
    };
    const handleDetailChange = (e) => {
        const { name, value } = e.target;
        setSelectedEmployee(prev => ({ ...prev, [name]: value }));
    };
    const handleAddEmployee = async () => {
        if (!newEmployee.name || !newEmployee.email) {
            alert('이름과 이메일은 필수 입력 항목입니다.');
            return;
        }
        try {
            const response = await axios.post(API_BASE_URL, { ...newEmployee, status: '재직' });
            fetchEmployeesOnly();
            alert(`${response.data.name} 직원이 등록되었습니다.`);
            handleClose();
        } catch (error) {
            alert(error.response?.data?.message || '등록 실패');
        }
    };
    const handleUpdateEmployee = async () => {
        if (!window.confirm('수정하시겠습니까?')) return;
        try {
            await axios.put(`${API_BASE_URL}/${selectedEmployee.id}`, selectedEmployee);
            fetchEmployeesOnly();
            handleDetailClose();
            alert('수정되었습니다.');
        } catch (error) {
            alert('저장 실패');
        }
    };
    const handleDeleteEmployee = async (e, id) => {
        if (e) e.stopPropagation();
        if (!window.confirm('삭제하시겠습니까?')) return;
        try {
            await axios.delete(`${API_BASE_URL}/${id}`);
            fetchEmployeesOnly();
            if (selectedEmployee?.id === id) handleDetailClose();
            alert('삭제되었습니다.');
        } catch (error) {
            alert('삭제 실패');
        }
    };

    // 애니메이션 스타일
    const gradientStyle = {
        backgroundSize: '200% 200%',
        animation: 'moveGradient 3s ease infinite',
    };

    return (
        <div className="p-6 max-w-7xl mx-auto min-h-screen text-gray-900 dark:text-gray-100 transition-colors duration-300">
            <style>
                {`
                    @keyframes moveGradient {
                        0% { background-position: 0% 50%; }
                        50% { background-position: 100% 50%; }
                        100% { background-position: 0% 50%; }
                    }
                `}
            </style>

            {/* === 헤더 === */}
            <div className="relative flex items-center justify-center mb-8 h-12 gap-4">
                {/* 검색창 영역 */}
                <div className="relative w-full max-w-md group z-0 h-11">
                    <div
                        className="absolute -inset-[2px] rounded-lg bg-gradient-to-r from-red-500 via-purple-500 to-pink-500 opacity-70 blur-sm transition duration-1000 group-hover:opacity-100 group-hover:duration-200"
                        style={gradientStyle}
                    ></div>
                    <div className="relative flex items-center bg-white dark:bg-gray-800 rounded-lg p-[1px] h-full">
                        <svg className="absolute left-3 w-5 h-5 text-gray-400 pointer-events-none" fill="none"
                             stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                        </svg>
                        <input
                            type="text"
                            placeholder="이름, 회사명, 연락처 등으로 검색"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 h-full bg-transparent border-transparent rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-0 relative z-10"
                        />
                    </div>
                </div>

                {/* 직원 등록 버튼 (우측 고정) */}
                <div className="absolute right-0 flex-shrink-0">
                    <button
                        onClick={handleOpen}
                        className="h-11 px-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm flex items-center gap-2"
                    >
                        <PlusIcon />
                        <span className="font-medium text-sm">직원 등록</span>
                    </button>
                </div>
            </div>

            {/* === 메인 테이블 영역 === */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 overflow-x-auto transition-colors duration-300">
                <table className="w-full text-left border-collapse table-fixed min-w-[1000px]">
                    <thead className="bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-200">
                    <tr>
                        <th className="px-6 py-4 text-sm font-semibold w-[15%] whitespace-nowrap">이름</th>
                        <th className="px-6 py-4 text-sm font-semibold w-[15%] whitespace-nowrap">회사명</th>
                        <th className="px-6 py-4 text-sm font-semibold w-[15%] whitespace-nowrap">부서</th>
                        <th className="px-6 py-4 text-sm font-semibold w-[10%] whitespace-nowrap">직급</th>
                        <th className="px-6 py-4 text-sm font-semibold w-[15%] whitespace-nowrap">연락처</th>
                        <th className="px-6 py-4 text-sm font-semibold w-[20%] whitespace-nowrap">이메일</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold w-[10%] whitespace-nowrap">삭제</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                    {isLoading ? (
                        <TableLoader colSpan={7} />
                    ) : paginatedEmployees.length === 0 ? (
                        <tr>
                            <td colSpan="8" className="px-6">
                                <div
                                    className="h-[60vh] flex flex-col items-center justify-center gap-4 text-gray-400 dark:text-gray-500">
                                    <div className="bg-gray-50 dark:bg-slate-700/50 p-6 rounded-full">
                                        <DocumentIcon className="w-10 h-10 opacity-50"/>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-lg font-medium text-gray-500 dark:text-gray-400">데이터가
                                            존재하지 않습니다.</p>
                                        <p className="text-sm text-gray-400 mt-1">새로운 직원을 등록하거나 검색어를 변경해보세요.</p>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        paginatedEmployees.map((row) => (
                            <tr
                                key={row.id}
                                onClick={() => handleRowClick(row)}
                                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                            >
                                <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="p-1.5 bg-blue-50 dark:bg-slate-700/50 rounded-full text-blue-600 dark:text-blue-400 flex-shrink-0">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor"
                                                 viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                            </svg>
                                        </div>
                                        <span className="truncate min-w-0" title={row.name}>
                                            {row.name}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 truncate" title={row.company}>
                                    {row.company}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 truncate" title={row.department}>
                                    {row.department}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 truncate" title={row.position}>
                                    {row.position}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 truncate" title={row.contact}>
                                    {row.contact}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 truncate" title={row.email}>
                                    {row.email}
                                </td>
                                <td className="px-6 py-4 text-center whitespace-nowrap">
                                    <button
                                        onClick={(e) => handleDeleteEmployee(e, row.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    >
                                        <TrashIcon />
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>

            {/* 페이지네이션 */}
            <Pagination
                totalItems={filteredEmployees.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
            />

            {/* 직원 등록 모달 */}
            <Modal isOpen={open} onClose={handleClose} title="신규 직원 등록">
                <div className="p-6 space-y-4">
                    <InputField label="이름" name="name" value={newEmployee.name} onChange={handleChange} required />
                    <InputField label="회사명" name="company" value={newEmployee.company} onChange={handleChange} />
                    <div className="grid grid-cols-2 gap-4">
                        <InputField label="부서" name="department" value={newEmployee.department} onChange={handleChange} />
                        <InputField label="직급" name="position" value={newEmployee.position} onChange={handleChange} />
                    </div>
                    <InputField label="연락처" name="contact" value={newEmployee.contact} onChange={handleChange} required/>
                    <InputField label="이메일" name="email" value={newEmployee.email} onChange={handleChange} type="email"/>
                    <InputField label="비고" name="note" value={newEmployee.note} onChange={handleChange} multiline />
                </div>
                <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <button onClick={handleClose} className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium shadow-sm">취소</button>
                    <button onClick={handleAddEmployee} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm">등록하기</button>
                </div>
            </Modal>

            {/* 직원 상세/수정 모달 */}
            <Modal isOpen={detailOpen} onClose={handleDetailClose} title="직원 상세 정보">
                {selectedEmployee && (
                    <>
                        <div className="p-6 space-y-4">
                            <InputField label="이름" name="name" value={selectedEmployee.name} onChange={handleDetailChange} />
                            <InputField label="회사명" name="company" value={selectedEmployee.company} onChange={handleDetailChange} />
                            <div className="grid grid-cols-2 gap-4">
                                <InputField label="부서" name="department" value={selectedEmployee.department} onChange={handleDetailChange} />
                                <InputField label="직급" name="position" value={selectedEmployee.position} onChange={handleDetailChange} />
                            </div>
                            <InputField label="연락처" name="contact" value={selectedEmployee.contact} onChange={handleDetailChange} />
                            <InputField label="이메일" name="email" value={selectedEmployee.email} onChange={handleDetailChange} type="email" />
                            <InputField label="비고" name="note" value={selectedEmployee.note} onChange={handleDetailChange} multiline />
                        </div>
                        <div className="flex justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                            <button onClick={() => handleDeleteEmployee(null, selectedEmployee.id)} className="px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium shadow-sm">직원 삭제</button>
                            <div className="flex gap-3">
                                <button onClick={handleDetailClose} className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium shadow-sm">닫기</button>
                                <button onClick={handleUpdateEmployee} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm">저장</button>
                            </div>
                        </div>
                    </>
                )}
            </Modal>
        </div>
    );
};

export default Employees;