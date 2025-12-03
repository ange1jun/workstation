import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as Dialog from '@radix-ui/react-dialog';
import * as Tooltip from '@radix-ui/react-tooltip';

import TableLoader from '../components/TableLoader';

// 아이콘 컴포넌트 (기존 유지)
const PlusIcon = () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>;
const XIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>;
const TrashIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>;
const DocumentIcon = ({ className }) => <svg className={className || "w-4 h-4"} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;

const API_PARTNER_URL = '/api/partner';

// 페이지네이션 UI 컴포넌트 (기존 유지)
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

export default function Partners() {
    const [searchTerm, setSearchTerm] = useState('');

    // --- 페이지네이션 ---
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // --- 상태 관리 ---
    const [isLoading, setIsLoading] = useState(true);
    const [isRegOpen, setIsRegOpen] = useState(false);
    const [selectedPartner, setSelectedPartner] = useState(null);
    const [editingPartner, setEditingPartner] = useState(null);
    const [partnerList, setPartnerList] = useState([]);

    // 입력 폼 (Partner Entity 구조 반영)
    const [form, setForm] = useState({ name: '', rep: '', tel: '', positiion: '', work_type:'', email: '', memo: '' });

    useEffect(() => { fetchPartners(); }, []);

    // 검색어가 바뀌면 1페이지로 리셋
    useEffect(() => { setCurrentPage(1); }, [searchTerm]);

    const fetchPartners = async () => {
        setIsLoading(true);
        try {
            const [res, _] = await Promise.all([
                axios.get(API_PARTNER_URL),
                new Promise(resolve => setTimeout(resolve, 1000))
            ]);
            setPartnerList(res.data || []);
        } catch (e) {
            console.error(e);
            alert("데이터를 불러오는데 실패했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    // 선택된 파트너를 수정 모드로 설정
    useEffect(() => {
        if (selectedPartner) {
            setEditingPartner({ ...selectedPartner });
        } else {
            setEditingPartner(null);
        }
    }, [selectedPartner]);

    // --- 필터링 및 페이징 계산 ---
    const filteredPartners = partnerList.filter(p =>
        (p.name && p.name.includes(searchTerm)) ||
        (p.rep && p.rep.includes(searchTerm))
    );

    const paginatedPartners = filteredPartners.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // --- 핸들러 ---
    const handleRegChange = (e) => { const { name, value } = e.target; setForm(p => ({ ...p, [name]: value })); };

    const handleSubmit = async () => {
        if (!form.name) { alert('경고: 파트너사 이름을 입력하세요.'); return; }
        try {
            await axios.post(API_PARTNER_URL, form);
            fetchPartners();
            setIsRegOpen(false);
            setForm({ name: '', rep: '', tel: '', positiion: '', work_type:'', email: '', memo: '' });
            alert('완료: 등록되었습니다.');
        } catch { alert('오류: 등록 실패'); }
    };

    const handleEditChange = (e) => { const { name, value } = e.target; setEditingPartner(p => ({ ...p, [name]: value })); };

    const handleUpdate = async () => {
        try {
            await axios.put(`${API_PARTNER_URL}/${editingPartner.id}`, editingPartner);
            fetchPartners();
            setSelectedPartner(null);
            alert('수정 완료: 파트너 정보가 수정되었습니다.');
        } catch (error) {
            console.error("수정 실패:", error);
            alert('오류: 수정 중 문제가 발생했습니다.');
        }
    };

    const handleDelete = async (e, id) => {
        if(e) e.stopPropagation();
        const targetId = id || editingPartner.id;

        if (window.confirm('정말 삭제하시겠습니까?')) {
            try {
                await axios.delete(`${API_PARTNER_URL}/${targetId}`);
                fetchPartners();
                setSelectedPartner(null);
            } catch { alert('오류: 삭제 실패'); }
        }
    };

    // 스타일 상수
    const gradientStyle = { backgroundSize: '200% 200%', animation: 'moveGradient 3s ease infinite' };
    const inputStyle = "w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-colors text-sm";
    const labelStyle = "block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5";
    const modalContentStyle = "fixed left-[50%] top-[10%] w-[90vw] max-w-[500px] translate-x-[-50%] rounded-2xl bg-white dark:bg-slate-800 shadow-2xl focus:outline-none z-50 overflow-hidden border border-gray-200 dark:border-slate-700 transition-all max-h-[85vh] flex flex-col";

    return (
        <Tooltip.Provider delayDuration={300}>
            <style>{`
                @keyframes moveGradient { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } } 
            `}</style>

            <div className="p-6 max-w-7xl mx-auto min-h-screen text-gray-900 dark:text-gray-100 transition-colors duration-300">

                {/* ====== 헤더 ====== */}
                <div className="relative flex items-center justify-center mb-8 h-12">

                    <div className="relative w-full max-w-md group z-0 h-11">
                        <div className="absolute -inset-[2px] rounded-lg bg-gradient-to-r
                        from-orange-500
                        via-indigo-500
                        to-slate-500 opacity-70
                        blur-sm transition duration-1000
                        group-hover:opacity-100
                        group-hover:duration-200" style={gradientStyle}></div>
                        <div className="relative flex items-center bg-white dark:bg-slate-800 rounded-lg p-[1px] h-full">
                            <svg className="absolute left-3 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                            </svg>
                            <input type="text"
                                   className="w-full pl-10 pr-4 h-full bg-transparent border-transparent rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-0 relative z-10"
                                   placeholder="파트너사, 담당자 검색"
                                   value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
                        </div>
                    </div>

                    {/* 등록 버튼 (오른쪽 고정) */}
                    <div className="absolute right-0 flex-shrink-0">
                        <button onClick={() => setIsRegOpen(true)} className="h-11 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors shadow-sm text-sm font-medium whitespace-nowrap">
                            <PlusIcon/> <span>파트너 등록</span>
                        </button>
                    </div>
                </div>

                {/* ====== 메인 테이블 영역 ====== */}
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden flex flex-col">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-sm font-semibold w-1/5">파트너사</th>
                                <th className="px-6 py-4 text-sm font-semibold w-1/5">담당자&nbsp;(직급)</th>
                                <th className="px-6 py-4 text-sm font-semibold w-1/5">연락처</th>
                                <th className="px-6 py-4 text-sm font-semibold w-1/5">이메일</th>
                                <th className="px-6 py-4 text-sm font-semibold text-center w-1/5">관리</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                            {isLoading ? (
                                <TableLoader colSpan={5} />
                            ) : paginatedPartners.length === 0 ? (
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
                                                <p className="text-sm text-gray-400 mt-1">새로운 파트너사를 등록하거나 검색어를 변경해보세요.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedPartners.map(p => (
                                    <tr key={p.id}
                                        className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                                        onClick={() => setSelectedPartner(p)}>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center gap-3">
                                            <div
                                                className="p-1.5 bg-blue-50 dark:bg-slate-700/50 rounded-full text-blue-600 dark:text-blue-400">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor"
                                                     viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                                                </svg>
                                            </div>
                                            {p.name}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                            {p.rep ? `${p.rep}${p.position ? ` (${p.position})` : ''}` : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{p.tel || '-'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{p.email || '-'}</td>
                                        <td className="px-6 py-4 text-center">
                                            <button onClick={(e) => handleDelete(e, p.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                                <TrashIcon/></button>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                    {/* 페이지네이션 */}
                    <Pagination
                        totalItems={filteredPartners.length}
                        itemsPerPage={itemsPerPage}
                        currentPage={currentPage}
                        onPageChange={setCurrentPage}
                    />
                </div>

                {/* --- 모달 영역 --- */}
                {/* 1. 파트너 등록 */}
                <Dialog.Root open={isRegOpen} onOpenChange={setIsRegOpen}>
                    <Dialog.Portal>
                        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"/>
                        <Dialog.Content className={modalContentStyle}>
                            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
                                <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-white">신규 파트너 등록</Dialog.Title>
                                <Dialog.Close asChild>
                                    <button className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"><XIcon/></button>
                                </Dialog.Close>
                            </div>
                            <div className="p-6 space-y-5 overflow-y-auto flex-1">
                                <div className="grid grid-cols-12 gap-4">
                                    <div className="col-span-12"><label className={labelStyle}>파트너사명 <span
                                        className="text-red-500">*</span></label>
                                        <input name="name" value={form.name} onChange={handleRegChange}
                                               className={inputStyle} placeholder="업체명 입력"/>
                                    </div>
                                    <div className="col-span-6"><label className={labelStyle}>담당자</label>
                                        <input name="rep" value={form.rep} onChange={handleRegChange}
                                               className={inputStyle} placeholder="담당자 입력"/>
                                    </div>
                                    <div className="col-span-6"><label className={labelStyle}>연락처</label>
                                        <input name="tel" value={form.tel} onChange={handleRegChange}
                                               className={inputStyle} placeholder="010-0000-0000"/>
                                    </div>
                                    <div className="col-span-6"><label className={labelStyle}>직급</label>
                                        <input name="position" value={form.position} onChange={handleRegChange}
                                               className={inputStyle} placeholder="담당자 직급 입력"/>
                                    </div>
                                    <div className="col-span-6"><label className={labelStyle}>업무유형</label>
                                        <input name="work_type" value={form.work_type} onChange={handleRegChange}
                                               className={inputStyle} placeholder="영업, 기술지원, 회계"/>
                                    </div>
                                    <div className="col-span-12"><label className={labelStyle}>이메일</label>
                                        <input name="email" value={form.email} onChange={handleRegChange}
                                               className={inputStyle} placeholder={"eamil@gmail.com"}/>
                                    </div>
                                </div>
                                <div><label className={labelStyle}>메모</label>
                                    <textarea name="memo" value={form.memo} rows="4" onChange={handleRegChange}
                                              className={`${inputStyle} resize-none`}></textarea>
                                </div>
                            </div>
                            <div
                                className="p-5 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 flex justify-end gap-3 mt-auto">
                                <Dialog.Close asChild>
                                    <button className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium shadow-sm">취소</button>
                                </Dialog.Close>
                                <button onClick={handleSubmit} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm">등록하기</button>
                            </div>
                        </Dialog.Content>
                    </Dialog.Portal>
                </Dialog.Root>

                {/* 2. 파트너 수정 모달 */}
                <Dialog.Root open={!!selectedPartner} onOpenChange={(o) => !o && setSelectedPartner(null)}>
                    <Dialog.Portal>
                        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"/>
                        <Dialog.Content className={modalContentStyle}>
                            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
                                <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-white">파트너 정보 수정</Dialog.Title>
                                <Dialog.Close asChild>
                                    <button className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"><XIcon/></button>
                                </Dialog.Close>
                            </div>
                            {editingPartner && (
                                <div className="p-6 space-y-5 overflow-y-auto flex-1">
                                    <div className="grid grid-cols-12 gap-4">
                                        <div className="col-span-12"><label className={labelStyle}>파트너사명 <span
                                            className="text-red-500">*</span></label>
                                            <input name="name" value={editingPartner.name} onChange={handleEditChange}
                                                   className={inputStyle}/>
                                        </div>
                                        <div className="col-span-6"><label className={labelStyle}>담당자</label>
                                            <input name="rep" value={editingPartner.rep || ''}
                                                   onChange={handleEditChange} className={inputStyle}/>
                                        </div>
                                        <div className="col-span-6"><label className={labelStyle}>연락처</label>
                                            <input name="tel" value={editingPartner.tel || ''}
                                                   onChange={handleEditChange} className={inputStyle}/>
                                        </div>
                                        <div className="col-span-6"><label className={labelStyle}>직급</label>
                                            <input name="position" value={editingPartner.position || ''}
                                                   onChange={handleEditChange} className={inputStyle}/>
                                        </div>
                                        <div className="col-span-6"><label className={labelStyle}>업무유형</label>
                                            <input name="work_type" value={editingPartner.work_type || ''}
                                                   onChange={handleEditChange} className={inputStyle}/>
                                        </div>
                                        <div className="col-span-12"><label className={labelStyle}>이메일</label>
                                            <input name="email" value={editingPartner.email || ''}
                                                   onChange={handleEditChange} className={inputStyle}/>
                                        </div>
                                    </div>
                                    <div><label className={labelStyle}>메모</label>
                                        <textarea name="memo" value={editingPartner.memo || ''}
                                                  onChange={handleEditChange} rows="4"
                                                  className={`${inputStyle} resize-none`}></textarea>
                                    </div>
                                </div>
                            )}
                            <div className="p-5 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 flex justify-between mt-auto">
                                <button onClick={() => handleDelete(null, null)} className="px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium shadow-sm">삭제</button>
                                <div className="flex gap-3">
                                    <Dialog.Close asChild>
                                        <button className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium shadow-sm">취소</button>
                                    </Dialog.Close>
                                    <button onClick={handleUpdate} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm">저장하기</button>
                                </div>
                            </div>
                        </Dialog.Content>
                    </Dialog.Portal>
                </Dialog.Root>

            </div>
        </Tooltip.Provider>
    );
}