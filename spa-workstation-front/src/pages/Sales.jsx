import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as Dialog from '@radix-ui/react-dialog';
import * as Tooltip from '@radix-ui/react-tooltip';

// [추가] TableLoader 컴포넌트 import
import TableLoader from '../components/TableLoader';

// --- 아이콘 컴포넌트 ---
const PlusIcon = () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>;
const XIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>;
const TrashIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>;
const SendIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>;
const PencilIcon = () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>;
const CheckIcon = () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>;

const DocumentIcon = ({ className }) => <svg className={className || "w-4 h-4"} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;

const API_SALES_URL = 'http://api/sales';

// --- 상수 데이터 ---
const priorityMap = {
    LOW: { label: '낮음', class: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300' },
    MEDIUM: { label: '보통', class: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300' },
    HIGH: { label: '높음', class: 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300' }
};

const statusMap = {
    SCHEDULED: { label: '예정', colorClass: 'text-yellow-600 bg-yellow-50 dark:text-yellow-300 dark:bg-yellow-900/30' },
    IN_PROGRESS: { label: '진행중', colorClass: 'text-emerald-600 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-900/30' },
    COMPLETED: { label: '완료', colorClass: 'text-indigo-600 bg-indigo-50 dark:text-indigo-300 dark:bg-indigo-900/30' }
};

// [Component] 애니메이션 상태 배지
const AnimatedStatusBadge = ({ status }) => {
    const config = statusMap[status] || statusMap.SCHEDULED;
    return (
        <div className={`relative overflow-hidden px-2.5 py-1 rounded-full text-xs font-semibold w-16 text-center transition-colors duration-300 ${config.colorClass}`}>
            <div key={status} className="animate-status-slide-in">
                {config.label}
            </div>
        </div>
    );
};

// [Component] 커스텀 슬라이더
const CustomSlider = ({ value, onChange, onCommit, name, readOnly = false }) => {
    const [displayValue, setDisplayValue] = useState(value);

    useEffect(() => {
        setDisplayValue(value);
    }, [value]);

    const handleChange = (e) => {
        const newVal = parseInt(e.target.value);
        setDisplayValue(newVal);
        if (onChange) onChange(e);
    };

    const handleCommit = (e) => {
        if (onCommit) onCommit(parseInt(e.target.value));
    };

    return (
        <div
            className={`relative w-full h-5 flex items-center select-none ${readOnly ? '' : 'cursor-pointer group'}`}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
        >
            <div className="absolute w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"></div>
            <div
                className={`absolute h-1.5 rounded-full transition-all duration-150 ease-out 
                    ${readOnly ? 'bg-gray-400' : 'bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 group-hover:from-blue-400 group-hover:to-violet-400'}`}
                style={{ width: `${displayValue}%` }}
            ></div>
            <div
                className={`absolute h-4 w-4 bg-white border border-gray-200 dark:border-gray-600 rounded-full shadow-md transition-all duration-150 ease-out flex items-center justify-center z-10
                    ${readOnly ? 'hidden' : 'group-hover:scale-110'}`}
                style={{
                    left: `${displayValue}%`,
                    transform: `translateX(-50%)`
                }}
            >
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
            </div>
            {!readOnly && (
                <input
                    type="range"
                    min="0"
                    max="100"
                    name={name}
                    value={displayValue}
                    onChange={handleChange}
                    onMouseUp={handleCommit}
                    onTouchEnd={handleCommit}
                    onClick={(e) => e.stopPropagation()}
                    className="absolute w-full h-full opacity-0 cursor-pointer z-20"
                />
            )}
        </div>
    );
};

// 페이지네이션 UI
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

// [수정] 오늘 날짜를 YYYY-MM-DD 형식으로 반환하는 함수 (로컬 타임 기준)
const getTodayDate = () => {
    const date = new Date();
    const offset = date.getTimezoneOffset() * 60000;
    const localISOTime = new Date(date.getTime() - offset).toISOString().split('T')[0];
    return localISOTime;
};

export default function Sales() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterPriority, setFilterPriority] = useState('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [isLoading, setIsLoading] = useState(true);
    const [isRegOpen, setIsRegOpen] = useState(false);
    const [selectedSale, setSelectedSale] = useState(null);
    const [editingSale, setEditingSale] = useState(null);
    const [salesList, setSalesList] = useState([]);

    // 히스토리 관리용 state
    const [historyList, setHistoryList] = useState([]);
    const [historyInput, setHistoryInput] = useState('');
    const [editingHistoryId, setEditingHistoryId] = useState(null);
    const [tempHistoryContent, setTempHistoryContent] = useState('');

    // [수정] 초기 폼 상태에 오늘 날짜 적용
    const initialFormState = {
        title: '',
        priority: 'MEDIUM',
        status: 'SCHEDULED',
        start_date: getTodayDate(), // 오늘 날짜
        end_date: getTodayDate(),   // 오늘 날짜
        progress: 0,
        content: ''
    };
    const [form, setForm] = useState(initialFormState);

    // 필터 옵션
    const filterOptions = [
        { id: 'ALL', label: '전체' },
        { id: 'LOW', label: '낮음' },
        { id: 'MEDIUM', label: '보통' },
        { id: 'HIGH', label: '높음' },
    ];

    const getFilterButtonClass = (type, isActive) => {
        const baseClass = "px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 border relative overflow-hidden";
        if (!isActive) return `${baseClass} bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-gray-300 z-10`;
        let typeClass = type === 'HIGH' ? "high" : type === 'MEDIUM' ? "medium" : type === 'LOW' ? "low" : "all";
        return `importance-btn ${typeClass}`;
    };

    useEffect(() => { fetchSales(); }, []);
    useEffect(() => { setCurrentPage(1); }, [searchTerm, filterPriority]);

    const fetchSales = async () => {
        setIsLoading(true);
        try {
            const [res, _] = await Promise.all([
                axios.get(API_SALES_URL),
                new Promise(resolve => setTimeout(resolve, 1000))
            ]);
            setSalesList(res.data || []);
        } catch (e) { console.error("데이터 로드 실패:", e); }
        finally { setIsLoading(false); }
    };

    const fetchSalesOnly = async () => {
        try {
            const res = await axios.get(API_SALES_URL);
            setSalesList(res.data || []);
        } catch (e) { console.error("데이터 로드 실패:", e); }
    };

    useEffect(() => {
        if (selectedSale) {
            const formatData = { ...selectedSale };
            if(formatData.start_date) formatData.start_date = formatData.start_date.split('T')[0];
            if(formatData.end_date) formatData.end_date = formatData.end_date.split('T')[0];
            setEditingSale(formatData);

            if (selectedSale.histories && Array.isArray(selectedSale.histories)) {
                const sortedHistory = [...selectedSale.histories].sort((a, b) => {
                    if (a.recordedDate > b.recordedDate) return -1;
                    if (a.recordedDate < b.recordedDate) return 1;
                    return b.id - a.id;
                });
                setHistoryList(sortedHistory);
            } else {
                setHistoryList([]);
            }
            setHistoryInput('');
            setEditingHistoryId(null);
        } else {
            setEditingSale(null);
            setHistoryList([]);
        }
    }, [selectedSale]);

    const filteredSales = salesList.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPriority = filterPriority === 'ALL' || item.priority === filterPriority;
        return matchesSearch && matchesPriority;
    });

    const paginatedSales = filteredSales.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // --- 공통: 진행률에 따른 상태 계산 함수 ---
    const calculateStatusFromProgress = (progress) => {
        if (progress === 0) return 'SCHEDULED';
        if (progress === 100) return 'COMPLETED';
        return 'IN_PROGRESS';
    };

    const handleRegChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => {
            const updates = { ...prev };
            if (name === 'progress') {
                const progressVal = parseInt(value);
                updates.progress = progressVal;
                updates.status = calculateStatusFromProgress(progressVal);
            } else if (name === 'status') {
                updates.status = value;
                if (value === 'SCHEDULED') updates.progress = 0;
                else if (value === 'COMPLETED') updates.progress = 100;
                else if (value === 'IN_PROGRESS' && (prev.progress === 0 || prev.progress === 100)) {
                    updates.progress = 50;
                }
            } else {
                updates[name] = value;
            }
            return updates;
        });
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditingSale(prev => {
            const updates = { ...prev };
            if (name === 'progress') {
                const progressVal = parseInt(value);
                updates.progress = progressVal;
                updates.status = calculateStatusFromProgress(progressVal);
            } else if (name === 'status') {
                updates.status = value;
                if (value === 'SCHEDULED') updates.progress = 0;
                else if (value === 'COMPLETED') updates.progress = 100;
                else if (value === 'IN_PROGRESS' && (prev.progress === 0 || prev.progress === 100)) {
                    updates.progress = 50;
                }
            } else {
                updates[name] = value;
            }
            return updates;
        });
    };

    // --- 히스토리 CRUD ---
    const handleAddHistory = async () => {
        if (!historyInput.trim() || !selectedSale) return;
        try {
            await axios.post(`${API_SALES_URL}/${selectedSale.id}/history`, { content: historyInput });
            const today = new Date().toISOString().split('T')[0];
            const newItem = { id: Date.now(), recordedDate: today, content: historyInput };
            setHistoryList([newItem, ...historyList]);
            setHistoryInput('');
            fetchSalesOnly();
        } catch (error) { window.alert("이력 저장 실패"); }
    };

    const handleDeleteHistory = async (historyId) => {
        if (!window.confirm("이 항목을 삭제하시겠습니까?")) return;
        try {
            await axios.delete(`${API_SALES_URL}/history/${historyId}`);
            setHistoryList(prev => prev.filter(h => h.id !== historyId));
            fetchSalesOnly();
        } catch (error) { window.alert("삭제 실패"); }
    };

    const startEditHistory = (history) => {
        setEditingHistoryId(history.id);
        setTempHistoryContent(history.content);
    };

    const saveEditHistory = async (historyId) => {
        try {
            await axios.put(`${API_SALES_URL}/history/${historyId}`, { content: tempHistoryContent });
            setHistoryList(prev => prev.map(h => h.id === historyId ? { ...h, content: tempHistoryContent } : h));
            setEditingHistoryId(null);
            fetchSalesOnly();
        } catch (error) { window.alert("수정 실패"); }
    };

    const handleHistoryKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddHistory(); }
    };

    // 리스트 슬라이더: 실시간 상태 반영
    const handleTableSliderChange = (id, newValue) => {
        const intValue = parseInt(newValue);
        const newStatus = calculateStatusFromProgress(intValue); // 상태 계산

        setSalesList(prev => prev.map(item =>
            item.id === id ? { ...item, progress: intValue, status: newStatus } : item
        ));
    };

    const handleTableSliderCommit = async (id, newValue) => {
        const targetItem = salesList.find(item => item.id === id);
        if (!targetItem) return;
        const newStatus = calculateStatusFromProgress(newValue);
        const updatedItem = { ...targetItem, progress: newValue, status: newStatus };
        try {
            await axios.put(`${API_SALES_URL}/${id}`, updatedItem);
            fetchSalesOnly();
        } catch (error) { fetchSalesOnly(); }
    };

    const handleSubmit = async () => {
        if (!form.title) { window.alert('제목을 입력하세요.'); return; }
        if (!form.start_date || !form.end_date) { window.alert('기간을 입력하세요.'); return; }
        try {
            await axios.post(API_SALES_URL, form);
            fetchSalesOnly();
            setIsRegOpen(false);
            setForm(initialFormState); // 초기화 시 오늘 날짜로 다시 세팅
            window.alert('등록되었습니다.');
        } catch (error) { window.alert('등록 실패'); }
    };

    const handleUpdate = async () => {
        if (!editingSale.title) { window.alert('제목을 입력하세요.'); return; }
        try {
            await axios.put(`${API_SALES_URL}/${editingSale.id}`, editingSale);
            fetchSalesOnly();
            setSelectedSale(null);
            window.alert('수정되었습니다.');
        } catch (error) { window.alert('수정 실패'); }
    };

    const handleDelete = async (e, id) => {
        if(e) e.stopPropagation();
        const targetId = id || editingSale.id;
        if (window.confirm('정말 삭제하시겠습니까?')) {
            try {
                await axios.delete(`${API_SALES_URL}/${targetId}`);
                fetchSalesOnly();
                setSelectedSale(null);
                window.alert('삭제되었습니다.');
            } catch (error) { window.alert('삭제 실패'); }
        }
    };

    const gradientStyle = { backgroundSize: '200% 200%', animation: 'moveGradient 3s ease infinite' };
    const inputStyle = "w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 transition-colors text-sm";
    const labelStyle = "block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5";
    const modalContentStyle = "fixed left-[50%] top-[10%] w-[90vw] max-w-[600px] translate-x-[-50%] rounded-2xl bg-white dark:bg-slate-800 shadow-2xl focus:outline-none z-50 overflow-hidden border border-gray-200 dark:border-slate-700 transition-all max-h-[85vh] flex flex-col";

    return (
        <Tooltip.Provider delayDuration={300}>
            <style>{`
                @keyframes moveGradient { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
                @keyframes rotate-border { 100% { transform: rotate(360deg); } }
                /* [New Animation] Status Slide */
                @keyframes statusSlideIn {
                    0% { transform: translateY(-120%); opacity: 0; }
                    100% { transform: translateY(0); opacity: 1; }
                }
                .animate-status-slide-in {
                    animation: statusSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                }

                .importance-btn { position: relative; z-index: 0; border: none !important; box-shadow: none !important; background: transparent; padding: 8px 16px; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; cursor: pointer; overflow: hidden; transition: transform 0.2s ease, color 0.3s ease; }
                .importance-btn:hover { transform: scale(1.05); }
                .importance-btn::before { content: ''; position: absolute; z-index: -2; left: -50%; top: -50%; width: 200%; height: 200%; background: conic-gradient(from 0deg, transparent 0%, var(--orbit-color) 50%, transparent 100%); animation: rotate-border 2.5s linear infinite; }
                .importance-btn::after { content: ''; position: absolute; z-index: -1; left: 2px; top: 2px; right: 2px; bottom: 2px; background: #ffffff; border-radius: 9999px; }
                .dark .importance-btn::after { background: #1e293b; }
                .importance-btn.high { --orbit-color: #ff3e3e; color: #d32f2f; } .dark .importance-btn.high { color: #fca5a5; }
                .importance-btn.medium { --orbit-color: #3b82f6; color: #1d4ed8; } .dark .importance-btn.medium { color: #93c5fd; }
                .importance-btn.low { --orbit-color: #10b981; color: #047857; } .dark .importance-btn.low { color: #6ee7b7; }
                .importance-btn.all { --orbit-color: #64748b; color: #334155; } .dark .importance-btn.all { color: #cbd5e1; }
                
                .timeline-scroll::-webkit-scrollbar { width: 4px; }
                .timeline-scroll::-webkit-scrollbar-track { background: transparent; }
                .timeline-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 2px; }
                .dark .timeline-scroll::-webkit-scrollbar-thumb { background: #475569; }
            `}</style>

            <div className="p-6 max-w-7xl mx-auto min-h-screen text-gray-900 dark:text-gray-100 transition-colors duration-300">

                {/* ====== 헤더 영역 ====== */}
                <div className="relative flex items-center justify-center mb-8 h-12">
                    <div className="absolute left-0 top-0 h-full flex items-center gap-2">
                        {filterOptions.map((opt) => (
                            <button key={opt.id} onClick={() => setFilterPriority(opt.id)} className={getFilterButtonClass(opt.id, filterPriority === opt.id)}>{opt.label}</button>
                        ))}
                    </div>
                    <div className="relative w-full max-w-md group z-0 h-11">
                        <div className="absolute -inset-[2px] rounded-lg bg-gradient-to-r
                        from-violet-500
                        via-stone-500
                        to-pink-500 opacity-70 blur-sm transition duration-1000 group-hover:opacity-100 group-hover:duration-200" style={gradientStyle}></div>
                        <div className="relative flex items-center bg-white dark:bg-slate-800 rounded-lg p-[1px] h-full">
                            <svg className="absolute left-3 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                            <input type="text" className="w-full pl-10 pr-4 h-full bg-transparent border-transparent rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-0 relative z-10" placeholder="영업명 검색" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
                        </div>
                    </div>
                    <div className="absolute right-0 flex-shrink-0">
                        <button onClick={() => setIsRegOpen(true)} className="h-11 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors shadow-sm text-sm font-medium whitespace-nowrap"><PlusIcon/> <span>영업 건 등록</span></button>
                    </div>
                </div>

                {/* ====== 메인 테이블 ====== */}
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 overflow-x-auto flex flex-col">
                    <table className="w-full text-left border-collapse table-fixed min-w-[1000px]">
                        <thead className="bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-200">
                        <tr>
                            <th className="px-6 py-4 text-sm font-semibold w-[10%] text-center whitespace-nowrap">중요도</th>
                            <th className="px-6 py-4 text-sm font-semibold w-[20%] whitespace-nowrap">제목</th>
                            <th className="px-6 py-4 text-sm font-semibold w-[20%] whitespace-nowrap">세부사항 (최신 이력)</th>
                            <th className="px-6 py-4 text-sm font-semibold w-[15%] whitespace-nowrap">기간</th>
                            <th className="px-6 py-4 text-sm font-semibold w-[10%] text-center whitespace-nowrap">상태</th>
                            <th className="px-6 py-4 text-sm font-semibold w-[15%] whitespace-nowrap">진행률</th>
                            <th className="px-6 py-4 text-sm font-semibold w-[10%] text-center whitespace-nowrap">관리</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                        {isLoading ? (
                            <TableLoader colSpan={7} />
                        ) : paginatedSales.length === 0 ? (
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
                                            <p className="text-sm text-gray-400 mt-1">새로운 영업을 등록하거나 검색어를 변경해보세요.</p>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            paginatedSales.map(item => {
                                let latestHistory = "-";
                                if (item.histories && item.histories.length > 0) {
                                    const sorted = [...item.histories].sort((a, b) => b.id - a.id || new Date(b.recordedDate) - new Date(a.recordedDate));
                                    latestHistory = sorted[0].content;
                                }

                                return (
                                    <tr key={item.id}
                                        className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                                        onClick={() => setSelectedSale(item)}>
                                        <td className="px-6 py-4 text-center whitespace-nowrap">
                                            <span
                                                className={`px-2 py-1 text-xs font-semibold rounded-full ${priorityMap[item.priority]?.class || ''}`}>{priorityMap[item.priority]?.label}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="truncate min-w-0 block font-medium text-gray-900 dark:text-gray-100" title={item.title}>{item.title}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="truncate min-w-0 block text-sm text-gray-500 dark:text-gray-400" title={latestHistory}>{latestHistory}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">{item.start_date} ~ {item.end_date}</td>
                                        <td className="px-6 py-4 text-center whitespace-nowrap flex justify-center">
                                            <AnimatedStatusBadge status={item.status} />
                                        </td>
                                        <td className="px-6 py-4 align-middle" onMouseDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center gap-3 w-full max-w-[160px]">
                                                <CustomSlider value={item.progress} onChange={(e) => handleTableSliderChange(item.id, e.target.value)} onCommit={(val) => handleTableSliderCommit(item.id, val)}/>
                                                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 w-9 text-right font-mono">{item.progress}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center whitespace-nowrap">
                                            <button onClick={(e) => handleDelete(e, item.id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"><TrashIcon/></button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                        </tbody>
                    </table>
                </div>
                <Pagination totalItems={filteredSales.length} itemsPerPage={itemsPerPage} currentPage={currentPage} onPageChange={setCurrentPage} />
            </div>

            {/* 등록 모달 */}
            <Dialog.Root open={isRegOpen} onOpenChange={setIsRegOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"/>
                    <Dialog.Content className={modalContentStyle}>
                        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
                            <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-white">영업 건 등록</Dialog.Title>
                            <Dialog.Close asChild><button className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"><XIcon/></button></Dialog.Close>
                        </div>
                        <div className="p-6 space-y-4 overflow-y-auto flex-1">
                            <div><label className={labelStyle}>제목 <span className="text-red-500">*</span></label>
                                <input name="title" value={form.title} onChange={handleRegChange} className={inputStyle} placeholder="영업 건 제목" /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className={labelStyle}>중요도</label>
                                    <select name="priority" value={form.priority} onChange={handleRegChange} className={inputStyle}>
                                        <option value="LOW">낮음</option><option value="MEDIUM">보통</option><option value="HIGH">높음</option>
                                    </select></div>
                                <div><label className={labelStyle}>진행 상태</label>
                                    <select name="status" value={form.status} onChange={handleRegChange} className={inputStyle}>
                                        <option value="SCHEDULED">예정</option><option value="IN_PROGRESS">진행중</option><option value="COMPLETED">완료</option>
                                    </select></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className={labelStyle}>시작일</label>
                                    <input type="date" name="start_date" value={form.start_date} onChange={handleRegChange} className={inputStyle} /></div>
                                <div><label className={labelStyle}>종료일</label>
                                    <input type="date" name="end_date" value={form.end_date} onChange={handleRegChange} className={inputStyle} /></div>
                            </div>
                            <div>
                                <label className={`${labelStyle} flex justify-between`}><span>진행률</span><span className="text-indigo-600 dark:text-indigo-400 font-mono font-bold">{form.progress}%</span></label>
                                <div className="mt-2 px-1">
                                    <CustomSlider name="progress" value={form.progress} onChange={handleRegChange} />
                                </div>
                            </div>
                            <div><label className={labelStyle}>세부사항</label>
                                <textarea name="content" value={form.content} rows="3" onChange={handleRegChange} className={`${inputStyle} resize-none`}></textarea></div>
                        </div>
                        <div className="p-5 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 flex justify-end gap-3 mt-auto">
                            <Dialog.Close asChild><button className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">취소</button></Dialog.Close>
                            <button onClick={handleSubmit} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">등록하기</button>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>

            {/* 수정 모달 */}
            <Dialog.Root open={!!selectedSale} onOpenChange={(o) => !o && setSelectedSale(null)}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"/>
                    <Dialog.Content className={modalContentStyle}>
                        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 shrink-0">
                            <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-white">상세 정보</Dialog.Title>
                            <Dialog.Close asChild><button className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"><XIcon/></button></Dialog.Close>
                        </div>

                        {editingSale && (
                            <div className="flex flex-col flex-1 overflow-hidden">
                                <div className="flex-1 overflow-y-auto p-6 space-y-6 timeline-scroll">

                                    {/* 1. 기본 정보 섹션 */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                            <span className="w-1 h-4 bg-blue-500 rounded-full"></span> 기본 정보
                                        </h3>
                                        <div><label className={labelStyle}>제목 <span className="text-red-500">*</span></label>
                                            <input name="title" value={editingSale.title} onChange={handleEditChange} className={inputStyle} /></div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div><label className={labelStyle}>중요도</label>
                                                <select name="priority" value={editingSale.priority} onChange={handleEditChange} className={inputStyle}>
                                                    <option value="LOW">낮음</option><option value="MEDIUM">보통</option><option value="HIGH">높음</option>
                                                </select></div>
                                            <div><label className={labelStyle}>진행 상태</label>
                                                <select name="status" value={editingSale.status} onChange={handleEditChange} className={inputStyle}>
                                                    <option value="SCHEDULED">예정</option><option value="IN_PROGRESS">진행중</option><option value="COMPLETED">완료</option>
                                                </select></div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div><label className={labelStyle}>시작일</label>
                                                <input type="date" name="start_date" value={editingSale.start_date || ''} onChange={handleEditChange} className={inputStyle} /></div>
                                            <div><label className={labelStyle}>종료일</label>
                                                <input type="date" name="end_date" value={editingSale.end_date || ''} onChange={handleEditChange} className={inputStyle} /></div>
                                        </div>
                                        <div>
                                            <label className={`${labelStyle} flex justify-between`}><span>진행률</span><span className="text-indigo-600 dark:text-indigo-400 font-mono font-bold">{editingSale.progress}%</span></label>
                                            <div className="mt-2 px-1">
                                                <CustomSlider name="progress" value={editingSale.progress} onChange={handleEditChange} />
                                            </div>
                                        </div>
                                        <div><label className={labelStyle}>세부사항</label>
                                            <textarea name="content" value={editingSale.content || ''} rows="3" onChange={handleEditChange} className={`${inputStyle} resize-none`}></textarea></div>
                                    </div>

                                    <hr className="border-gray-200 dark:border-slate-700" />

                                    {/* 2. 히스토리 관리 섹션 */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                            <span className="w-1 h-4 bg-purple-500 rounded-full"></span> 영업 세부사항
                                        </h3>

                                        <div className="flex gap-2 items-center bg-gray-50 dark:bg-slate-700/50 p-2 rounded-lg border border-gray-200 dark:border-slate-600">
                                            <input
                                                type="text"
                                                value={historyInput}
                                                onChange={(e) => setHistoryInput(e.target.value)}
                                                onKeyDown={handleHistoryKeyDown}
                                                className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400"
                                                placeholder="작업 내용이나 메모를 입력하세요..."
                                            />
                                            <button onClick={handleAddHistory} className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">
                                                <SendIcon />
                                            </button>
                                        </div>

                                        <div className="relative pl-4 space-y-4 pt-2">
                                            <div className="absolute top-2 bottom-2 left-[19px] w-[2px] bg-gray-200 dark:bg-slate-700 rounded-full"></div>
                                            {historyList.length === 0 ? (
                                                <p className="text-xs text-gray-400 pl-8">등록된 이력이 없습니다.</p>
                                            ) : (
                                                historyList.map((item) => (
                                                    <div key={item.id} className="relative flex gap-4 group animate-[fadeIn_0.3s_ease-out]">
                                                        <div className="relative z-10 mt-1.5 w-3 h-3 rounded-full bg-white dark:bg-slate-800 border-2 border-indigo-500 shadow-[0_0_0_2px_rgba(255,255,255,1)] dark:shadow-[0_0_0_2px_rgba(30,41,59,1)] flex-shrink-0"></div>
                                                        <div className="flex-1 bg-gray-50/50 dark:bg-slate-700/30 p-2.5 rounded-lg border border-gray-100 dark:border-slate-700/50 hover:border-blue-200 dark:hover:border-slate-500 transition-colors">
                                                            <div className="flex justify-between items-start mb-1">
                                                                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">{item.recordedDate}</span>
                                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    {editingHistoryId === item.id ? (
                                                                        <button onClick={() => saveEditHistory(item.id)} className="text-green-600 hover:bg-green-100 p-1 rounded"><CheckIcon/></button>
                                                                    ) : (
                                                                        <button onClick={() => startEditHistory(item)} className="text-blue-600 hover:bg-blue-100 p-1 rounded"><PencilIcon/></button>
                                                                    )}
                                                                    <button onClick={() => handleDeleteHistory(item.id)} className="text-red-600 hover:bg-red-100 p-1 rounded"><TrashIcon/></button>
                                                                </div>
                                                            </div>
                                                            {editingHistoryId === item.id ? (
                                                                <input
                                                                    className="w-full bg-white dark:bg-slate-800 border border-blue-300 rounded px-2 py-1 text-sm outline-none"
                                                                    value={tempHistoryContent}
                                                                    onChange={(e) => setTempHistoryContent(e.target.value)}
                                                                    onKeyDown={(e) => e.key === 'Enter' && saveEditHistory(item.id)}
                                                                    autoFocus
                                                                />
                                                            ) : (
                                                                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{item.content}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="p-5 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 flex justify-between shrink-0">
                            <button onClick ={() => handleDelete(null, null)} className="px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium">삭제</button>
                            <div className="flex gap-3">
                                <Dialog.Close asChild><button className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">취소</button></Dialog.Close>
                                <button onClick={handleUpdate} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">저장하기</button>
                            </div>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </Tooltip.Provider>
    );
}