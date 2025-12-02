import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import * as Dialog from '@radix-ui/react-dialog';
import * as Tooltip from '@radix-ui/react-tooltip';

// [수정] 이미 구현된 공통 컴포넌트 import
import TableLoader from '../components/TableLoader';

// --- 백엔드 주소 ---
const API_PRODUCT_URL = 'http://api/product';
const API_CONTRACT_URL = 'http://api/contract';

// --- 아이콘 컴포넌트 ---
const Icons = {
    Plus: () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>,
    X: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>,
    Search: ({ className }) => <svg className={`w-5 h-5 ${className || ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>,
    Settings: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.941 3.31.81 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.81 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756 0 3.35a1.724 1.724 0 00-2.573-1.066c-1.543.941-3.31-.81-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.81-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065zM12 15a3 3 0 110-6 3 3 0 010 6z"></path></svg>,
    ChevronDown: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>,
    Server: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>,
    Check: () => <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>,
    Link: () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
};

const PartnershipToggle = ({ checked, onChange }) => (
    <div className="flex flex-col gap-1">
        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 ml-1">파트너 계약 여부</label>
        <div
            onClick={() => onChange(!checked)}
            className={`
                relative w-full h-[38px] rounded-lg cursor-pointer transition-all duration-300 border flex items-center px-1 group select-none
                ${checked
                ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/30 dark:border-indigo-700'
                : 'bg-gray-50 border-gray-200 dark:bg-slate-800 dark:border-slate-600'}
            `}
        >
            <span className={`absolute right-4 text-xs font-medium transition-all duration-300 ${!checked ? 'text-gray-500 opacity-100' : 'text-gray-300 opacity-0 translate-x-2'}`}>
                일반 계약
            </span>
            <span className={`absolute left-4 text-xs font-medium transition-all duration-300 ${checked ? 'text-indigo-600 opacity-100' : 'text-indigo-300 opacity-0 -translate-x-2'}`}>
                파트너십 계약
            </span>
            <div className={`
                absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-md shadow-sm flex items-center justify-center gap-1 transition-all duration-300 transform z-10
                ${checked
                ? 'translate-x-[calc(100%+4px)] bg-indigo-500 text-white shadow-indigo-200 dark:shadow-none'
                : 'translate-x-0 bg-white dark:bg-slate-700 text-gray-500 border border-gray-200 dark:border-slate-500'}
            `}>
                {checked && <Icons.Check />}
                <span className="text-xs font-bold tracking-tight">{checked ? '파트너십' : '일반'}</span>
            </div>
        </div>
    </div>
);

const PartnershipBadge = ({ isPartner }) => {
    if (!isPartner) {
        return (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200 dark:bg-slate-700 dark:text-gray-400 dark:border-slate-600 whitespace-nowrap">
                일반
            </span>
        );
    }
    return (
        <div className="relative inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 whitespace-nowrap">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                Partnership
            </span>
        </div>
    );
};

// --- 헬퍼 함수 ---
const formatForInput = (dateValue) => {
    if (!dateValue) return '';
    try {
        const d = new Date(dateValue);
        if (isNaN(d.getTime())) return '';
        return d.toISOString().split('T')[0];
    } catch (e) {
        return '';
    }
};

const formatDisplayDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toISOString().split('T')[0];
    } catch (e) {
        return dateStr;
    }
};

const RequiredStar = () => <span className="text-rose-500 ml-1">*</span>;

// --- 페이지네이션 ---
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
        <div
            className="flex items-center justify-center gap-2 py-4 border-t border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800">
            <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
                </svg>
            </button>
            {getPageNumbers().map(num => (
                <button key={num} onClick={() => onPageChange(num)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${currentPage === num ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'}`}>{num}</button>
            ))}
            <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                </svg>
            </button>
        </div>
    );
};

