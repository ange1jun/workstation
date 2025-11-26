import React, { useState, useEffect, useMemo } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import * as Dialog from '@radix-ui/react-dialog';
import * as Tooltip from '@radix-ui/react-tooltip';
import Swal from 'sweetalert2';

// --- 아이콘 컴포넌트 ---
const PlusIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>;
const XIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>;
const SearchIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>;
const TrashIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>;
const ChevronDownIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>;
const SettingsIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.941 3.31.81 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.81 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756 0 3.35a1.724 1.724 0 00-3.35 0c-.426-1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.941-3.31-.81-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.81-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065zM12 15a3 3 0 110-6 3 3 0 010 6z"></path></svg>;


export default function Customers() {
    const [currentTab, setCurrentTab] = useState('customer');
    const [searchTerm, setSearchTerm] = useState('');

    // --- 모달 Open 상태 ---
    const [isCustomerRegOpen, setIsCustomerRegOpen] = useState(false);
    const [isCompanyRegOpen, setIsCompanyRegOpen] = useState(false);

    // --- 선택된 데이터 (상세/수정용) ---
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [editingCompany, setEditingCompany] = useState(null);

    // --- 폼 상태 ---
    const [customerForm, setCustomerForm] = useState({
        name: '', companyName: '', department: '', part: '', rank: '',
        email: '', phone: '', mobile: '', memo: '', responsibilities: [],
    });
    const [companyForm, setCompanyForm] = useState({
        name: '', regNo: '', rep: '', phone: '', address: '', email: '', memo: ''
    });
    const [taskInput, setTaskInput] = useState('');

    // --- 데이터 (더미) ---
    const [companyList, setCompanyList] = useState([
        { id: 1, name: '네이버', regNo: '123-45-67890', rep: '홍길동', tel: '031-123-4567', address: '경기도 성남시', email: 'contact@naver.com', memo: '주요 파트너' },
        { id: 2, name: '카카오', regNo: '987-65-43210', rep: '임꺽정', tel: '031-987-6543', address: '제주도 제주시', email: 'contact@kakao.com', memo: '' },
    ]);

    const [customerList, setCustomerList] = useState([
        { id: 1, name: '김철수', company: '네이버', dept: '개발팀', part: '백엔드', rank: '책임', email: 'cs.kim@naver.com', mobile: '010-1111-2222', responsibilities: ['API 설계', 'DB 최적화'], memo: '특이사항 없음' },
        { id: 2, name: '이영희', company: '카카오', dept: '기획팀', part: '서비스기획', rank: '선임', email: 'yh.lee@kakao.com', mobile: '010-3333-4444', responsibilities: ['화면 기획'], memo: '' },
    ]);

    // --- 자동완성 데이터 ---
    const allUniqueTasks = useMemo(() => [...new Set(customerList.flatMap(c => c.responsibilities || []))], [customerList]);

    // --- Effect: 상세 모달 열릴 때 편집용 state 초기화 ---
    useEffect(() => { if (selectedCustomer) setEditingCustomer({ ...selectedCustomer }); }, [selectedCustomer]);

    useEffect(() => {
        if (selectedCompany && selectedCompany.data) {
            setEditingCompany({ ...selectedCompany.data });
        } else {
            setEditingCompany(null); // 데이터가 없으면 null 처리
        }
    }, [selectedCompany]);

    // --- 필터링 ---
    const filteredCustomers = customerList.filter(c => c.name.includes(searchTerm) || c.company.includes(searchTerm));
    const filteredCompanies = companyList.filter(c => c.name.includes(searchTerm) || c.regNo.includes(searchTerm));

    // ==========================================
    //  핸들러
    // ==========================================
    const handleAddCustomerTask = (isEditing = false) => {
        if (!taskInput.trim()) return;
        const targetSet = isEditing ? setEditingCustomer : setCustomerForm;
        targetSet(prev => ({ ...prev, responsibilities: [...prev.responsibilities, taskInput.trim()] }));
        setTaskInput('');
    };

    const handleRemoveCustomerTask = (index, isEditing = false) => {
        const targetSet = isEditing ? setEditingCustomer : setCustomerForm;
        targetSet(prev => ({ ...prev, responsibilities: prev.responsibilities.filter((_, i) => i !== index) }));
    };

    const handleCustomerRegChange = (e) => {
        const { name, value } = e.target;
        setCustomerForm(prev => ({ ...prev, [name]: value }));
    };

    const handleCustomerSubmit = () => {
        if (!customerForm.companyName) { Swal.fire('입력 오류', '고객사를 선택해주세요.', 'warning'); return; }

        setCustomerList([...customerList, { ...customerForm, id: Date.now(), company: customerForm.companyName }]);
        setIsCustomerRegOpen(false);
        setCustomerForm({ name: '', companyName: '', department: '', part: '', rank: '', email: '', phone: '', mobile: '', memo: '', responsibilities: [] });
        Swal.fire({ icon: 'success', title: '등록 완료', text: '신규 고객이 등록되었습니다.', timer: 1500, showConfirmButton: false });
    };

    const handleCompanyRegChange = (e) => { const { name, value } = e.target; setCompanyForm(prev => ({ ...prev, [name]: value })); };
    const handleCompanySubmit = () => {
        setCompanyList([...companyList, {
            ...companyForm,
            id: Date.now(),
            tel: companyForm.phone // phone의 값을 tel 필드에 복사
        }]);

        setIsCompanyRegOpen(false);
        setCompanyForm({ name: '', regNo: '', rep: '', phone: '', address: '', email: '', memo: '' });
        Swal.fire({ icon: 'success', title: '등록 완료', text: '신규 고객사가 등록되었습니다.', timer: 1500, showConfirmButton: false });
    };

    const handleEditCustomerChange = (e) => { const { name, value } = e.target; setEditingCustomer(prev => ({ ...prev, [name]: value })); };

    const handleUpdateCustomer = () => {
        Swal.fire({
            title: '수정하시겠습니까?', text: "입력한 정보로 갱신합니다.", icon: 'question',
            showCancelButton: true, confirmButtonColor: '#3085d6', cancelButtonColor: '#d33', confirmButtonText: '수정', cancelButtonText: '취소'
        }).then((result) => {
            if (result.isConfirmed) {
                setCustomerList(prev => prev.map(c => c.id === editingCustomer.id ? editingCustomer : c));
                setSelectedCustomer(null);
                Swal.fire({ icon: 'success', title: '수정 완료', text: '성공적으로 수정되었습니다.', timer: 1500, showConfirmButton: false });
            }
        });
    };

    const handleDeleteCustomer = () => {
        Swal.fire({
            title: '정말 삭제하시겠습니까?', text: "복구할 수 없습니다.", icon: 'warning',
            showCancelButton: true, confirmButtonColor: '#d33', cancelButtonColor: '#3085d6', confirmButtonText: '삭제', cancelButtonText: '취소'
        }).then((result) => {
            if (result.isConfirmed) {
                setCustomerList(prev => prev.filter(c => c.id !== editingCustomer.id));
                setSelectedCustomer(null);
                Swal.fire({ icon: 'success', title: '삭제 완료', text: '삭제되었습니다.', timer: 1500, showConfirmButton: false });
            }
        });
    };

    const handleEditCompanyChange = (e) => { const { name, value } = e.target; setEditingCompany(prev => ({ ...prev, [name]: value })); };

    const handleUpdateCompany = () => {
        Swal.fire({
            title: '수정하시겠습니까?', icon: 'question',
            showCancelButton: true, confirmButtonColor: '#3085d6', cancelButtonColor: '#d33', confirmButtonText: '수정', cancelButtonText: '취소'
        }).then((res) => {
            if (res.isConfirmed) {
                setCompanyList(prev => prev.map(c => c.id === editingCompany.id ? editingCompany : c));
                setSelectedCompany(null);
                Swal.fire({ icon: 'success', title: '수정 완료', text: '성공적으로 수정되었습니다.', timer: 1500, showConfirmButton: false });
            }
        });
    };

    const handleDeleteCompany = () => {
        Swal.fire({
            title: '삭제하시겠습니까?', icon: 'warning',
            showCancelButton: true, confirmButtonColor: '#d33', cancelButtonColor: '#3085d6', confirmButtonText: '삭제', cancelButtonText: '취소'
        }).then((res) => {
            if (res.isConfirmed) {
                setCompanyList(prev => prev.filter(c => c.id !== editingCompany.id));
                setSelectedCompany(null);
                Swal.fire('삭제 완료', '삭제되었습니다.', 'success');
            }
        });
    };

    const handleCompanyLinkClick = (companyName) => {
        const found = companyList.find(c => c.name === companyName);
        if (found) {
            setSelectedCompany({ data: found, mode: 'view' });
        } else {
            Swal.fire({ icon: 'error', title: '오류', text: '등록되지 않은 고객사 정보입니다.' });
        }
    };

    // --- 스타일 ---
    const inputStyle = "w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-colors";
    const labelStyle = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
    const modalContentStyle = "fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-[650px] translate-x-[-50%] translate-y-[-50%] rounded-xl bg-white dark:bg-slate-800 shadow-2xl focus:outline-none z-50 overflow-y-auto border border-gray-200 dark:border-slate-700 transition-colors";

    return (
        <Tooltip.Provider delayDuration={300}>
            <style>{`
                .swal2-container {
                    z-index: 99999 !important;
                    pointer-events: auto !important;
                }
            `}</style>

            <div className="p-8 max-w-7xl mx-auto min-h-screen text-gray-900 dark:text-gray-100 transition-colors duration-300">
                <Tabs.Root value={currentTab} onValueChange={setCurrentTab}>
                    {/* 상단 탭 */}
                    <div className="flex justify-start items-end mb-4 pb-2 transition-colors">
                        <Tabs.List className="flex gap-4">
                            <Tabs.Trigger value="customer"
                                          className="text-2xl font-bold pb-2 px-1 text-gray-400 dark:text-gray-500 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:border-b-4 data-[state=active]:border-blue-600 transition-colors">고객
                                관리</Tabs.Trigger>
                            <Tabs.Trigger value="company"
                                          className="text-2xl font-bold pb-2 px-1 text-gray-400 dark:text-gray-500 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:border-b-4 data-[state=active]:border-blue-600 transition-colors">고객사
                                관리</Tabs.Trigger>
                        </Tabs.List>
                    </div>

                    {/* 컨트롤 바 */}
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                        <div className="hidden md:block w-32"></div>
                        <div className="relative w-full md:w-96">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <SearchIcon/></div>
                            <input type="text"
                                   className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-full bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition-colors shadow-sm"
                                   placeholder="검색 (고객명, 고객사)" value={searchTerm}
                                   onChange={(e) => setSearchTerm(e.target.value)}/>
                        </div>
                        <div className="w-full md:w-auto flex justify-end">
                            {currentTab === 'customer' ? (
                                <button onClick={() => setIsCustomerRegOpen(true)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm whitespace-nowrap">
                                    <PlusIcon/> 고객 등록</button>
                            ) : (
                                <button onClick={() => setIsCompanyRegOpen(true)}
                                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm whitespace-nowrap">
                                    <PlusIcon/> 고객사 등록</button>
                            )}
                        </div>
                    </div>

                    {/* 메인 테이블 영역 */}
                    <div
                        className="bg-transparent dark:bg-slate-800/50 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden transition-colors duration-300">
                        <Tabs.Content value="customer" className="outline-none">
                            <table className="w-full text-left">
                                {/* 헤더: 라이트 모드에서 투명 (bg-transparent) */}
                                <thead
                                    className="bg-transparent dark:bg-white/5 text-gray-700 dark:text-gray-400 uppercase text-sm font-bold border-b border-gray-200 dark:border-slate-700">
                                <tr>
                                    <th className="px-6 py-4">고객명</th>
                                    <th className="px-6 py-4">고객사</th>
                                    <th className="px-6 py-4">부서 / 파트</th>
                                    <th className="px-6 py-4">직급</th>
                                    <th className="px-6 py-4">이메일</th>
                                    <th className="px-6 py-4">휴대폰번호</th>
                                    <th className="px-6 py-4 text-center">관리</th>
                                </tr>
                                </thead>
                                {/* 본문: 배경 투명, 디바이더 반투명 */}
                                <tbody
                                    className="divide-y divide-gray-200/50 dark:divide-slate-700/50 bg-transparent dark:bg-transparent">
                                {filteredCustomers.map(customer => (
                                    <tr key={customer.id}
                                        className="hover:bg-gray-100/50 dark:hover:bg-white/10 transition-colors">
                                        <td className="px-6 py-4 font-bold text-gray-900 dark:text-gray-100">{customer.name}</td>
                                        <td className="px-6 py-4 font-medium">
                                            <button onClick={() => handleCompanyLinkClick(customer.company)}
                                                    className="text-blue-600 dark:text-blue-400 hover:underline focus:outline-none">{customer.company}</button>
                                        </td>
                                        {/* 부서/파트 병합 표시 */}
                                        <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                                            {customer.department}
                                            {customer.department && customer.part &&
                                                <span className="mx-1 text-gray-400">/</span>}
                                            {customer.part}
                                        </td>
                                        <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{customer.rank}</td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{customer.email}</td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{customer.mobile || '-'}</td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => setSelectedCustomer(customer)}
                                                className="p-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"
                                            >
                                                <SettingsIcon className="w-5 h-5"/>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </Tabs.Content>
                        <Tabs.Content value="company" className="outline-none">
                            <table className="w-full text-left">
                                <thead
                                    className="bg-transparent dark:bg-white/5 text-gray-700 dark:text-gray-400 uppercase text-sm font-bold border-b border-gray-200 dark:border-slate-700">
                                <tr>
                                    <th className="px-6 py-4">고객사명</th>
                                    <th className="px-6 py-4">사업자번호</th>
                                    <th className="px-6 py-4">회계담당자</th>
                                    <th className="px-6 py-4">대표전화</th>
                                    <th className="px-6 py-4">이메일</th>
                                    <th className="px-6 py-4 text-center">관리</th>
                                </tr>
                                </thead>
                                <tbody
                                    className="divide-y divide-gray-200/50 dark:divide-slate-700/50 bg-transparent dark:bg-transparent">
                                {filteredCompanies.map(company => (
                                    <tr key={company.id}
                                        className="hover:bg-gray-100/50 dark:hover:bg-white/10 transition-colors">
                                        <td className="px-6 py-4 font-bold text-gray-900 dark:text-gray-100">{company.name}</td>
                                        <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{company.regNo}</td>
                                        <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{company.rep}</td>
                                        <td className="px-6 py-4 text-gray-800 dark:text-gray-300">{company.tel || '-'}</td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{company.email}</td>
                                        <td className="px-6 py-4 text-center">
                                            <button onClick={() => setSelectedCompany({data: company, mode: 'edit'})}
                                                    className="p-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-slate-700">
                                                <SettingsIcon className="w-5 h-5"/>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </Tabs.Content>
                    </div>
                </Tabs.Root>

                {/* ==================== 모달 영역 ==================== */}

                {/* 1. 고객 등록 모달 */}
                <Dialog.Root open={isCustomerRegOpen} onOpenChange={setIsCustomerRegOpen}>
                    <Dialog.Portal>
                        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"/>
                        <Dialog.Content className={modalContentStyle}>
                            <div
                                className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
                                <Dialog.Title className="text-xl font-bold text-gray-800 dark:text-gray-100">신규 고객
                                    등록</Dialog.Title>
                                <Dialog.Close asChild>
                                    <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                        <XIcon/></button>
                                </Dialog.Close>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className={labelStyle}>고객명</label><input name="name"
                                                                                         onChange={handleCustomerRegChange}
                                                                                         className={inputStyle}/></div>
                                    <div>
                                        <label className={labelStyle}>고객사 (선택)</label>
                                        <div className="relative">
                                            <select name="companyName" onChange={handleCustomerRegChange}
                                                    className={`${inputStyle} appearance-none pr-8`}
                                                    value={customerForm.companyName}>
                                                <option value="">고객사 선택</option>
                                                {companyList.map(comp => (
                                                    <option key={comp.id} value={comp.name}>{comp.name}</option>))}
                                            </select>
                                            <div
                                                className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500">
                                                <ChevronDownIcon/>
                                            </div>
                                        </div>
                                    </div>
                                    {/* ⭐ 부서/파트 2개 입력 폼으로 분리 ⭐ */}
                                    <div>
                                        <label className={labelStyle}>부서 / 파트</label>
                                        <div className="flex gap-2">
                                            <input name="department" onChange={handleCustomerRegChange}
                                                   className={inputStyle} placeholder="부서"/>
                                            <input name="part" onChange={handleCustomerRegChange} className={inputStyle}
                                                   placeholder="파트"/>
                                        </div>
                                    </div>
                                    <div><label className={labelStyle}>직급</label><input name="rank"
                                                                                        onChange={handleCustomerRegChange}
                                                                                        className={inputStyle}/></div>
                                    <div><label className={labelStyle}>이메일</label><input name="email"
                                                                                         onChange={handleCustomerRegChange}
                                                                                         className={inputStyle}/></div>
                                    <div><label className={labelStyle}>휴대폰</label><input name="mobile"
                                                                                         onChange={handleCustomerRegChange}
                                                                                         className={inputStyle}/></div>
                                </div>
                                <div>
                                    <label className={labelStyle}>담당 업무</label>
                                    <div className="flex gap-2 mb-2">
                                        <input list="task-suggestions" value={taskInput}
                                               onChange={(e) => setTaskInput(e.target.value)} className={inputStyle}
                                               placeholder="업무 입력"/>
                                        <datalist id="task-suggestions">
                                            {allUniqueTasks.map((task, i) => <option key={i} value={task}/>)}
                                        </datalist>
                                        <button onClick={() => handleAddCustomerTask(false)}
                                                className="bg-blue-600 text-white px-4 rounded-lg whitespace-nowrap">추가
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {customerForm.responsibilities.map((t, i) => (
                                            <Tooltip.Root key={i}>
                                                <Tooltip.Trigger asChild>
                                                    <span
                                                        className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-sm flex items-center gap-1 cursor-help">
                                                        {t}
                                                        <button onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRemoveCustomerTask(i, false);
                                                        }}><XIcon/></button>
                                                    </span>
                                                </Tooltip.Trigger>
                                                <Tooltip.Portal>
                                                    <Tooltip.Content className="z-[60] bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-md animate-in fade-in zoom-in-95" sideOffset={5}>
                                                        {t}
                                                        <Tooltip.Arrow className="fill-gray-900" />
                                                    </Tooltip.Content>
                                                </Tooltip.Portal>
                                            </Tooltip.Root>
                                        ))}
                                    </div>
                                </div>
                                <div><label className={labelStyle}>메모</label><textarea name="memo" rows="3" onChange={handleCustomerRegChange} className={`${inputStyle} resize-none`}></textarea></div>
                            </div>
                            <div className="p-6 border-t border-gray-200 dark:border-slate-700 flex justify-end gap-3">
                                <Dialog.Close asChild><button className="px-4 py-2 text-gray-600 dark:text-gray-300">취소</button></Dialog.Close>
                                <button onClick={handleCustomerSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-lg">등록 완료</button>
                            </div>
                        </Dialog.Content>
                    </Dialog.Portal>
                </Dialog.Root>

                {/* 2. 고객 상세/수정 모달 */}
                <Dialog.Root open={!!selectedCustomer} onOpenChange={(open) => !open && setSelectedCustomer(null)}>
                    <Dialog.Portal>
                        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" />
                        <Dialog.Content className={modalContentStyle}>
                            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
                                <Dialog.Title className="text-xl font-bold text-gray-800 dark:text-gray-100">고객 정보 수정</Dialog.Title>
                                <Dialog.Close asChild><button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><XIcon /></button></Dialog.Close>
                            </div>
                            {editingCustomer && (
                                <div className="p-6 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><label className={labelStyle}>고객명</label><input name="name" value={editingCustomer.name} onChange={handleEditCustomerChange} className={inputStyle} /></div>
                                        <div>
                                            <label className={labelStyle}>고객사</label>
                                            <div className="relative">
                                                <select name="company" value={editingCustomer.company} onChange={handleEditCustomerChange} className={`${inputStyle} appearance-none pr-8`}>
                                                    <option value="">고객사 선택</option>
                                                    {companyList.map(comp => (<option key={comp.id} value={comp.name}>{comp.name}</option>))}
                                                </select>
                                                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500"><ChevronDownIcon /></div>
                                            </div>
                                        </div>
                                        {/* ⭐ 수정 모달: 부서/파트 분리 ⭐ */}
                                        <div>
                                            <label className={labelStyle}>부서 / 파트</label>
                                            <div className="flex gap-2">
                                                <input name="dept" value={editingCustomer.dept || ''} onChange={handleEditCustomerChange} className={inputStyle} placeholder="부서" />
                                                <input name="part" value={editingCustomer.part || ''} onChange={handleEditCustomerChange} className={inputStyle} placeholder="파트" />
                                            </div>
                                        </div>
                                        <div><label className={labelStyle}>직급</label><input name="rank" value={editingCustomer.rank || ''} onChange={handleEditCustomerChange} className={inputStyle} /></div>
                                        <div><label className={labelStyle}>이메일</label><input name="email" value={editingCustomer.email || ''} onChange={handleEditCustomerChange} className={inputStyle} /></div>
                                        <div><label className={labelStyle}>휴대폰</label><input name="mobile" value={editingCustomer.mobile || ''} onChange={handleEditCustomerChange} className={inputStyle} /></div>
                                    </div>
                                    <div>
                                        <label className={labelStyle}>담당 업무</label>
                                        <div className="flex gap-2 mb-2">
                                            <input list="task-suggestions-edit" value={taskInput} onChange={(e) => setTaskInput(e.target.value)} className={inputStyle} placeholder="업무 추가" />
                                            <datalist id="task-suggestions-edit">
                                                {allUniqueTasks.map((task, i) => <option key={i} value={task} />)}
                                            </datalist>
                                            <button onClick={() => handleAddCustomerTask(true)} className="bg-blue-600 text-white px-4 rounded-lg whitespace-nowrap">추가</button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {editingCustomer.responsibilities?.map((t, i) => (
                                                <Tooltip.Root key={i}>
                                                    <Tooltip.Trigger asChild>
                                                        <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-sm flex items-center gap-1 cursor-help">
                                                            {t} <button onClick={(e) => { e.stopPropagation(); handleRemoveCustomerTask(i, true); }}><XIcon /></button>
                                                        </span>
                                                    </Tooltip.Trigger>
                                                    <Tooltip.Portal>
                                                        <Tooltip.Content className="z-[60] bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-md animate-in fade-in zoom-in-95" sideOffset={5}>
                                                            {t}
                                                            <Tooltip.Arrow className="fill-gray-900" />
                                                        </Tooltip.Content>
                                                    </Tooltip.Portal>
                                                </Tooltip.Root>
                                            ))}
                                        </div>
                                    </div>
                                    <div><label className={labelStyle}>메모</label><textarea name="memo" value={editingCustomer.memo || ''} onChange={handleEditCustomerChange} rows="3" className={`${inputStyle} resize-none`}></textarea></div>
                                </div>
                            )}
                            <div className="p-6 border-t border-gray-200 dark:border-slate-700 flex justify-between gap-3">
                                <button onClick={handleDeleteCustomer} className="px-4 py-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg flex items-center gap-1"><TrashIcon/> 삭제</button>
                                <div className="flex gap-2">
                                    <Dialog.Close asChild><button className="px-4 py-2 text-gray-600 dark:text-gray-300">취소</button></Dialog.Close>
                                    <button onClick={handleUpdateCustomer} className="px-4 py-2 bg-blue-600 text-white rounded-lg">수정 완료</button>
                                </div>
                            </div>
                        </Dialog.Content>
                    </Dialog.Portal>
                </Dialog.Root>

                {/* 3. 고객사 등록 모달 */}
                <Dialog.Root open={isCompanyRegOpen} onOpenChange={setIsCompanyRegOpen}>
                    <Dialog.Portal>
                        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" />
                        <Dialog.Content className={modalContentStyle}>
                            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
                                <Dialog.Title className="text-xl font-bold text-gray-800 dark:text-gray-100">신규 고객사 등록</Dialog.Title>
                                <Dialog.Close asChild><button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><XIcon /></button></Dialog.Close>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2"><label className={labelStyle}>고객사명</label><input name="name" onChange={handleCompanyRegChange} className={inputStyle} /></div>
                                    <div><label className={labelStyle}>사업자번호</label><input name="regNo" onChange={handleCompanyRegChange} className={inputStyle} /></div>
                                    <div><label className={labelStyle}>대표전화</label><input name="phone" onChange={handleCompanyRegChange} className={inputStyle} /></div>
                                    <div><label className={labelStyle}>회계담당자</label><input name="rep" onChange={handleCompanyRegChange} className={inputStyle} /></div>
                                    <div><label className={labelStyle}>이메일</label><input name="email" onChange={handleCompanyRegChange} className={inputStyle} /></div>
                                    <div className="col-span-2"><label className={labelStyle}>주소</label><input name="address" onChange={handleCompanyRegChange} className={inputStyle} /></div>
                                </div>
                                <div><label className={labelStyle}>메모</label><textarea name="memo" rows="3" onChange={handleCompanyRegChange} className={`${inputStyle} resize-none`}></textarea></div>
                            </div>
                            <div className="p-6 border-t border-gray-200 dark:border-slate-700 flex justify-end gap-3">
                                <Dialog.Close asChild><button className="px-4 py-2 text-gray-600 dark:text-gray-300">취소</button></Dialog.Close>
                                <button onClick={handleCompanySubmit} className="px-4 py-2 bg-green-600 text-white rounded-lg">등록 완료</button>
                            </div>
                        </Dialog.Content>
                    </Dialog.Portal>
                </Dialog.Root>

                {/* 4. 고객사 상세/수정 모달 */}
                <Dialog.Root open={!!selectedCompany} onOpenChange={(open) => !open && setSelectedCompany(null)}>
                    <Dialog.Portal>
                        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" />
                        <Dialog.Content className={modalContentStyle}>
                            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
                                <Dialog.Title className="text-xl font-bold text-gray-800 dark:text-gray-100">고객사 정보 상세보기</Dialog.Title>
                                <Dialog.Close asChild><button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><XIcon /></button></Dialog.Close>
                            </div>
                            {editingCompany && (
                                <div className="p-6 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2"><label className={labelStyle}>고객사명</label><input name="name" value={editingCompany.name} onChange={handleEditCompanyChange} className={inputStyle} readOnly={selectedCompany?.mode === 'view'} /></div>
                                        <div><label className={labelStyle}>사업자번호</label><input name="regNo" value={editingCompany.regNo} onChange={handleEditCompanyChange} className={inputStyle} readOnly={selectedCompany?.mode === 'view'} /></div>
                                        <div><label className={labelStyle}>대표전화</label><input name="tel" value={editingCompany.tel} onChange={handleEditCompanyChange} className={inputStyle} readOnly={selectedCompany?.mode === 'view'} /></div>
                                        <div><label className={labelStyle}>회계담당자</label><input name="rep" value={editingCompany.rep} onChange={handleEditCompanyChange} className={inputStyle} readOnly={selectedCompany?.mode === 'view'} /></div>
                                        <div><label className={labelStyle}>이메일</label><input name="email" value={editingCompany.email} onChange={handleEditCompanyChange} className={inputStyle} readOnly={selectedCompany?.mode === 'view'} /></div>
                                        <div className="col-span-2"><label className={labelStyle}>주소</label><input name="address" value={editingCompany.address} onChange={handleEditCompanyChange} className={inputStyle} readOnly={selectedCompany?.mode === 'view'} /></div>
                                    </div>
                                    <div><label className={labelStyle}>메모</label><textarea name="memo" value={editingCompany.memo} onChange={handleEditCompanyChange} rows="3" className={`${inputStyle} resize-none`} readOnly={selectedCompany?.mode === 'view'}></textarea></div>
                                </div>
                            )}

                            {/* ⭐ 푸터 버튼 조건부 렌더링 ⭐ */}
                            <div className="p-6 border-t border-gray-200 dark:border-slate-700 flex justify-end gap-3">
                                {selectedCompany?.mode === 'edit' ? (
                                    // EDIT Mode: 삭제, 취소, 수정 완료 버튼 표시
                                    <div className="flex justify-between gap-3 w-full">
                                        <button onClick={handleDeleteCompany} className="px-4 py-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg flex items-center gap-1"><TrashIcon/> 삭제</button>
                                        <div className="flex gap-2">
                                            <Dialog.Close asChild><button className="px-4 py-2 text-gray-600 dark:text-gray-300">취소</button></Dialog.Close>
                                            <button onClick={handleUpdateCompany} className="px-4 py-2 bg-green-600 text-white rounded-lg">수정 완료</button>
                                        </div>
                                    </div>
                                ) : (
                                    // VIEW Mode: 닫기 버튼만 표시
                                    <Dialog.Close asChild>
                                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">닫기</button>
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