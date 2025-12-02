import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import * as Tabs from '@radix-ui/react-tabs';
import * as Dialog from '@radix-ui/react-dialog';
import * as Tooltip from '@radix-ui/react-tooltip';

import TableLoader from '../components/TableLoader';


// 아이콘 컴포넌트
const PlusIcon = () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>;
const XIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>;
const SearchIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>;
const TrashIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>;
const ChevronDownIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>;
const DocumentIcon = ({ className }) => <svg className={className || "w-4 h-4"} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;

const API_CUSTOMER_URL = 'http://localhost:8889/api/customer';
const API_COMPANY_URL = 'http://localhost:8889/api/company';

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
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-gray-500"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            {getPageNumbers().map(num => (
                <button
                    key={num}
                    onClick={() => onPageChange(num)}
                    className={`w-7 h-7 rounded-md text-xs font-medium transition-all ${
                        currentPage === num
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
                    }`}
                >
                    {num}
                </button>
            ))}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-gray-500"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
        </div>
    );
};

export default function Customers() {
    const [currentTab, setCurrentTab] = useState('customer');
    const [searchTerm, setSearchTerm] = useState('');

    // --- 페이지네이션 ---
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // --- 상태 관리 ---
    const [isLoading, setIsLoading] = useState(true);
    const [isCustomerRegOpen, setIsCustomerRegOpen] = useState(false);
    const [isCompanyRegOpen, setIsCompanyRegOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [editingCompany, setEditingCompany] = useState(null);
    const [companyList, setCompanyList] = useState([]);
    const [customerList, setCustomerList] = useState([]);
    const [customerForm, setCustomerForm] = useState({ name: '', companyName: '', department: '', part: '', position: '', email: '', phone: '', contact: '', memo: '', responsibilities: [] });
    const [companyForm, setCompanyForm] = useState({ name: '', reg: '', phone: '', address: '', email: '', memo: '' });
    const [taskInput, setTaskInput] = useState('');

    const allUniqueTasks = useMemo(() => [...new Set(customerList.flatMap(c => c.responsibilities || []))], [customerList]);

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setIsLoading(true);
        try {
            const [customers, companies, _] = await Promise.all([
                axios.get(API_CUSTOMER_URL),
                axios.get(API_COMPANY_URL),
                new Promise(resolve => setTimeout(resolve, 1000))
            ]);
            setCustomerList(customers.data || []);
            setCompanyList(companies.data || []);
        } catch (error) {
            console.error("데이터 로드 실패:", error);
            // Swal 대체
            window.alert('오류: 데이터를 불러오는데 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [currentTab, searchTerm]);

    const fetchCustomersOnly = async () => { try { const res = await axios.get(API_CUSTOMER_URL); setCustomerList(res.data || []); } catch (e) { console.error(e); } };
    const fetchCompaniesOnly = async () => { try { const res = await axios.get(API_COMPANY_URL); setCompanyList(res.data || []); } catch (e) { console.error(e); } };


    useEffect(() => {
        if (selectedCustomer) {
            let safeResponsibilities = [];
            if (selectedCustomer.responsibilities) {
                if (Array.isArray(selectedCustomer.responsibilities)) {
                    safeResponsibilities = selectedCustomer.responsibilities;
                } else if (typeof selectedCustomer.responsibilities === 'string') {
                    safeResponsibilities = selectedCustomer.responsibilities.split(',').filter(item => item.trim() !== '');
                }
            }
            setEditingCustomer({
                ...selectedCustomer,
                responsibilities: safeResponsibilities
            });
        }
    }, [selectedCustomer]);

    useEffect(() => {
        if (selectedCompany?.data) {
            setEditingCompany({ ...selectedCompany.data });
        } else {
            setEditingCompany(null);
        }
    }, [selectedCompany]);

    const filteredCustomers = customerList.filter(c => (c.name && c.name.includes(searchTerm)) || (c.company && c.company.includes(searchTerm)));
    const filteredCompanies = companyList.filter(c => (c.name && c.name.includes(searchTerm)) || (c.reg && c.reg.includes(searchTerm)));

    const paginatedCustomers = filteredCustomers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const paginatedCompanies = filteredCompanies.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleAddCustomerTask = (isEditing) => { if (!taskInput.trim()) return; const set = isEditing ? setEditingCustomer : setCustomerForm; set(p => ({ ...p, responsibilities: [...p.responsibilities, taskInput.trim()] })); setTaskInput(''); };
    const handleRemoveCustomerTask = (i, isEditing) => { const set = isEditing ? setEditingCustomer : setCustomerForm; set(p => ({ ...p, responsibilities: p.responsibilities.filter((_, idx) => idx !== i) })); };
    const handleCustomerRegChange = (e) => { const { name, value } = e.target; setCustomerForm(p => ({ ...p, [name]: value })); };
    const handleCustomerSubmit = async () => {
        if (!customerForm.companyName) { window.alert('경고: 고객사를 선택하세요.'); return; }
        try {
            const payload = { ...customerForm, company: customerForm.companyName, contact: customerForm.mobile, responsibilities: customerForm.responsibilities.join(',') };
            await axios.post(API_CUSTOMER_URL, payload); fetchCustomersOnly(); setIsCustomerRegOpen(false);
            setCustomerForm({ name: '', companyName: '', department: '', part: '', position: '', email: '', phone: '', contact: '', memo: '', responsibilities: [] });
            window.alert('완료: 고객이 등록되었습니다.');
        } catch { window.alert('오류: 등록 실패'); }
    };
    const handleCompanyRegChange = (e) => { const { name, value } = e.target; setCompanyForm(p => ({ ...p, [name]: value })); };
    const handleCompanySubmit = async () => {
        try {
            const payload = {
                ...companyForm,
                reg: companyForm.regNo,
                tel: companyForm.phone,
            };
            await axios.post(API_COMPANY_URL, payload); fetchCompaniesOnly(); setIsCompanyRegOpen(false);
            setCompanyForm({ name: '', regNo: '', phone: '', address: '', email: '', memo: '' });
            window.alert('완료: 고객사가 등록되었습니다.');
        } catch { window.alert('오류: 등록 실패'); }
    };
    const handleEditCustomerChange = (e) => { const { name, value } = e.target; setEditingCustomer(p => ({ ...p, [name]: value })); };
    const handleUpdateCustomer = async () => {
        try {
            const payload = {
                ...editingCustomer,
                responsibilities: Array.isArray(editingCustomer.responsibilities)
                    ? editingCustomer.responsibilities.join(', ')
                    : editingCustomer.responsibilities
            };
            await axios.put(`${API_CUSTOMER_URL}/${editingCustomer.id}`, payload);
            fetchCustomersOnly();
            setSelectedCustomer(null);
            window.alert('수정 완료: 고객 정보가 수정되었습니다.');
        } catch (error) {
            console.error("수정 실패:", error);
            window.alert('오류: 수정 중 문제가 발생했습니다.');
        }
    };
    const handleDeleteCustomer = async () => { if (window.confirm('삭제하시겠습니까?')) { try { await axios.delete(`${API_CUSTOMER_URL}/${editingCustomer.id}`); fetchCustomersOnly(); setSelectedCustomer(null); } catch { window.alert('오류: 삭제 실패'); } } };
    const handleEditCompanyChange = (e) => { const { name, value } = e.target; setEditingCompany(p => ({ ...p, [name]: value })); };
    const handleUpdateCompany = async () => {
        try {
            const payload = { ...editingCompany };
            await axios.put(`${API_COMPANY_URL}/${editingCompany.id}`, payload);
            fetchCompaniesOnly(); setSelectedCompany(null); window.alert('수정 완료: 고객사 정보가 수정되었습니다.');
        } catch { window.alert('오류: 수정 실패'); }
    };
    const handleDeleteCompany = async () => { if (window.confirm('삭제하시겠습니까?')) { try { await axios.delete(`${API_COMPANY_URL}/${editingCompany.id}`); fetchCompaniesOnly(); setSelectedCompany(null); } catch { window.alert('오류: 삭제 실패'); } } };
    const handleCompanyLinkClick = (name) => { const found = companyList.find(c => c.name === name); if (found) setSelectedCompany({ data: found, mode: 'view' }); else window.alert('오류: 해당 고객사 정보를 찾을 수 없습니다.'); };

    const gradientStyle = { backgroundSize: '200% 200%', animation: 'moveGradient 3s ease infinite' };
    const inputStyle = "w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-colors text-sm";
    const labelStyle = "block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5";
    const modalContentStyle = "fixed left-[50%] top-[10%] w-[90vw] max-w-[600px] translate-x-[-50%] rounded-2xl bg-white dark:bg-slate-800 shadow-2xl focus:outline-none z-50 overflow-hidden border border-gray-200 dark:border-slate-700 transition-all max-h-[85vh] flex flex-col";

    return (
        <Tooltip.Provider delayDuration={300}>
            <style>{`
                @keyframes moveGradient { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } } 
            `}</style>

            <div className="p-6 max-w-7xl mx-auto min-h-screen text-gray-900 dark:text-gray-100 transition-colors duration-300">
                <Tabs.Root value={currentTab} onValueChange={setCurrentTab} className="flex flex-col h-full">

                    {/* ====== 헤더 (레이아웃 수정: 1번 페이지와 동일하게 중앙 정렬) ====== */}
                    <div className="relative flex items-center justify-center mb-8 h-12">

                        {/* 1. 탭 (왼쪽 절대 위치) */}
                        <div className="absolute left-0 h-11 z-10">
                            <Tabs.List className="flex items-center gap-2 bg-gray-100 dark:bg-slate-800 rounded-lg p-1 h-full shadow-sm">
                                <Tabs.Trigger value="customer" className="px-4 h-full flex items-center text-sm font-medium rounded-md transition-all outline-none data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">고객 관리</Tabs.Trigger>
                                <Tabs.Trigger value="company" className="px-4 h-full flex items-center text-sm font-medium rounded-md transition-all outline-none data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">고객사 관리</Tabs.Trigger>
                            </Tabs.List>
                        </div>

                        {/* 2. 검색창 (가운데 정렬 - 1번 페이지와 동일한 사이즈/위치) */}
                        <div className="relative w-full max-w-md group z-0 h-11">
                            <div
                                className="absolute -inset-[2px] rounded-lg bg-gradient-to-r

                                from-neutral-500
                                via-green-500
                                to-cyan-500

                                opacity-70 blur-sm transition duration-1000 group-hover:opacity-100 group-hover:duration-200"
                                style={gradientStyle}></div>
                            <div
                                className="relative flex items-center bg-white dark:bg-slate-800 rounded-lg p-[1px] h-full">
                                <svg className="absolute left-3 w-5 h-5 text-gray-400 pointer-events-none" fill="none"
                                     stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                                </svg>
                                <input type="text"
                                       className="w-full pl-10 pr-4 h-full bg-transparent border-transparent rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-0 relative z-10"
                                       placeholder={currentTab === 'customer' ? "고객명, 회사명 검색" : "고객사명, 사업자번호 검색"}
                                       value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
                            </div>
                        </div>

                        {/* 3. 등록 버튼 (오른쪽 절대 위치) */}
                        <div className="absolute right-0 flex-shrink-0 z-10">
                            {currentTab === 'customer' ? (
                                <button onClick={() => setIsCustomerRegOpen(true)}
                                        className="h-11 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors shadow-sm text-sm font-medium whitespace-nowrap">
                                    <PlusIcon/> <span>고객 등록</span></button>
                            ) : (
                                <button onClick={() => setIsCompanyRegOpen(true)}
                                        className="h-11 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition-colors shadow-sm text-sm font-medium whitespace-nowrap">
                                    <PlusIcon/> <span>고객사 등록</span></button>
                            )}
                        </div>
                    </div>

                    {/* ====== 메인 테이블 영역 ====== */}
                    <div
                        className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 flex flex-col">
                        <Tabs.Content value="customer" className="outline-none">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse table-fixed min-w-[1000px]">
                                    <thead className="bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-sm font-semibold w-[15%] whitespace-nowrap">고객명</th>
                                        <th className="px-6 py-4 text-sm font-semibold w-[15%] whitespace-nowrap">고객사</th>
                                        <th className="px-6 py-4 text-sm font-semibold w-[15%] whitespace-nowrap">부서 / 파트</th>
                                        <th className="px-6 py-4 text-sm font-semibold w-[10%] whitespace-nowrap">직급</th>
                                        <th className="px-6 py-4 text-sm font-semibold w-[15%] whitespace-nowrap">이메일</th>
                                        <th className="px-6 py-4 text-sm font-semibold w-[15%] whitespace-nowrap">연락처</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-center w-[10%] whitespace-nowrap">관리</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                                    {isLoading ? (
                                        <TableLoader colSpan={7} />
                                    ) : paginatedCustomers.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" className="px-6">
                                                <div
                                                    className="h-[60vh] flex flex-col items-center justify-center gap-4 text-gray-400 dark:text-gray-500">
                                                    <div className="bg-gray-50 dark:bg-slate-700/50 p-6 rounded-full">
                                                        {/* DocumentIcon을 크게 표시 */}
                                                        <DocumentIcon className="w-10 h-10 opacity-50"/>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-lg font-medium text-gray-500 dark:text-gray-400">데이터가
                                                            존재하지 않습니다.</p>
                                                        <p className="text-sm text-gray-400 mt-1">새로운 고객, 고객사를 등록하거나 검색어를
                                                            변경해보세요.</p>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedCustomers.map(c => (
                                            <tr key={c.id}
                                                className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                                                onClick={() => setSelectedCustomer(c)}>
                                                <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className="p-1.5 bg-blue-50 dark:bg-slate-700/50 rounded-full text-blue-600 dark:text-blue-400 flex-shrink-0">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor"
                                                                 viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round"
                                                                      strokeWidth={2}
                                                                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                                            </svg>
                                                        </div>
                                                        <div className="truncate min-w-0" title={c.name}>{c.name}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                                    <button onClick={(e) => { e.stopPropagation(); handleCompanyLinkClick(c.company); }} className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline text-left truncate w-full block" title={c.company}>{c.company}</button>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 truncate" title={`${c.department || ''} ${c.part ? '/ ' + c.part : ''}`}>{c.department}{c.part && ` / ${c.part}`}</td>
                                                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 truncate">{c.position}</td>
                                                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 truncate" title={c.email}>{c.email}</td>
                                                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 truncate">{c.contact || '-'}</td>
                                                <td className="px-6 py-4 text-center whitespace-nowrap">
                                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteCustomer(null, c.id); }} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"><TrashIcon/></button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                    </tbody>
                                </table>
                            </div>
                            <Pagination totalItems={filteredCustomers.length} itemsPerPage={itemsPerPage} currentPage={currentPage} onPageChange={setCurrentPage} />
                        </Tabs.Content>

                        <Tabs.Content value="company" className="h-full outline-none">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse table-fixed min-w-[1000px]">
                                    <thead className="bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-sm font-semibold w-[20%] whitespace-nowrap">고객사명</th>
                                        <th className="px-6 py-4 text-sm font-semibold w-[15%] whitespace-nowrap">사업자번호</th>
                                        <th className="px-6 py-4 text-sm font-semibold w-[15%] whitespace-nowrap">대표전화</th>
                                        <th className="px-6 py-4 text-sm font-semibold w-[20%] whitespace-nowrap">이메일</th>
                                        <th className="px-6 py-4 text-sm font-semibold w-[20%] whitespace-nowrap">주소</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-center w-[10%] whitespace-nowrap">관리</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                                    {isLoading ? (
                                        <TableLoader colSpan={6} />
                                    ) : paginatedCompanies.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" className="px-6">
                                                <div
                                                    className="h-[60vh] flex flex-col items-center justify-center gap-4 text-gray-400 dark:text-gray-500">
                                                    <div className="bg-gray-50 dark:bg-slate-700/50 p-6 rounded-full">
                                                        {/* DocumentIcon을 크게 표시 */}
                                                        <DocumentIcon className="w-10 h-10 opacity-50"/>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-lg font-medium text-gray-500 dark:text-gray-400">데이터가
                                                            존재하지 않습니다.</p>
                                                        <p className="text-sm text-gray-400 mt-1">새로운 고객, 고객사를 등록하거나 검색어를
                                                            변경해보세요.</p>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedCompanies.map(c => (
                                            <tr key={c.id}
                                                className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                                                onClick={() => setSelectedCompany({data: c, mode: 'edit'})}>
                                                <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100 truncate"
                                                    title={c.name}>{c.name}</td>
                                                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 truncate">{c.reg}</td>
                                                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 truncate">{c.tel || '-'}</td>
                                                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 truncate"
                                                    title={c.email}>{c.email}</td>
                                                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 truncate"
                                                    title={c.address}>{c.address || '-'}</td>
                                                <td className="px-6 py-4 text-center whitespace-nowrap">
                                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteCompany(null, c.id); }} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"><TrashIcon/></button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                    </tbody>
                                </table>
                            </div>
                            <Pagination totalItems={filteredCompanies.length} itemsPerPage={itemsPerPage} currentPage={currentPage} onPageChange={setCurrentPage} />
                        </Tabs.Content>
                    </div>
                </Tabs.Root>

                {/* --- 모달 영역 (기존 코드 유지) --- */}
                {/* 1. 고객 등록 */}
                <Dialog.Root open={isCustomerRegOpen} onOpenChange={setIsCustomerRegOpen}>
                    <Dialog.Portal>
                        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"/>
                        <Dialog.Content className={modalContentStyle}>
                            <div
                                className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
                                <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-white">
                                    신규 고객 등록</Dialog.Title>
                                <Dialog.Close asChild>
                                    <button
                                        className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                        <XIcon/></button>
                                </Dialog.Close>
                            </div>
                            <div className="p-6 space-y-5 overflow-y-auto flex-1">
                                <div className="grid grid-cols-12 gap-4">
                                    <div className="col-span-6"><label className={labelStyle}>고객명</label><input
                                        name="name" onChange={handleCustomerRegChange} className={inputStyle}/></div>
                                    <div className="col-span-6"><label className={labelStyle}>고객사</label>
                                        <div className="relative">
                                            <select name="companyName" onChange={handleCustomerRegChange}
                                                    className={`${inputStyle} appearance-none pr-8`}
                                                    value={customerForm.companyName}>
                                                <option value="">선택</option>
                                                {companyList.map(c => <option key={c.id}
                                                                              value={c.name}>{c.name}</option>)}
                                            </select>
                                            <div
                                                className="absolute right-0 top-0 h-full px-2 flex items-center pointer-events-none text-gray-500">
                                                <ChevronDownIcon/></div>
                                        </div>
                                    </div>
                                    <div className="col-span-4"><label className={labelStyle}>부서</label><input
                                        name="department" onChange={handleCustomerRegChange} className={inputStyle}/>
                                    </div>
                                    <div className="col-span-4"><label className={labelStyle}>파트</label><input
                                        name="part" onChange={handleCustomerRegChange} className={inputStyle}/></div>
                                    <div className="col-span-4"><label className={labelStyle}>직급</label><input
                                        name="position" onChange={handleCustomerRegChange} className={inputStyle}/>
                                    </div>
                                    <div className="col-span-6"><label className={labelStyle}>이메일</label><input
                                        name="email" onChange={handleCustomerRegChange} className={inputStyle}/></div>
                                    <div className="col-span-6"><label className={labelStyle}>연락처</label><input
                                        name="contact" onChange={handleCustomerRegChange} className={inputStyle}/></div>
                                </div>
                                <div><label className={labelStyle}>담당 업무</label>
                                    <div className="flex gap-2 mb-3">
                                        <div className="relative flex-1"><input list="tasks" value={taskInput}
                                                                                onChange={(e) => setTaskInput(e.target.value)}
                                                                                className={`${inputStyle} w-full`}
                                                                                placeholder="업무 입력 후 추가"/>
                                            <datalist id="tasks">{allUniqueTasks.map((t, i) => <option key={i}
                                                                                                       value={t}/>)}</datalist>
                                        </div>
                                        <button onClick={() => handleAddCustomerTask(false)}
                                                className="px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shrink-0">추가
                                        </button>
                                    </div>
                                    <div
                                        className="flex flex-wrap gap-2 min-h-[40px] bg-gray-50 dark:bg-slate-900 rounded-lg p-2 border border-gray-100 dark:border-slate-700">
                                        {customerForm.responsibilities.length === 0 &&
                                            <span className="text-gray-400 text-xs self-center">추가된 업무가 없습니다.</span>}
                                        {customerForm.responsibilities.map((t, i) => (<span key={i}
                                                                                            className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-md text-xs flex items-center gap-1.5 shadow-sm">{t}
                                            <button onClick={() => handleRemoveCustomerTask(i, false)}
                                                    className="hover:text-red-500"><XIcon className="w-3 h-3"/></button></span>))}
                                    </div>
                                </div>
                                <div><label className={labelStyle}>메모</label><textarea name="memo" rows="3"
                                                                                       onChange={handleCustomerRegChange}
                                                                                       className={`${inputStyle} resize-none`}></textarea>
                                </div>
                            </div>
                            <div
                                className="p-5 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 flex justify-end gap-3 mt-auto">
                                <Dialog.Close asChild>
                                    <button
                                        className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium shadow-sm">취소
                                    </button>
                                </Dialog.Close>
                                <button onClick={handleCustomerSubmit}
                                        className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm">등록하기
                                </button>
                            </div>
                        </Dialog.Content>
                    </Dialog.Portal>
                </Dialog.Root>

                {/* 2. 고객 수정 모달 */}
                <Dialog.Root open={!!selectedCustomer} onOpenChange={(o) => !o && setSelectedCustomer(null)}>
                    <Dialog.Portal>
                        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"/>
                        <Dialog.Content className={modalContentStyle}>
                            <div
                                className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
                                <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-white">고객 정보
                                    수정</Dialog.Title>
                                <Dialog.Close asChild>
                                    <button
                                        className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                        <XIcon/></button>
                                </Dialog.Close>
                            </div>
                            {editingCustomer && (
                                <div className="p-6 space-y-5 overflow-y-auto flex-1">
                                    <div className="grid grid-cols-12 gap-4">
                                        <div className="col-span-6"><label className={labelStyle}>고객명</label><input
                                            name="name" value={editingCustomer.name} onChange={handleEditCustomerChange}
                                            className={inputStyle}/></div>
                                        <div className="col-span-6"><label className={labelStyle}>고객사</label><select
                                            name="company" value={editingCustomer.company}
                                            onChange={handleEditCustomerChange} className={inputStyle}>
                                            <option value="">선택</option>
                                            {companyList.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                        </select></div>
                                        <div className="col-span-4"><label className={labelStyle}>부서</label><input
                                            name="department" value={editingCustomer.department || ''}
                                            onChange={handleEditCustomerChange} className={inputStyle}/></div>
                                        <div className="col-span-4"><label className={labelStyle}>파트</label><input
                                            name="part" value={editingCustomer.part || ''}
                                            onChange={handleEditCustomerChange} className={inputStyle}/></div>
                                        <div className="col-span-4"><label className={labelStyle}>직급</label><input
                                            name="position" value={editingCustomer.position || ''}
                                            onChange={handleEditCustomerChange} className={inputStyle}/></div>
                                        <div className="col-span-6"><label className={labelStyle}>이메일</label><input
                                            name="email" value={editingCustomer.email || ''}
                                            onChange={handleEditCustomerChange} className={inputStyle}/></div>
                                        <div className="col-span-6"><label className={labelStyle}>연락처</label><input
                                            name="contact" value={editingCustomer.contact || ''}
                                            onChange={handleEditCustomerChange} className={inputStyle}/></div>
                                    </div>
                                    <div><label className={labelStyle}>담당 업무</label>
                                        <div className="flex gap-2 mb-3">
                                            <div className="relative flex-1"><input list="tasks-edit" value={taskInput}
                                                                                    onChange={(e) => setTaskInput(e.target.value)}
                                                                                    className={`${inputStyle} w-full`}
                                                                                    placeholder="업무 추가"/>
                                                <datalist id="tasks-edit">{allUniqueTasks.map((t, i) => <option key={i}
                                                                                                                value={t}/>)}</datalist>
                                            </div>
                                            <button onClick={() => handleAddCustomerTask(true)}
                                                    className="px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shrink-0">추가
                                            </button>
                                        </div>
                                        <div
                                            className="flex flex-wrap gap-2 min-h-[40px] bg-gray-50 dark:bg-slate-900 rounded-lg p-2 border border-gray-100 dark:border-slate-700">
                                            {(!editingCustomer.responsibilities || editingCustomer.responsibilities.length === 0) &&
                                                <span
                                                    className="text-gray-400 text-xs self-center">추가된 업무가 없습니다.</span>}
                                            {editingCustomer.responsibilities?.map((t, i) => (<span key={i}
                                                                                                    className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-md text-xs flex items-center gap-1.5 shadow-sm">{t}
                                                <button onClick={() => handleRemoveCustomerTask(i, true)}
                                                        className="hover:text-red-500"><XIcon
                                                    className="w-3 h-3"/></button></span>))}
                                        </div>
                                    </div>
                                    <div><label className={labelStyle}>메모</label><textarea name="memo"
                                                                                           value={editingCustomer.memo || ''}
                                                                                           onChange={handleEditCustomerChange}
                                                                                           rows="3"
                                                                                           className={`${inputStyle} resize-none`}></textarea>
                                    </div>
                                </div>
                            )}
                            <div
                                className="p-5 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 flex justify-between mt-auto">
                                <button onClick={handleDeleteCustomer}
                                        className="px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium shadow-sm">삭제
                                </button>
                                <div className="flex gap-3">
                                    <Dialog.Close asChild>
                                        <button
                                            className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium shadow-sm">취소
                                        </button>
                                    </Dialog.Close>
                                    <button onClick={handleUpdateCustomer}
                                            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm">저장하기
                                    </button>
                                </div>
                            </div>
                        </Dialog.Content>
                    </Dialog.Portal>
                </Dialog.Root>

                {/* 3. 고객사 등록 모달 */}
                <Dialog.Root open={isCompanyRegOpen} onOpenChange={setIsCompanyRegOpen}>
                    <Dialog.Portal>
                        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"/>
                        <Dialog.Content className={modalContentStyle}>
                            <div
                                className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
                                <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-white">신규 고객사
                                    등록</Dialog.Title>
                                <Dialog.Close asChild>
                                    <button
                                        className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                        <XIcon/></button>
                                </Dialog.Close>
                            </div>
                            <div className="p-6 space-y-5 overflow-y-auto flex-1">
                                <div className="grid grid-cols-12 gap-4">
                                    <div className="col-span-12"><label className={labelStyle}>고객사명</label><input
                                        name="name" onChange={handleCompanyRegChange} className={inputStyle}/></div>
                                    <div className="col-span-6"><label className={labelStyle}>사업자번호</label><input
                                        name="regNo" onChange={handleCompanyRegChange} className={inputStyle}/></div>
                                    <div className="col-span-6"><label className={labelStyle}>대표전화</label><input
                                        name="phone" onChange={handleCompanyRegChange} className={inputStyle}/></div>
                                    <div className="col-span-12"><label className={labelStyle}>이메일</label><input
                                        name="email" onChange={handleCompanyRegChange} className={inputStyle}/></div>
                                    <div className="col-span-12"><label className={labelStyle}>주소</label><input
                                        name="address" onChange={handleCompanyRegChange} className={inputStyle}/></div>
                                </div>
                                <div><label className={labelStyle}>메모</label><textarea name="memo" rows="3"
                                                                                       onChange={handleCompanyRegChange}
                                                                                       className={`${inputStyle} resize-none`}></textarea>
                                </div>
                            </div>
                            <div
                                className="p-5 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 flex justify-end gap-3 mt-auto">
                                <Dialog.Close asChild>
                                    <button
                                        className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium shadow-sm">취소
                                    </button>
                                </Dialog.Close>
                                <button onClick={handleCompanySubmit}
                                        className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium shadow-sm">등록하기
                                </button>
                            </div>
                        </Dialog.Content>
                    </Dialog.Portal>
                </Dialog.Root>

                {/* 4. 고객사 수정 모달 */}
                <Dialog.Root open={!!selectedCompany} onOpenChange={(o) => !o && setSelectedCompany(null)}>
                    <Dialog.Portal>
                        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"/>
                        <Dialog.Content className={modalContentStyle}>
                            <div
                                className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
                                <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-white">고객사
                                    정보</Dialog.Title>
                                <Dialog.Close asChild>
                                    <button
                                        className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                        <XIcon/></button>
                                </Dialog.Close>
                            </div>
                            {editingCompany && (
                                <div className="p-6 space-y-5 overflow-y-auto flex-1">
                                    <div className="grid grid-cols-12 gap-4">
                                        <div className="col-span-12"><label className={labelStyle}>고객사명</label><input
                                            name="name" value={editingCompany.name} onChange={handleEditCompanyChange}
                                            className={inputStyle} readOnly={selectedCompany?.mode === 'view'}/></div>
                                        <div className="col-span-6"><label className={labelStyle}>사업자번호</label><input
                                            name="reg" value={editingCompany.reg} onChange={handleEditCompanyChange}
                                            className={inputStyle} readOnly={selectedCompany?.mode === 'view'}/></div>
                                        <div className="col-span-6"><label className={labelStyle}>대표전화</label><input
                                            name="tel" value={editingCompany.tel} onChange={handleEditCompanyChange}
                                            className={inputStyle} readOnly={selectedCompany?.mode === 'view'}/></div>
                                        <div className="col-span-12"><label className={labelStyle}>이메일</label><input
                                            name="email" value={editingCompany.email} onChange={handleEditCompanyChange}
                                            className={inputStyle} readOnly={selectedCompany?.mode === 'view'}/></div>
                                        <div className="col-span-12"><label className={labelStyle}>주소</label><input
                                            name="address" value={editingCompany.address}
                                            onChange={handleEditCompanyChange} className={inputStyle}
                                            readOnly={selectedCompany?.mode === 'view'}/></div>
                                    </div>
                                    <div><label className={labelStyle}>메모</label><textarea name="memo"
                                                                                           value={editingCompany.memo}
                                                                                           onChange={handleEditCompanyChange}
                                                                                           rows="3"
                                                                                           className={`${inputStyle} resize-none`}
                                                                                           readOnly={selectedCompany?.mode === 'view'}></textarea>
                                    </div>
                                </div>
                            )}
                            <div
                                className="p-5 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 flex justify-end gap-3 mt-auto">
                                {selectedCompany?.mode === 'edit' ? (
                                    <>
                                        <button onClick={handleDeleteCompany}
                                                className="px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium shadow-sm">삭제
                                        </button>
                                        <Dialog.Close asChild>
                                            <button
                                                className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium shadow-sm">취소
                                            </button>
                                        </Dialog.Close>
                                        <button onClick={handleUpdateCompany}
                                                className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium shadow-sm">저장하기
                                        </button>
                                    </>
                                ) : (
                                    <Dialog.Close asChild>
                                        <button
                                            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm">닫기
                                        </button>
                                    </Dialog.Close>
                                )}
                            </div>
                        </Dialog.Content>
                    </Dialog.Portal>
                </Dialog.Root>

            </div>
        </Tooltip.Provider>
    );
}