export default function Products() {
    const [searchTerm, setSearchTerm] = useState('');
    const [isRegOpen, setIsRegOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedProductForm, setSelectedProductForm] = useState(null);
    const [isDetailExpanded, setIsDetailExpanded] = useState(false);

    const [productList, setProductList] = useState([]);
    const [contractList, setContractList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => { fetchProducts(); }, []);

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const [productRes, contractRes] = await Promise.all([
                axios.get(API_PRODUCT_URL),
                axios.get(API_CONTRACT_URL),
                new Promise(resolve => setTimeout(resolve, 1000))
            ]);
            setProductList(productRes.data || []);
            setContractList(contractRes.data || []);
        } catch (error) {
            console.error("데이터 로드 실패:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const initialProductForm = useMemo(() => ({
        category: 'H/W',
        type: '',
        product_name: '',
        product_serial: '',
        contract_name: '',
        contract_master: '',
        introduction: new Date().toISOString().slice(0, 10),
        partnership: false,
        memo: '',
        productDetail: {
            host_name: '', ip: '', detail_id: '', detail_pw: '',
            detail_os: '', os_version: '', detail_cpu: '', detail_memory: '', detail_disk: '',
            process_date: new Date().toISOString().slice(0, 10)
        }
    }), []);

    const [productForm, setProductForm] = useState(initialProductForm);

    const handleEditClick = (product) => {
        const baseData = JSON.parse(JSON.stringify(initialProductForm));
        const productData = JSON.parse(JSON.stringify(product));
        const baseDetail = baseData.productDetail || {};
        const productDetail = productData.productDetail || {};
        const mergedDetail = { ...baseDetail, ...productDetail };

        const mappedData = {
            ...baseData,
            ...productData,
            id: product.id,
            product_name: productData.product_name || productData.productName || '',
            contract_name: productData.contract_name || productData.contractName || '',
            product_serial: productData.product_serial || productData.productSerial || '',
            contract_master: productData.contract_master || productData.contractMaster || '',
            type: productData.type || '',
            memo: productData.memo || '',
            partnership: productData.partnership || false,
            productDetail: mergedDetail
        };

        if (mappedData.introduction) mappedData.introduction = formatForInput(mappedData.introduction);
        if (mappedData.productDetail && mappedData.productDetail.process_date) mappedData.productDetail.process_date = formatForInput(mappedData.productDetail.process_date);

        setSelectedProduct(product);
        setSelectedProductForm(mappedData);
        setIsDetailExpanded(false);
    };

    const filteredProducts = productList.filter(p =>
        ((p.product_name || p.productName) && (p.product_name || p.productName).includes(searchTerm)) ||
        ((p.contract_name || p.contractName) && (p.contract_name || p.contractName).includes(searchTerm)) ||
        ((p.product_serial || p.productSerial) && (p.product_serial || p.productSerial).includes(searchTerm))
    );
    const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleFormChange = (e, isUpdate = false) => {
        const { name, value } = e.target;
        const setter = isUpdate ? setSelectedProductForm : setProductForm;
        setter(prev => ({ ...prev, [name]: value }));
    };

    const handleContractSelect = (e, isUpdate = false) => {
        const selectedContractId = e.target.value;
        if (!selectedContractId) return;

        const contract = contractList.find(c => String(c.id) === String(selectedContractId));
        if (contract) {
            const setter = isUpdate ? setSelectedProductForm : setProductForm;
            setter(prev => ({
                ...prev,
                contract_name: contract.name,
                contract_master: contract.main_contract,
                introduction: contract.start_date ? formatForInput(contract.start_date) : prev.introduction
            }));
        }
    };

    const handleContractItemSelect = (e, isUpdate = false) => {
        const itemName = e.target.value;
        if (!itemName) return;
        const setter = isUpdate ? setSelectedProductForm : setProductForm;
        setter(prev => ({ ...prev, product_name: itemName }));
    };

    const handleToggleChange = (newValue, isUpdate = false) => {
        const setter = isUpdate ? setSelectedProductForm : setProductForm;
        setter(prev => ({ ...prev, partnership: newValue }));
    };

    const handleDetailChange = (e, isUpdate = false) => {
        const { name, value } = e.target;
        const setter = isUpdate ? setSelectedProductForm : setProductForm;
        setter(prev => ({ ...prev, productDetail: { ...prev.productDetail, [name]: value } }));
    };

    const handleDateChange = (e, field, isUpdate = false) => {
        const val = e.target.value;
        const setter = isUpdate ? setSelectedProductForm : setProductForm;
        setter(prev => ({ ...prev, [field]: val }));
    };

    const handleDetailDateChange = (e, field, isUpdate = false) => {
        const val = e.target.value;
        const setter = isUpdate ? setSelectedProductForm : setProductForm;
        setter(prev => ({ ...prev, productDetail: { ...prev.productDetail, [field]: val } }));
    };

    const handleSubmit = async () => {
        if (!productForm.product_name || !productForm.contract_name) {
            window.alert('필수 입력: 제품명과 계약명은 필수입니다.');
            return;
        }
        try {
            await axios.post(API_PRODUCT_URL, productForm);
            fetchProducts();
            setIsRegOpen(false);
            setProductForm(initialProductForm);
            window.alert('등록 완료: 제품이 등록되었습니다.');
        } catch (error) {
            console.error(error);
            window.alert('오류: 제품 등록에 실패했습니다.');
        }
    };

    const handleUpdate = async () => {
        if (!selectedProductForm || !selectedProductForm.id) return;
        if (!selectedProductForm.product_name || !selectedProductForm.contract_name) {
            window.alert('필수 입력 누락');
            return;
        }

        if (window.confirm('수정하시겠습니까?')) {
            try {
                const payload = {
                    ...selectedProductForm,
                    productName: selectedProductForm.product_name,
                    contractName: selectedProductForm.contract_name
                };
                await axios.put(`${API_PRODUCT_URL}/${selectedProductForm.id}`, payload);
                await fetchProducts();
                setSelectedProduct(null);
                window.alert('수정 완료: 제품 정보가 수정되었습니다.');
            } catch (error) {
                console.error(error);
                window.alert('오류: 제품 수정에 실패했습니다.');
            }
        }
    };

    const handleDelete = async () => {
        if (!selectedProduct || !selectedProduct.id) return;
        if (window.confirm('제품을 삭제하시겠습니까?')) {
            try {
                await axios.delete(`${API_PRODUCT_URL}/${selectedProduct.id}`);
                await fetchProducts();
                setSelectedProduct(null);
                window.alert('삭제 완료: 제품이 삭제되었습니다.');
            } catch (error) {
                console.error(error);
                window.alert('오류: 제품 삭제에 실패했습니다.');
            }
        }
    };

    const renderContractLink = ({ isUpdateMode = false }) => {
        const currentForm = isUpdateMode ? selectedProductForm : productForm;
        const currentContract = contractList.find(c => c.name === currentForm.contract_name);
        const contractItems = currentContract?.items || [];

        return (
            <div className="mb-4 p-4 bg-indigo-50/50 dark:bg-slate-700/30 border border-indigo-100 dark:border-slate-600 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-indigo-700 dark:text-indigo-300 mb-1">
                    <Icons.Link /> 계약 정보 불러오기 (자동 입력)
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className={labelStyle}>계약 선택</label>
                        <select onChange={(e) => handleContractSelect(e, isUpdateMode)} className={`${inputStyle} appearance-none cursor-pointer`} value={currentContract?.id || ''}>
                            <option value="">계약 목록을 선택하세요</option>
                            {contractList.map(contract => (
                                <option key={contract.id} value={contract.id}>{contract.name} ({contract.company_name})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className={labelStyle}>상세 품목 선택</label>
                        <select onChange={(e) => handleContractItemSelect(e, isUpdateMode)} className={`${inputStyle} appearance-none cursor-pointer`} disabled={!currentContract}>
                            <option value="">품목 목록을 선택하세요</option>
                            {contractItems.map((item, idx) => (
                                <option key={idx} value={item.name}>{item.name} (수량: {item.quantity})</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
        );
    };

    const inputStyle = "w-full border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 bg-gray-50/50 dark:bg-slate-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 transition-all text-sm hover:bg-white dark:hover:bg-slate-800";
    const labelStyle = "block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 ml-1";
    const modalContentStyle = "fixed left-[50%] top-[50%] max-h-[85vh] w-[95vw] max-w-[850px] translate-x-[-50%] translate-y-[-50%] rounded-xl bg-white dark:bg-slate-800 shadow-2xl focus:outline-none z-50 overflow-y-auto border border-gray-100 dark:border-slate-700 transition-all";
    const gradientStyle = { backgroundSize: '200% 200%', animation: 'moveGradient 8s ease infinite' };

    const renderDetailForm = ({ isUpdateMode = false }) => {
        const currentForm = isUpdateMode ? selectedProductForm : productForm;
        if (!currentForm) return null;
        const detail = currentForm.productDetail || {};

        return (
            <div className="relative group rounded-xl mt-2 animate-fadeIn">
                <div className="absolute -inset-[2px] rounded-xl bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 opacity-30 blur-sm"></div>
                <div className="relative bg-white dark:bg-slate-900 rounded-xl p-5 border border-violet-100 dark:border-slate-700 shadow-sm">
                    <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-slate-700 pb-2 mb-3 flex items-center gap-2">
                        <span className="text-fuchsia-500 bg-fuchsia-50 p-1 rounded-lg"><Icons.Settings /></span> 제품 상세 스펙
                    </h4>
                    <div className="grid grid-cols-3 gap-3">
                        <div><label className={labelStyle}>Host Name</label><input name="host_name" value={detail.host_name || ''} onChange={(e) => handleDetailChange(e, isUpdateMode)} className={inputStyle} /></div>
                        <div><label className={labelStyle}>IP Address</label><input name="ip" value={detail.ip || ''} onChange={(e) => handleDetailChange(e, isUpdateMode)} className={inputStyle} /></div>
                        <div><label className={labelStyle}>OS / Version</label><div className="flex gap-2"><input name="detail_os" value={detail.detail_os || ''} onChange={(e) => handleDetailChange(e, isUpdateMode)} className={inputStyle} /><input name="os_version" value={detail.os_version || ''} onChange={(e) => handleDetailChange(e, isUpdateMode)} className={inputStyle} /></div></div>
                        <div><label className={labelStyle}>접속 ID</label><input name="detail_id" value={detail.detail_id || ''} onChange={(e) => handleDetailChange(e, isUpdateMode)} className={inputStyle} /></div>
                        <div><label className={labelStyle}>접속 PW</label><input name="detail_pw" value={detail.detail_pw || ''} onChange={(e) => handleDetailChange(e, isUpdateMode)} className={inputStyle} type="text" /></div>
                        <div><label className={labelStyle}>작업/설치일</label><input type="date" value={detail.process_date || ''} onChange={(e) => handleDetailDateChange(e, 'process_date', isUpdateMode)} className={inputStyle} /></div>
                        <div><label className={labelStyle}>CPU</label><input name="detail_cpu" value={detail.detail_cpu || ''} onChange={(e) => handleDetailChange(e, isUpdateMode)} className={inputStyle} /></div>
                        <div><label className={labelStyle}>Memory</label><input name="detail_memory" value={detail.detail_memory || ''} onChange={(e) => handleDetailChange(e, isUpdateMode)} className={inputStyle} /></div>
                        <div><label className={labelStyle}>Disk</label><input name="detail_disk" value={detail.detail_disk || ''} onChange={(e) => handleDetailChange(e, isUpdateMode)} className={inputStyle} /></div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <Tooltip.Provider delayDuration={300}>
            <style>{`
                @keyframes moveGradient { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
            `}</style>

            <div className="p-6 max-w-7xl mx-auto min-h-screen text-gray-800 dark:text-gray-100 font-sans">
                {/* 헤더 영역 */}
                <div className="relative flex items-center justify-center mb-8 h-12">
                    <div className="relative w-full max-w-md group z-0 h-11">
                        <div className="absolute -inset-[2px] rounded-lg bg-gradient-to-r
                             from-violet-500
                             via-stone-500
                             to-pink-500 opacity-70 blur-sm transition duration-1000 group-hover:opacity-100 group-hover:duration-200"
                             style={gradientStyle}></div>
                        <div
                            className="relative flex items-center bg-white dark:bg-slate-800 rounded-lg p-[1px] h-full">
                            <svg className="w-5 h-5 absolute left-3 text-gray-400 pointer-events-none" fill="none"
                                 stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                            </svg>
                            <input
                                type="text"
                                className="w-full pl-10 pr-4 h-full bg-transparent border-transparent rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-0 relative z-10"
                                placeholder="제품명, 시리얼, 계약명 검색"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="absolute right-0 flex-shrink-0">
                        <button onClick={() => setIsRegOpen(true)}
                                className="h-11 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors shadow-sm text-sm font-medium whitespace-nowrap">
                            <Icons.Plus/> <span>제품 등록</span>
                        </button>
                    </div>
                </div>

                {/* 메인 테이블 */}
                <div
                    className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 overflow-x-auto flex flex-col">
                    <table className="w-full text-left border-collapse table-fixed min-w-[1000px]">
                        <thead
                            className="bg-gray-50/80 dark:bg-slate-700/50 border-b border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-300">
                        <tr>
                            <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider w-[5%] whitespace-nowrap">순번</th>
                            <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider w-[8%] whitespace-nowrap">제품군</th>
                            <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider w-[22%] whitespace-nowrap">제품명</th>
                            <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider w-[10%] whitespace-nowrap">파트너</th>
                            <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider w-[15%] whitespace-nowrap">S/N</th>
                            <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider w-[15%] whitespace-nowrap">계약명</th>
                            <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider w-[10%] whitespace-nowrap">도입일</th>
                            <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider w-[8%] text-center whitespace-nowrap">설정</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                        {isLoading ? (
                            <TableLoader colSpan={8}/>
                        ) : paginatedProducts.length > 0 ? (
                            paginatedProducts.map((product, idx) => (
                                <tr key={product.id || idx}
                                    className="hover:bg-indigo-50/50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group"
                                    onClick={() => handleEditClick(product)}>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-mono whitespace-nowrap">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">{product.type}</td>

                                    <td className="px-6 py-4 text-sm font-bold text-gray-800 dark:text-gray-100">
                                        <div className="flex items-center gap-2.5">
                                            <div
                                                className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400 shadow-sm flex-shrink-0">
                                                <Icons.Server/></div>
                                            <div className="flex-1 min-w-0 block truncate"
                                                 title={product.product_name || product.productName}>
                                                {product.product_name || product.productName}
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <PartnershipBadge isPartner={product.partnership}/>
                                    </td>

                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-mono tracking-tight whitespace-nowrap">
                                        <Tooltip.Root>
                                            <Tooltip.Trigger asChild>
                                                <div className="truncate block cursor-help max-w-full">
                                                    {product.product_serial || product.productSerial}
                                                </div>
                                            </Tooltip.Trigger>
                                            <Tooltip.Portal>
                                                <Tooltip.Content
                                                    className="z-50 px-3 py-1.5 text-xs font-medium text-white bg-gray-900 rounded-md shadow-md animate-fadeIn"
                                                    sideOffset={5}>
                                                    {product.product_serial || product.productSerial}
                                                    <Tooltip.Arrow className="fill-gray-900"/>
                                                </Tooltip.Content>
                                            </Tooltip.Portal>
                                        </Tooltip.Root>
                                    </td>

                                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 truncate font-medium whitespace-nowrap"
                                        title={product.contract_name || product.contractName}>
                                        {product.contract_name || product.contractName}
                                    </td>

                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">{formatDisplayDate(product.introduction)}</td>

                                    <td className="px-6 py-4 text-center whitespace-nowrap">
                                        <button onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditClick(product);
                                        }}
                                                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-600 rounded-lg transition-all transform hover:scale-110">
                                            <Icons.Settings/>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" className="px-6">
                                    <div
                                        className="h-[60vh] flex flex-col items-center justify-center gap-4 text-gray-400 dark:text-gray-500">
                                        <div className="bg-gray-50 dark:bg-slate-700/50 p-6 rounded-full">
                                            <Icons.Server className="w-10 h-10 opacity-50"/>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-lg font-medium text-gray-500 dark:text-gray-400">데이터가
                                                존재하지 않습니다.</p>
                                            <p className="text-sm text-gray-400 mt-1">새로운 제품을 등록하거나 검색어를 변경해보세요.</p>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
                <Pagination totalItems={filteredProducts.length} itemsPerPage={itemsPerPage} currentPage={currentPage}
                            onPageChange={setCurrentPage}/>

                {/* --- 1. 제품 등록 모달 --- */}
                <Dialog.Root open={isRegOpen} onOpenChange={(open) => {
                    setIsRegOpen(open);
                    if (!open) setIsDetailExpanded(false);
                }}>
                    <Dialog.Portal>
                        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm transition-opacity"/>
                        <Dialog.Content className={modalContentStyle} onPointerDownOutside={(e) => e.preventDefault()}>
                            <div
                                className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-slate-700 sticky top-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md z-10">
                                <div>
                                    <Dialog.Title
                                        className="text-lg font-extrabold text-gray-900 dark:text-white tracking-tight">신규
                                        제품 등록</Dialog.Title>
                                    <Dialog.Description className="text-xs text-gray-500 mt-1">새로운 장비 또는 소프트웨어 정보를
                                        등록합니다. 필수 항목을 확인해주세요.</Dialog.Description>
                                </div>
                                <Dialog.Close asChild>
                                    <button
                                        className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-400 transition-colors">
                                        <Icons.X/></button>
                                </Dialog.Close>
                            </div>
                            <div className="p-5 space-y-3">
                                {!isDetailExpanded && (
                                    <div className="space-y-3 animate-fadeIn">
                                        {renderContractLink({isUpdateMode: false})}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div><label className={labelStyle}>카테고리<RequiredStar/></label>
                                                <select name="category" value={productForm.category}
                                                        onChange={handleFormChange}
                                                        className={`${inputStyle} appearance-none cursor-pointer`}>
                                                    <option value="H/W">H/W (하드웨어)</option>
                                                    <option value="S/W">S/W (소프트웨어)</option>
                                                    <option value="기타">기타</option>
                                                </select>
                                            </div>
                                            <div><label className={labelStyle}>제품군</label><input name="type"
                                                                                                 value={productForm.type}
                                                                                                 onChange={handleFormChange}
                                                                                                 className={inputStyle}
                                                                                                 placeholder="ex) Server, Storage"/>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div><label className={labelStyle}>제품명<RequiredStar/></label><input
                                                name="product_name" value={productForm.product_name}
                                                onChange={handleFormChange} className={inputStyle}
                                                placeholder="제품 모델명"/></div>
                                            <div><label className={labelStyle}>Serial Number</label><input
                                                name="product_serial" value={productForm.product_serial}
                                                onChange={handleFormChange} className={inputStyle}
                                                placeholder="S/N 입력"/></div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div><label className={labelStyle}>계약명<RequiredStar/></label><input
                                                name="contract_name" value={productForm.contract_name}
                                                onChange={handleFormChange} className={inputStyle}
                                                placeholder="관련 계약명"/></div>
                                            <div><label className={labelStyle}>계약 담당자</label><input
                                                name="contract_master" value={productForm.contract_master}
                                                onChange={handleFormChange} className={inputStyle}
                                                placeholder="담당자 성명"/></div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div><label className={labelStyle}>도입년도</label><input type="date"
                                                                                                  value={productForm.introduction}
                                                                                                  onChange={(e) => handleDateChange(e, 'introduction')}
                                                                                                  className={inputStyle}/>
                                            </div>
                                            <div><PartnershipToggle checked={productForm.partnership}
                                                                    onChange={(val) => handleToggleChange(val)}/></div>
                                        </div>
                                        <div><label className={labelStyle}>메모</label><textarea name="memo"
                                                                                               value={productForm.memo}
                                                                                               onChange={handleFormChange}
                                                                                               rows="2"
                                                                                               className={`${inputStyle} resize-none`}
                                                                                               placeholder="특이사항 입력"></textarea>
                                        </div>

                                        <div onClick={() => setIsDetailExpanded(true)}
                                             className="relative group mt-1 cursor-pointer rounded-xl overflow-hidden">
                                            <div
                                                className="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                                            <div
                                                className="relative flex justify-between items-center bg-gray-50 dark:bg-slate-700/50 p-3 border border-gray-200 dark:border-slate-600 rounded-xl transition-all group-hover:border-violet-300">
                                                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                                                    <span
                                                        className="text-violet-500 bg-violet-50 p-1 rounded"><Icons.Server/></span> 제품
                                                    상세정보 (Detail)</h3>
                                                <div
                                                    className="flex items-center gap-1 text-violet-600 font-semibold text-xs bg-violet-50 px-3 py-1.5 rounded-full">입력 <Icons.ChevronDown/>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {isDetailExpanded && renderDetailForm({isUpdateMode: false})}
                            </div>
                            <div
                                className="p-4 border-t border-gray-100 dark:border-slate-700 flex justify-end gap-3 bg-gray-50/50 dark:bg-slate-800 rounded-b-2xl">
                                {isDetailExpanded ? (
                                    <button onClick={() => setIsDetailExpanded(false)}
                                            className="px-4 py-2 text-gray-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 rounded-lg transition-all text-sm font-medium">뒤로
                                        가기</button>
                                ) : (
                                    <Dialog.Close asChild>
                                        <button
                                            className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold text-sm shadow-sm transition-all">취소
                                        </button>
                                    </Dialog.Close>
                                )}
                                <button onClick={handleSubmit}
                                        className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-bold text-sm shadow-lg shadow-indigo-200 dark:shadow-none transition-all transform hover:-translate-y-0.5">제품
                                    등록 완료
                                </button>
                            </div>
                        </Dialog.Content>
                    </Dialog.Portal>
                </Dialog.Root>

                {/* --- 2. 제품 수정 모달 --- */}
                <Dialog.Root open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
                    <Dialog.Portal>
                        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm transition-opacity"/>
                        <Dialog.Content className={modalContentStyle} onPointerDownOutside={(e) => e.preventDefault()}>
                            <div
                                className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-slate-700 sticky top-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md z-10">
                                <div>
                                    <Dialog.Title
                                        className="text-lg font-extrabold text-gray-900 dark:text-white tracking-tight">제품
                                        정보 수정</Dialog.Title>
                                    <Dialog.Description className="text-xs text-gray-500 mt-1">등록된 제품의 정보를 수정하거나 삭제합니다.
                                        필수 항목을 확인해주세요.</Dialog.Description>
                                </div>
                                <Dialog.Close asChild>
                                    <button
                                        className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-400 transition-colors">
                                        <Icons.X/></button>
                                </Dialog.Close>
                            </div>
                            <div className="p-5 space-y-3">
                                {selectedProductForm && (
                                    <>
                                        {!isDetailExpanded && (
                                            <div className="space-y-3 animate-fadeIn">
                                                {renderContractLink({isUpdateMode: true})}
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div><label className={labelStyle}>카테고리<RequiredStar/></label>
                                                        <select name="category" value={selectedProductForm.category}
                                                                onChange={(e) => handleFormChange(e, true)}
                                                                className={`${inputStyle} appearance-none cursor-pointer`}>
                                                            <option value="H/W">H/W</option>
                                                            <option value="S/W">S/W</option>
                                                            <option value="기타">기타</option>
                                                        </select>
                                                    </div>
                                                    <div><label className={labelStyle}>제품군</label><input name="type"
                                                                                                         value={selectedProductForm.type || ''}
                                                                                                         onChange={(e) => handleFormChange(e, true)}
                                                                                                         className={inputStyle}/>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div><label className={labelStyle}>제품명<RequiredStar/></label><input
                                                        name="product_name"
                                                        value={selectedProductForm.product_name || ''}
                                                        onChange={(e) => handleFormChange(e, true)}
                                                        className={inputStyle}/></div>
                                                    <div><label className={labelStyle}>S/N</label><input
                                                        name="product_serial"
                                                        value={selectedProductForm.product_serial || ''}
                                                        onChange={(e) => handleFormChange(e, true)}
                                                        className={inputStyle}/></div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div><label className={labelStyle}>계약명<RequiredStar/></label><input
                                                        name="contract_name"
                                                        value={selectedProductForm.contract_name || ''}
                                                        onChange={(e) => handleFormChange(e, true)}
                                                        className={inputStyle}/></div>
                                                    <div><label className={labelStyle}>계약 담당자</label><input
                                                        name="contract_master"
                                                        value={selectedProductForm.contract_master || ''}
                                                        onChange={(e) => handleFormChange(e, true)}
                                                        className={inputStyle}/></div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div><label className={labelStyle}>도입년도</label><input type="date"
                                                                                                          value={selectedProductForm.introduction || ''}
                                                                                                          onChange={(e) => handleDateChange(e, 'introduction', true)}
                                                                                                          className={inputStyle}/>
                                                    </div>
                                                    <div><PartnershipToggle checked={selectedProductForm.partnership}
                                                                            onChange={(val) => handleToggleChange(val, true)}/>
                                                    </div>
                                                </div>
                                                <div><label className={labelStyle}>메모</label><textarea name="memo"
                                                                                                       value={selectedProductForm.memo || ''}
                                                                                                       onChange={(e) => handleFormChange(e, true)}
                                                                                                       rows="2"
                                                                                                       className={`${inputStyle} resize-none`}></textarea>
                                                </div>
                                                <div onClick={() => setIsDetailExpanded(true)}
                                                     className="relative group mt-1 cursor-pointer rounded-xl overflow-hidden">
                                                    <div
                                                        className="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                                                    <div
                                                        className="relative flex justify-between items-center bg-gray-50 dark:bg-slate-700/50 p-3 border border-gray-200 dark:border-slate-600 rounded-xl transition-all group-hover:border-violet-300">
                                                        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                                                            <span
                                                                className="text-violet-500 bg-violet-50 p-1 rounded"><Icons.Server/></span> 제품
                                                            상세정보 (Detail)</h3>
                                                        <div
                                                            className="flex items-center gap-1 text-violet-600 font-semibold text-xs bg-violet-50 px-3 py-1.5 rounded-full">확인
                                                            및 수정 <Icons.ChevronDown/></div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {isDetailExpanded && renderDetailForm({isUpdateMode: true})}
                                    </>
                                )}
                            </div>
                            <div
                                className="p-4 border-t border-gray-100 dark:border-slate-700 flex justify-end gap-3 bg-gray-50/50 dark:bg-slate-800 rounded-b-2xl">
                                <button onClick={handleDelete}
                                        className="mr-auto px-4 py-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all text-sm font-bold border border-transparent hover:border-rose-200">삭제
                                </button>
                                {isDetailExpanded ? (
                                    <button onClick={() => setIsDetailExpanded(false)}
                                            className="px-4 py-2 text-gray-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 rounded-lg transition-all text-sm font-medium">뒤로
                                        가기</button>
                                ) : (
                                    <Dialog.Close asChild>
                                        <button
                                            className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold text-sm shadow-sm transition-all">취소
                                        </button>
                                    </Dialog.Close>
                                )}
                                <button onClick={handleUpdate}
                                        className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-bold text-sm shadow-lg shadow-indigo-200 dark:shadow-none transition-all transform hover:-translate-y-0.5">제품
                                    정보 수정 완료
                                </button>
                            </div>
                        </Dialog.Content>
                    </Dialog.Portal>
                </Dialog.Root>
            </div>
        </Tooltip.Provider>
    );
}