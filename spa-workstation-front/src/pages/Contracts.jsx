import React, { useState, useMemo, useEffect, useCallback } from 'react';
import axios from 'axios';
import * as Dialog from '@radix-ui/react-dialog';
import * as Tooltip from '@radix-ui/react-tooltip';
import * as Popover from '@radix-ui/react-popover';
import Swal from 'sweetalert2';

import TableLoader from '../components/TableLoader';

// --- 날짜 관련 라이브러리 ---
import { format, addMonths, addYears } from 'date-fns';
import { ko } from 'date-fns/locale';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Calendar as CalendarIcon } from 'lucide-react';

// --- 아이콘 컴포넌트 ---
const PlusIcon = ({ className }) => <svg className={className || "w-4 h-4"} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>;
const XIcon = ({ className }) => <svg className={className || "w-4 h-4"} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>;
const SearchIcon = ({ className }) => <svg className={className || "w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>;
const SettingsIcon = ({ className }) => <svg className={className || "w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.941 3.31.81 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.81 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756 0 3.35a1.724 1.724 0 00-2.573-1.066c-1.543.941-3.31-.81-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.81-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065zM12 15a3 3 0 110-6 3 3 0 010 6z"></path></svg>;
const ChevronDownIcon = ({ className }) => <svg className={className || "w-4 h-4"} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>;
const ChevronUpIcon = ({ className }) => <svg className={className || "w-4 h-4"} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path></svg>;
const DocumentIcon = ({ className }) => <svg className={className || "w-4 h-4"} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;

// [API 주소]
const API_CONTRACT_URL = '/api/contract';
const API_COMPANY_URL = '/api/company';
const API_CUSTOMER_URL = '/api/customer';
const API_PARTNER_URL = '/api/partner';

// --- 헬퍼 함수 ---
const getCurrentDate = () => new Date().toISOString().split('T')[0];
const formatDateToString = (date) => { if (!date) return ''; const offset = date.getTimezoneOffset() * 60000; return (new Date(date - offset)).toISOString().slice(0, 10); };
const formatDisplayDate = (dateStr) => { if (!dateStr) return '-'; return dateStr.split('T')[0]; };
const RequiredStar = () => <span className="text-red-500 ml-1">*</span>;

// BusinessPeriodPicker 컴포넌트
const BusinessPeriodPicker = ({ startDate, endDate, onApply, className }) => {
    const [date, setDate] = useState({ from: startDate ? new Date(startDate) : undefined, to: endDate ? new Date(endDate) : undefined });
    const [month, setMonth] = useState(startDate ? new Date(startDate) : new Date());
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [selectedPreset, setSelectedPreset] = useState(null);

    useEffect(() => {
        const start = startDate ? new Date(startDate) : undefined;
        const end = endDate ? new Date(endDate) : undefined;
        setDate({ from: start, to: end });
        if (start) setMonth(start);
    }, [startDate, endDate]);

    const presets = [ { label: '3개월', value: 3, type: 'month' }, { label: '6개월', value: 6, type: 'month' }, { label: '1년', value: 1, type: 'year' }, { label: '2년', value: 2, type: 'year' }, { label: '3년', value: 3, type: 'year' } ];

    const handlePresetClick = (preset) => {
        const baseDate = date.from || new Date();
        let newEndDate;
        if (preset.type === 'month') newEndDate = addMonths(baseDate, preset.value);
        else if (preset.type === 'year') newEndDate = addYears(baseDate, preset.value);
        setDate({ from: baseDate, to: newEndDate });
        setMonth(baseDate);
        setSelectedPreset(preset.label);
    };
    const handleSelect = (selectedDate) => { setDate(selectedDate); setSelectedPreset(null); };
    const handleReset = () => { setDate({ from: undefined, to: undefined }); setSelectedPreset(null); };
    const handleApply = () => { if (date?.from) { onApply(date.from, date.to || date.from); setIsPopoverOpen(false); } else { setIsPopoverOpen(false); } };

    return (
        <Popover.Root open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <Popover.Trigger asChild>
                <button type="button" className={`flex items-center justify-start text-left font-normal ${className} ${!date?.from ? "text-gray-500" : ""}`}>
                    <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                    {date?.from ? (date.to ? <>{format(date.from, 'yyyy-MM-dd')} ~ {format(date.to, 'yyyy-MM-dd')}</> : format(date.from, 'yyyy-MM-dd')) : <span className="text-gray-400">기간 선택</span>}
                </button>
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Content side="bottom" align="start" sideOffset={8} className="w-auto p-0 bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-gray-200 dark:border-slate-700 z-[9999] overflow-hidden flex flex-row">
                    <div className="w-[140px] border-r border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50 p-3 flex flex-col gap-1">
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 px-2">기간 자동 설정</span>
                        {presets.map((preset, idx) => (
                            <button key={idx} type="button" onClick={() => handlePresetClick(preset)} className={`text-xs text-left px-3 py-2 rounded-md transition-all ${selectedPreset === preset.label ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 font-medium' : 'text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-gray-100 hover:shadow-sm'}`}>+ {preset.label}</button>
                        ))}
                    </div>
                    <div className="flex flex-col">
                        <div className="p-3">
                            <DayPicker mode="range" month={month} onMonthChange={setMonth} selected={date} onSelect={handleSelect} numberOfMonths={2} pagedNavigation locale={ko} modifiersClassNames={{ selected: 'bg-blue-600 text-white hover:bg-blue-600 rounded-md', today: 'font-bold text-blue-600', range_middle: 'bg-blue-50 text-blue-900 rounded-none dark:bg-slate-700 dark:text-blue-100', range_start: 'bg-blue-600 text-white rounded-l-md rounded-r-none', range_end: 'bg-blue-600 text-white rounded-r-md rounded-l-none' }} styles={{ months: { gap: '1.5rem' }, head_cell: { width: '36px', fontSize: '0.8rem', color: '#6b7280' }, cell: { width: '36px', height: '36px' }, table: { maxWidth: 'none' }, day: { margin: '0', width: '36px', height: '36px', fontSize: '0.9rem' }, caption: { paddingBottom: '0.5rem', fontSize: '0.95rem' } }} />
                        </div>
                        <div className="flex items-center justify-between border-t border-gray-200 dark:border-slate-700 p-3 bg-gray-50/30 dark:bg-slate-800/30">
                            <div className="text-xs text-gray-500 px-2">{date?.from ? <>{format(date.from, 'yyyy-MM-dd')}{date.to && ` ~ ${format(date.to, 'yyyy-MM-dd')}`}</> : '날짜를 선택하세요'}</div>
                            <div className="flex gap-2">
                                <button type="button" onClick={handleReset} className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 border border-gray-300 dark:border-slate-600 rounded hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">초기화</button>
                                <button type="button" onClick={handleApply} className="px-4 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors shadow-sm font-medium">적용</button>
                            </div>
                        </div>
                    </div>
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
};


export default function Contracts() {
    const [searchTerm, setSearchTerm] = useState('');
    const [isRegOpen, setIsRegOpen] = useState(false);
    const [selectedContract, setSelectedContract] = useState(null);

    const [isItemsExpanded, setIsItemsExpanded] = useState(false);
    const [isItemInputOpen, setIsItemInputOpen] = useState(false);

    const [isLoading, setIsLoading] = useState(true);

    const [contractList, setContractList] = useState([]);
    const [companyList, setCompanyList] = useState([]);
    const [customerList, setCustomerList] = useState([]);
    const [partnerList, setPartnerList] = useState([]);

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setIsLoading(true);
        try {
            const [contracts, companies, customers, partners, _] = await Promise.all([
                axios.get(API_CONTRACT_URL),
                axios.get(API_COMPANY_URL),
                axios.get(API_CUSTOMER_URL),
                axios.get(API_PARTNER_URL),
                new Promise(resolve => setTimeout(resolve, 1000))
            ]);

            setContractList(contracts.data || []);
            setCompanyList(companies.data || []);
            setCustomerList(customers.data || []);
            setPartnerList(partners.data || []);
        } catch (error) {
            console.error("초기 데이터 로드 실패:", error);
            Swal.fire('오류', '데이터를 불러오는데 실패했습니다.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchContractsOnly = async () => {
        setIsLoading(true);
        try {
            const [response, _] = await Promise.all([
                axios.get(API_CONTRACT_URL),
                new Promise(resolve => setTimeout(resolve, 1000))
            ]);
            setContractList(response.data || []);
        } catch (error) {
            console.error("계약 목록 갱신 실패:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // --- 1. 등록 폼 상태 ---
    const initialContractForm = useMemo(() => ({
        category: '조달계약', status: '예정', name: '', amount: '',
        company_name: '',
        main_contractor: '',
        main_contract: '',
        start_date: getCurrentDate(), end_date: getCurrentDate(), contract_date: getCurrentDate(),
        sub_contractor: '', sub_contract: '', items: [],
    }), []);
    const [contractForm, setContractForm] = useState(initialContractForm);

    // --- 2. 수정 폼 상태 ---
    const [selectedContractForm, setSelectedContractForm] = useState(null);
    useEffect(() => {
        if (selectedContract) {
            const data = JSON.parse(JSON.stringify(selectedContract));
            if (!data.items || !Array.isArray(data.items)) data.items = [];
            if (!data.main_contract) data.main_contract = '';

            // 데이터 복구 로직 (하도급 업체명 누락 시 복구)
            if (!data.sub_contractor && data.sub_contract) {
                const foundPartner = partnerList.find(p => p.rep === data.sub_contract);
                if (foundPartner) data.sub_contractor = foundPartner.name;
            }

            setSelectedContractForm(data);
            setIsItemsExpanded(false);
        } else {
            setSelectedContractForm(null);
        }
    }, [selectedContract, partnerList]);

    const [newItem, setNewItem] = useState({ name: '', quantity: '1', unitPrice: '', vatRate: 0.1, vendorName: '' });

    // --- 헬퍼 ---
    const formatNumber = (num) => {
        if (num === null || num === undefined || num === '') return '';
        const cleanNum = String(num).replace(/[^\d.]/g, '');
        if (cleanNum === '') return '';
        if (cleanNum.includes('.')) {
            const parts = cleanNum.split('.');
            return Number(parts[0]).toLocaleString('ko-KR') + (parts.length > 1 ? '.' + parts[1] : '');
        }
        return Number(cleanNum).toLocaleString('ko-KR');
    };
    const cleanNumber = (value) => Number(String(value).replace(/[^\d.]/g, '') || 0);
    const calculateItemTotals = useCallback((quantity, unitPrice, vatRate) => {
        const price = cleanNumber(unitPrice); const qty = cleanNumber(quantity); const rate = Number(vatRate) || 0;
        const supplyValue = price; const totalSupplyValue = supplyValue * qty;
        const vat = Math.round(totalSupplyValue * rate);
        return { totalSupplyValue: totalSupplyValue, vatAmount: vat, totalAmount: totalSupplyValue + vat };
    }, []);

    const getGrandTotalsReg = useMemo(() => {
        return (contractForm.items || []).reduce((totals, item) => ({
            totalQuantity: totals.totalQuantity + cleanNumber(item.quantity),
            totalUnitPrice: totals.totalUnitPrice + cleanNumber(item.unitPrice),
            totalSupplyValue: totals.totalSupplyValue + cleanNumber(item.supplyValue),
            totalVatAmount: totals.totalVatAmount + cleanNumber(item.vatAmount),
            totalAmount: totals.totalAmount + cleanNumber(item.totalAmount)
        }), { totalQuantity: 0, totalUnitPrice: 0, totalSupplyValue: 0, totalVatAmount: 0, totalAmount: 0 });
    }, [contractForm.items]);

    const getGrandTotalsSelected = useMemo(() => {
        if (!selectedContractForm) return { totalQuantity: 0, totalUnitPrice: 0, totalSupplyValue: 0, totalVatAmount: 0, totalAmount: 0 };
        const items = selectedContractForm.items || [];
        return items.reduce((totals, item) => ({
            totalQuantity: totals.totalQuantity + cleanNumber(item.quantity),
            totalUnitPrice: totals.totalUnitPrice + cleanNumber(item.unitPrice),
            totalSupplyValue: totals.totalSupplyValue + cleanNumber(item.supplyValue),
            totalVatAmount: totals.totalVatAmount + cleanNumber(item.vatAmount),
            totalAmount: totals.totalAmount + cleanNumber(item.totalAmount)
        }), { totalQuantity: 0, totalUnitPrice: 0, totalSupplyValue: 0, totalVatAmount: 0, totalAmount: 0 });
    }, [selectedContractForm]);

    const getTotalContractAmountReg = useMemo(() => getGrandTotalsReg.totalAmount, [getGrandTotalsReg]);
    const getTotalContractAmountSelected = useMemo(() => getGrandTotalsSelected.totalAmount, [getGrandTotalsSelected]);

    const filteredContracts = contractList.filter(c =>
        (c.name && c.name.includes(searchTerm)) || (c.company_name && c.company_name.includes(searchTerm))
    );

    // --- 핸들러 ---
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        if (name === 'amount') {
            const rawValue = value.replace(/[^0-9]/g, '');
            setContractForm(prev => ({ ...prev, amount: rawValue }));
        } else {
            setContractForm(prev => {
                const newState = { ...prev, [name]: value };
                if (name === 'company_name') newState.main_contract = '';
                if (name === 'sub_contractor') newState.sub_contract = '';
                return newState;
            });
        }
    };

    const handlePeriodApply = (start, end) => {
        setContractForm(prev => ({ ...prev, start_date: formatDateToString(start), end_date: formatDateToString(end) }));
    };
    const handleSelectedPeriodApply = (start, end) => {
        setSelectedContractForm(prev => ({ ...prev, start_date: formatDateToString(start), end_date: formatDateToString(end) }));
    };
    const handleContractDateChange = (date) => {
        setContractForm(prev => ({ ...prev, contract_date: date ? formatDateToString(date) : '' }));
    };

    const handleItemInputChange = (e) => {
        const { name, value } = e.target;
        const rawValue = (name === 'name' || name === 'vendorName') ? value : value.replace(/[^0-9.]/g, '');
        setNewItem(prev => {
            let nextState = { ...prev };
            if (name === 'vatRate') {
                const rate = cleanNumber(rawValue) / 100; nextState[name] = rate;
            } else {
                nextState[name] = rawValue;
            }
            if (name === 'unitPrice' || name === 'vatRate' || name === 'quantity') {
                const { vatAmount } = calculateItemTotals(nextState.quantity, nextState.unitPrice, nextState.vatRate);
                return { ...nextState, vatAmount };
            }
            return nextState;
        });
    };
    const handleNewItemQtyChange = (delta) => {
        const currentQty = cleanNumber(newItem.quantity);
        const newQty = Math.max(1, currentQty + delta);
        setNewItem(prev => ({ ...prev, quantity: String(newQty) }));
    };
    const handleAddItem = () => {
        if (!newItem.name || !cleanNumber(newItem.quantity) || !cleanNumber(newItem.unitPrice)) {
            Swal.fire('입력 오류', '품목, 수량, 단가를 확인해주세요.', 'warning');
            return;
        }
        const totals = calculateItemTotals(newItem.quantity, newItem.unitPrice, newItem.vatRate);
        setContractForm(prev => ({
            ...prev, items: [...prev.items, {
                ...newItem, unitPrice: cleanNumber(newItem.unitPrice), quantity: cleanNumber(newItem.quantity),
                vendorName: newItem.vendorName || prev.main_contractor || '',
                supplyValue: totals.totalSupplyValue, vatAmount: totals.vatAmount, totalAmount: totals.totalAmount, vatRate: newItem.vatRate || 0.1
            }]
        }));
        setNewItem(prev => ({ ...prev, name: '', quantity: '1', unitPrice: '' }));
    };
    const handleRemoveItem = (index) => {
        setContractForm(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
    };
    const handleItemTableChange = (index, field, rawValue) => {
        const value = field === 'name' || field === 'vendorName' ? rawValue : rawValue.replace(/[^0-9.]/g, '');
        setContractForm(prev => {
            const updatedItems = prev.items.map((item, i) => {
                if (i === index) {
                    const updatedItem = { ...item, [field]: value };
                    const unitPrice = cleanNumber(field === 'unitPrice' ? value : updatedItem.unitPrice);
                    const quantity = cleanNumber(field === 'quantity' ? value : updatedItem.quantity);
                    const totals = calculateItemTotals(quantity, unitPrice, item.vatRate || 0.1);
                    return { ...updatedItem, unitPrice, quantity, ...totals };
                }
                return item;
            });
            return { ...prev, items: updatedItems };
        });
    };

    const handleSubmit = async () => {
        if (!contractForm.name || !contractForm.company_name) { Swal.fire('필수 입력', '계약명과 고객사는 필수 항목입니다.', 'warning'); return; }
        if (!contractForm.main_contract) { Swal.fire('필수 입력', '계약 담당자를 선택해주세요.', 'warning'); return; }

        const calculatedTotal = getTotalContractAmountReg;
        const finalAmount = calculatedTotal > 0 ? calculatedTotal : cleanNumber(contractForm.amount);

        const payload = {
            ...contractForm,
            amount: finalAmount,
            items: contractForm.items.map(item => ({
                name: item.name, vendorName: item.vendorName, quantity: cleanNumber(item.quantity), unitPrice: cleanNumber(item.unitPrice), vatRate: Number(item.vatRate)
            }))
        };

        try {
            await axios.post(API_CONTRACT_URL, payload);
            await fetchContractsOnly();
            setIsRegOpen(false);
            setContractForm(initialContractForm);
            Swal.fire({ icon: 'success', title: '등록 완료', text: '신규 계약이 등록되었습니다.', timer: 1500, showConfirmButton: false });
        } catch (error) {
            console.error("계약 등록 실패:", error); Swal.fire('오류', '계약 등록에 실패했습니다.', 'error');
        }
    };

    const handleSelectedFormChange = (e) => {
        const { name, value } = e.target;
        if (!selectedContractForm) return;
        setSelectedContractForm(prev => {
            if (!prev) return null;
            if (name === 'amount') {
                const rawValue = value.replace(/[^0-9]/g, ''); return { ...prev, amount: rawValue };
            } else {
                const newState = { ...prev, [name]: value };
                if (name === 'company_name') newState.main_contract = '';
                if (name === 'sub_contractor') newState.sub_contract = '';
                return newState;
            }
        });
    };
    const handleSelectedContractDateChange = (date) => { setSelectedContractForm(prev => ({ ...prev, contract_date: date ? formatDateToString(date) : '' })); };
    const handleRemoveSelectedItem = (index) => { setSelectedContractForm(prev => { if (!prev) return null; return { ...prev, items: prev.items.filter((_, i) => i !== index) }; }); };
    const handleSelectedItemTableChange = (index, field, rawValue) => {
        const value = field === 'name' || field === 'vendorName' ? rawValue : rawValue.replace(/[^0-9.]/g, '');
        setSelectedContractForm(prev => {
            if (!prev) return null;
            const updatedItems = prev.items.map((item, i) => {
                if (i === index) {
                    const updatedItem = { ...item, [field]: value };
                    const unitPrice = cleanNumber(field === 'unitPrice' ? value : updatedItem.unitPrice);
                    const quantity = cleanNumber(field === 'quantity' ? value : updatedItem.quantity);
                    const totals = calculateItemTotals(quantity, unitPrice, item.vatRate || 0.1);
                    return { ...updatedItem, unitPrice, quantity, ...totals };
                }
                return item;
            });
            return { ...prev, items: updatedItems };
        });
    };
    const handleAddSelectedItem = () => {
        if (!newItem.name || !cleanNumber(newItem.quantity) || !cleanNumber(newItem.unitPrice)) { Swal.fire('입력 오류', '품목, 수량, 단가를 확인해주세요.', 'warning'); return; }
        const totals = calculateItemTotals(newItem.quantity, newItem.unitPrice, newItem.vatRate);
        setSelectedContractForm(prev => {
            if (!prev) return null;
            return {
                ...prev, items: [...prev.items, {
                    ...newItem, unitPrice: cleanNumber(newItem.unitPrice), quantity: cleanNumber(newItem.quantity),
                    vendorName: newItem.vendorName || prev.main_contractor || '',
                    supplyValue: totals.totalSupplyValue, vatAmount: totals.vatAmount, totalAmount: totals.totalAmount, vatRate: newItem.vatRate || 0.1
                }]
            };
        });
        setNewItem(prev => ({ ...prev, name: '', quantity: '1', unitPrice: '' }));
    };

    const handleUpdate = async () => {
        if (!selectedContractForm.name || !selectedContractForm.company_name) { Swal.fire('필수 입력', '계약명과 고객사는 필수 항목입니다.', 'warning'); return; }
        if (!selectedContractForm.main_contract) { Swal.fire('필수 입력', '계약 담당자를 선택해주세요.', 'warning'); return; }

        const result = await Swal.fire({ title: '수정하시겠습니까?', icon: 'question', showCancelButton: true, confirmButtonText: '수정', cancelButtonText: '취소' });

        if (result.isConfirmed) {
            const calculatedTotal = getTotalContractAmountSelected;
            const finalAmount = calculatedTotal > 0 ? calculatedTotal : cleanNumber(selectedContractForm.amount);

            const updatedContract = {
                ...selectedContractForm,
                amount: finalAmount,
                items: selectedContractForm.items.map(item => ({
                    name: item.name, vendorName: item.vendorName, quantity: cleanNumber(item.quantity), unitPrice: cleanNumber(item.unitPrice), vatRate: Number(item.vatRate)
                }))
            };

            try {
                await axios.put(`${API_CONTRACT_URL}/${updatedContract.id}`, updatedContract);
                await fetchContractsOnly();
                setSelectedContract(null);
                Swal.fire({ icon: 'success', title: '수정 완료', text: '계약 정보가 수정되었습니다.', timer: 1500, showConfirmButton: false });
            } catch (error) {
                console.error("계약 수정 실패:", error); Swal.fire('오류', '계약 수정에 실패했습니다.', 'error');
            }
        }
    };
    const handleDelete = async () => {
        const result = await Swal.fire({ title: '계약을 삭제하시겠습니까?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: '삭제', cancelButtonText: '취소' });
        if (result.isConfirmed) {
            try {
                await axios.delete(`${API_CONTRACT_URL}/${selectedContract.id}`);
                await fetchContractsOnly();
                setSelectedContract(null);
                Swal.fire({ icon: 'success', title: '삭제 완료', text: '계약이 삭제되었습니다.', timer: 1500, showConfirmButton: false });
            } catch (error) {
                console.error("계약 삭제 실패:", error); Swal.fire('오류', '계약 삭제에 실패했습니다.', 'error');
            }
        }
    };

    const renderCompanyDropdown = (name, value, onChange) => (
        <div className="relative">
            <select name={name} value={value || ''} onChange={onChange} className={`${inputStyle} appearance-none pr-8`}>
                <option value="">업체 선택</option>
                {companyList.map(comp => (<option key={comp.id} value={comp.name}>{comp.name}</option>))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500"><ChevronDownIcon /></div>
        </div>
    );

    const renderUniquePartnerDropdown = (name, value, onChange, placeholder = "업체 선택") => {
        const uniqueNames = [...new Set(partnerList.map(p => p.name))];
        return (
            <div className="relative">
                <select name={name} value={value || ''} onChange={onChange} className={`${inputStyle} appearance-none pr-8`}>
                    <option value="">{placeholder}</option>
                    {uniqueNames.map(partnerName => (<option key={partnerName} value={partnerName}>{partnerName}</option>))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500"><ChevronDownIcon /></div>
            </div>
        );
    };

    const renderSubManagerDropdown = (companyName, value, onChange) => {
        const managers = partnerList.filter(p => p.name === companyName);
        return (
            <div className="relative">
                <select name="sub_contract" value={value || ''} onChange={onChange} className={`${inputStyle} appearance-none pr-8`} disabled={!companyName}>
                    <option value="">{companyName ? '담당자 선택' : '업체 선행 선택'}</option>
                    {managers.map(partner => (<option key={partner.id} value={partner.rep}>{partner.rep} {partner.position ? `(${partner.position})` : ''}</option>))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500"><ChevronDownIcon /></div>
            </div>
        );
    };

    const renderManagerDropdown = (companyName, value, onChange, nameStr = 'main_contract') => {
        const filteredCustomers = customerList.filter(c => c.company === companyName);
        return (
            <div className="relative">
                <select name={nameStr} value={value || ''} onChange={onChange} className={`${inputStyle} appearance-none pr-8`} disabled={!companyName} required>
                    <option value="">{companyName ? '담당자 선택' : '고객사 선행 선택'}</option>
                    {filteredCustomers.map(customer => (<option key={customer.id} value={customer.name}>{customer.name} {customer.position ? `(${customer.position})` : ''}</option>))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500"><ChevronDownIcon /></div>
            </div>
        );
    };

    const renderItemManagement = ({ isUpdateMode = false }) => {
        const currentForm = isUpdateMode ? selectedContractForm : contractForm;
        const grandTotals = isUpdateMode ? getGrandTotalsSelected : getGrandTotalsReg;
        const handleTableChange = isUpdateMode ? handleSelectedItemTableChange : handleItemTableChange;
        const handleRemove = isUpdateMode ? handleRemoveSelectedItem : handleRemoveItem;
        const handleAdd = isUpdateMode ? handleAddSelectedItem : handleAddItem;

        if (!currentForm) return null;
        const items = currentForm.items || [];
        const gradientStyle = { backgroundSize: '200% 200%', animation: 'moveGradient 3s ease infinite', };

        return (
            <div className="space-y-4">
                <div className="transition-all">
                    {!isItemInputOpen ? (
                        <div className="relative group w-full">
                            <div className="absolute -inset-[2px] rounded-xl bg-gradient-to-r from-red-500 via-purple-500 to-pink-500 opacity-60 blur-[2px] transition duration-1000 group-hover:opacity-100 group-hover:duration-200" style={gradientStyle}></div>
                            <button onClick={() => setIsItemInputOpen(true)} className="relative w-full py-4 flex items-center justify-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-800 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-all z-10"><PlusIcon /> 신규 품목 추가하기</button>
                        </div>
                    ) : (
                        <div className="bg-blue-50/50 dark:bg-slate-900/50 rounded-xl border border-blue-100 dark:border-slate-700 overflow-hidden shadow-sm p-4 space-y-3">
                            <div className="flex justify-between items-center mb-2"><h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">신규 품목 입력</h4><button onClick={() => setIsItemInputOpen(false)} className="text-gray-400 hover:text-gray-600"><ChevronUpIcon/></button></div>
                            <div className="grid grid-cols-2 gap-3">
                                <input name="name" value={newItem.name} onChange={handleItemInputChange} className={inputStyle} placeholder="품목 이름 (예: 고급형 웹사이트)"/>
                                <input name="vendorName" value={newItem.vendorName} onChange={handleItemInputChange} className={inputStyle} placeholder="매입/매출처 (선택)"/>
                            </div>
                            <div className="grid grid-cols-4 gap-3">
                                <div className="col-span-1"><label className={labelStyle}>단가</label><input name="unitPrice" value={formatNumber(newItem.unitPrice)} onChange={handleItemInputChange} placeholder="0" inputMode="numeric" className={`${inputStyle} text-right`}/></div>
                                <div className="col-span-1"><label className={labelStyle}>수량</label>
                                    <div className="relative flex items-center"><input name="quantity" value={formatNumber(newItem.quantity)} onChange={handleItemInputChange} placeholder="1" inputMode="numeric" className={`${inputStyle} pr-12 text-right`}/>
                                        <div className="absolute right-0 top-0 h-full flex flex-col border-l dark:border-slate-600 w-8">
                                            <button type="button" onClick={() => handleNewItemQtyChange(1)} className="h-1/2 w-full flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 border-b dark:border-slate-600 rounded-tr-lg"><ChevronUpIcon className="w-3 h-3"/></button>
                                            <button type="button" onClick={() => handleNewItemQtyChange(-1)} className="h-1/2 w-full flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-br-lg"><ChevronDownIcon className="w-3 h-3"/></button>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-span-1"><label className={labelStyle}>VAT(%)</label><input name="vatRate" value={formatNumber(newItem.vatRate * 100)} onChange={handleItemInputChange} placeholder="10" inputMode="numeric" className={`${inputStyle} text-right`}/></div>
                                <div className="col-span-1"><label className={labelStyle}>예상 합계</label><input value={formatNumber(calculateItemTotals(newItem.quantity, newItem.unitPrice, newItem.vatRate).totalAmount)} readOnly className={`${inputStyle} bg-white dark:bg-slate-700 text-right font-bold text-blue-600`}/></div>
                            </div>
                            <div className="flex justify-center items-center gap-4 mt-4 pt-4 border-t border-blue-100 dark:border-slate-700">
                                <button onClick={() => setIsItemInputOpen(false)} className="relative px-6 py-2 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 hover:text-gray-900 border border-gray-300 dark:border-slate-600 rounded-md text-xs font-bold shadow-sm transition-all z-10 w-24">닫기</button>
                                <button onClick={handleAdd} className="relative px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 transition-all z-10 w-24"><PlusIcon/> 추가</button>
                            </div>
                        </div>
                    )}
                </div>
                <div className="overflow-x-auto border border-gray-200 dark:border-slate-700 rounded-lg">
                    <table className="w-full text-sm">
                        <thead className="text-xs uppercase bg-gray-100 dark:bg-slate-700/50 text-gray-600 dark:text-gray-300">
                        <tr>
                            <th className="px-4 py-2 text-left">품목명</th>
                            <th className="px-4 py-2 text-right whitespace-nowrap">단가</th>
                            <th className="px-4 py-2 text-right whitespace-nowrap">수량</th>
                            <th className="px-4 py-2 text-right whitespace-nowrap">공급가액</th>
                            <th className="px-4 py-2 text-right whitespace-nowrap">부가세</th>
                            <th className="px-4 py-2 text-right whitespace-nowrap">합계</th>
                            <th className="px-4 py-2 text-left whitespace-nowrap">비고</th>
                            <th className="px-4 py-2 text-center whitespace-nowrap w-14">삭제</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-700 bg-white dark:bg-slate-800">
                        {items.length > 0 ? (
                            items.map((item, index) => (
                                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="px-4 py-2 font-medium"><input type="text" value={item.name} onChange={(e) => handleTableChange(index, 'name', e.target.value)} className="w-full bg-transparent border-none focus:ring-0 p-0 m-0 placeholder-gray-400" placeholder="품목명"/></td>
                                    <td className="px-4 py-2 text-right"><input type="text" value={formatNumber(item.unitPrice)} onChange={(e) => handleTableChange(index, 'unitPrice', e.target.value)} className="w-full text-right bg-transparent border-none focus:ring-0 p-0 m-0" inputMode="numeric"/></td>
                                    <td className="px-4 py-2 text-right"><input type="text" value={formatNumber(item.quantity)} onChange={(e) => handleTableChange(index, 'quantity', e.target.value)} className="w-full text-right bg-transparent border-none focus:ring-0 p-0 m-0" inputMode="numeric"/></td>
                                    <td className="px-4 py-2 text-right text-gray-600">{formatNumber(item.supplyValue)}</td>
                                    <td className="px-4 py-2 text-right text-orange-600 font-medium dark:text-orange-500">{formatNumber(item.vatAmount)}</td>
                                    <td className="px-4 py-2 text-right font-bold text-blue-600 dark:text-blue-400">{formatNumber(item.totalAmount)}</td>
                                    <td className="px-4 py-2 text-left"><input type="text" value={item.vendorName || ''} onChange={(e) => handleTableChange(index, 'vendorName', e.target.value)} className="w-full bg-transparent border-none focus:ring-0 p-0 m-0 text-gray-500" placeholder="-"/></td>
                                    <td className="px-4 py-2 text-center"><button onClick={() => handleRemove(index)} className="text-gray-400 hover:text-red-500 transition-colors"><XIcon className="w-4 h-4 inline" /></button></td>
                                </tr>
                            ))) : (
                            <tr><td colSpan="8" className="text-center py-10 text-gray-400"><div className="flex flex-col items-center gap-2"><span>등록된 품목이 없습니다!</span></div></td></tr>
                        )}
                        </tbody>
                        <tfoot className="bg-gray-50 dark:bg-slate-700/30 border-t-2 border-gray-200 dark:border-slate-600 font-bold">
                        <tr>
                            <td className="px-4 py-3 text-left">총 계</td>
                            <td colSpan="2"></td>
                            <td className="px-4 py-3 text-right">{formatNumber(grandTotals.totalSupplyValue)}</td>
                            <td className="px-4 py-3 text-right text-gray-500">{formatNumber(grandTotals.totalVatAmount)}</td>
                            <td className="px-4 py-3 text-right text-lg text-blue-600 dark:text-blue-400">{formatNumber(grandTotals.totalAmount)}</td>
                            <td colSpan="2"></td>
                        </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        );
    };

    const inputStyle = "w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-colors text-sm";
    const labelStyle = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

    const modalContentStyle = "fixed left-[50%] top-[55%] translate-y-[-50%] max-h-[85vh] w-[90vw] max-w-[1200px] translate-x-[-50%] rounded-xl bg-white dark:bg-slate-800 shadow-2xl focus:outline-none z-50 border border-gray-200 dark:border-slate-700 transition-colors flex flex-col overflow-hidden";
    const fixedModalWidth = 'max-w-[800px]';
    const gradientStyle = { backgroundSize: '200% 200%', animation: 'moveGradient 3s ease infinite', };

    return (
        <Tooltip.Provider delayDuration={300}>
            <style>{`
                .swal2-container { z-index: 99999 !important; pointer-events: auto !important; }
                .rdp { --rdp-cell-size: 40px; --rdp-accent-color: #2563eb; --rdp-background-color: #eff6ff; }
                .dark .rdp { --rdp-background-color: #1e293b; color: #f1f5f9; }
                .rdp-day_selected:not([disabled]) { background-color: #2563eb; color: white; }
                .rdp-day_selected:hover:not([disabled]) { background-color: #1d4ed8; }
                .react-datepicker-wrapper { width: 100%; }
                .react-datepicker__input-container input { width: 100%; border: 1px solid #d1d5db; border-radius: 0.5rem; padding: 0.5rem 0.75rem; outline: none; font-size: 0.875rem; }
                .dark .react-datepicker__input-container input { background-color: #0f172a; border-color: #475569; color: #f3f4f6; }
                @keyframes moveGradient { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
                
                /* [추가됨] 스크롤바 숨김 처리 */
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>

            <div
                className="p-6 max-w-7xl mx-auto min-h-screen text-gray-900 dark:text-gray-100 transition-colors duration-300">
                <div className="relative flex items-center justify-center mb-8 h-12">
                    <div className="relative w-full max-w-md group z-0 h-11">
                        <div className="absolute -inset-[2px] rounded-lg bg-gradient-to-r
                                from-violet-500
                                via-stone-500
                                to-pink-500 opacity-70 blur-sm transition duration-1000 group-hover:opacity-100 group-hover:duration-200"
                             style={gradientStyle}></div>
                        <div
                            className="relative flex items-center bg-white dark:bg-slate-800 rounded-lg p-[1px] h-full">
                            <svg className="absolute left-3 w-5 h-5 text-gray-400 pointer-events-none" fill="none"
                                 stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                            </svg>
                            <input type="text"
                                   className="w-full pl-10 pr-4 h-full bg-transparent border-transparent rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-0 relative z-10"
                                   placeholder="계약명 또는 고객사 검색" value={searchTerm}
                                   onChange={(e) => setSearchTerm(e.target.value)}/>
                        </div>
                    </div>
                    <div className="absolute right-0 flex-shrink-0">
                        <button onClick={() => setIsRegOpen(true)}
                                className="h-11 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors shadow-sm text-sm font-medium whitespace-nowrap">
                            <PlusIcon/> <span>계약 등록</span></button>
                    </div>
                </div>

                <div
                    className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 overflow-x-auto transition-colors duration-300">
                    <table className="w-full text-left border-collapse table-fixed min-w-[1000px]">
                        <thead
                            className="bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-200">
                        <tr>
                            <th className="px-6 py-4 text-sm font-semibold w-[22%] whitespace-nowrap">계약명</th>
                            <th className="px-6 py-4 text-sm font-semibold w-[12%] whitespace-nowrap">고객사</th>
                            <th className="px-6 py-4 text-sm font-semibold w-[10%] whitespace-nowrap">담당자</th>
                            <th className="px-6 py-4 text-sm font-semibold w-[18%] whitespace-nowrap">사업기간</th>
                            <th className="px-6 py-4 text-sm font-semibold w-[14%] whitespace-nowrap">계약금액</th>
                            <th className="px-6 py-4 text-sm font-semibold w-[8%] whitespace-nowrap">진행여부</th>
                            <th className="px-6 py-4 text-sm font-semibold w-[10%] whitespace-nowrap">계약일자</th>
                            <th className="px-6 py-4 text-sm font-semibold text-center w-[6%] whitespace-nowrap">관리</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                        {isLoading ? (
                            <TableLoader colSpan={8}/>
                        ) : filteredContracts.length === 0 ? (
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
                                            <p className="text-sm text-gray-400 mt-1">새로운 계약을 등록하거나 검색어를 변경해보세요.</p>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredContracts.map(contract => (
                                <tr key={contract.id}
                                    className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                                    onClick={() => setSelectedContract(contract)}>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="p-1.5 bg-blue-50 dark:bg-slate-700/50 rounded-full text-blue-600 dark:text-blue-400 flex-shrink-0">
                                                <DocumentIcon/></div>
                                            <div className="truncate min-w-0 block"
                                                 title={contract.name}>{contract.name}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-blue-600 dark:text-blue-400 font-medium truncate"
                                        title={contract.company_name}>{contract.company_name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 truncate">{contract.main_contract}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">{formatDisplayDate(contract.start_date)} ~ {formatDisplayDate(contract.end_date)}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 font-medium whitespace-nowrap">{formatNumber(contract.amount)} 원</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`px-2 py-1 text-xs font-semibold rounded-full ${contract.status === '진행중' ? 'bg-yellow-100 text-yellow-800' : contract.status === '진행완료' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                            {contract.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">{formatDisplayDate(contract.contract_date)}</td>
                                    <td className="px-6 py-4 text-center whitespace-nowrap">
                                        <button onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedContract(contract);
                                        }}
                                                className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-slate-700 transition-colors rounded-lg hover:bg-gray-100">
                                            <SettingsIcon className="w-5 h-5"/></button>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>

                {/* 등록 모달 */}
                <Dialog.Root open={isRegOpen} onOpenChange={(newOpenState) => {
                    setIsRegOpen(newOpenState);
                    if (newOpenState === false) setIsItemsExpanded(false);
                }}>
                    <Dialog.Portal>
                        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"/>
                        <Dialog.Content className={`${modalContentStyle} ${fixedModalWidth}`} onPointerDownOutside={(e) => e.preventDefault()}>
                            <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex-shrink-0">
                                <Dialog.Title className="text-xl font-bold text-gray-800 dark:text-gray-100">{isItemsExpanded ? '계약 품목 상세 관리' : '신규 계약 등록'}</Dialog.Title>
                                <Dialog.Close asChild>
                                    <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><XIcon/></button>
                                </Dialog.Close>
                            </div>

                            <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-hide">
                                {!isItemsExpanded && (
                                    <div className="space-y-4 transition-opacity duration-500 ease-in-out">
                                        <div className="grid grid-cols-3 gap-4">
                                            <div><label className={labelStyle}>구분<RequiredStar/></label><select
                                                name="category" value={contractForm.category}
                                                onChange={handleFormChange}
                                                className={`${inputStyle} appearance-none pr-8`}>
                                                <option value="조달계약">조달계약</option>
                                                <option value="수의계약">수의계약</option>
                                                <option value="유지보수">유지보수</option>
                                            </select></div>
                                            <div><label className={labelStyle}>진행 여부<RequiredStar/></label><select
                                                name="status" value={contractForm.status} onChange={handleFormChange}
                                                className={`${inputStyle} appearance-none pr-8`}>
                                                <option value="예정">예정</option>
                                                <option value="진행중">진행중</option>
                                                <option value="진행완료">진행완료</option>
                                            </select></div>
                                            <div className="col-span-1"><label className={labelStyle}>계약
                                                금액<RequiredStar/>{getTotalContractAmountReg > 0 && (<span
                                                    className="text-blue-600 dark:text-blue-400 ml-2 text-xs font-normal">(상세품목 총액: {formatNumber(getTotalContractAmountReg)}원)</span>)}
                                            </label><input type="text" name="amount"
                                                           value={formatNumber(contractForm.amount)}
                                                           onChange={handleFormChange} className={inputStyle}
                                                           placeholder="예상 금액" inputMode="numeric"/></div>
                                            <div className="col-span-3"><label className={labelStyle}>계약명<RequiredStar/><span
                                                className="text-xs font-normal text-gray-400 ml-2">({(contractForm.name || '').length}/50자)</span></label><input
                                                name="name" value={contractForm.name} onChange={handleFormChange}
                                                className={inputStyle} placeholder="사업명 (최대 50자)" maxLength={50}/></div>
                                            <div className="col-span-1"><label className={labelStyle}>고객사<RequiredStar/></label>{renderCompanyDropdown('company_name', contractForm.company_name, handleFormChange)}
                                            </div>
                                            <div className="col-span-1"><label className={labelStyle}>계약
                                                담당자<RequiredStar/></label>{renderManagerDropdown(contractForm.company_name, contractForm.main_contract, handleFormChange, 'main_contract')}
                                            </div>
                                            <div className="col-span-1">
                                                <label className={labelStyle}>주 계약업체 (파트너사)<RequiredStar/></label>
                                                {renderUniquePartnerDropdown('main_contractor', contractForm.main_contractor, handleFormChange, '파트너사 선택')}
                                            </div>
                                            <div className="col-span-1"><label className={labelStyle}>계약
                                                일자<RequiredStar/></label>
                                                <div className="relative"><DatePicker
                                                    selected={contractForm.contract_date ? new Date(contractForm.contract_date) : null}
                                                    onChange={handleContractDateChange} dateFormat="yyyy-MM-dd"
                                                    locale={ko} placeholderText="날짜 선택" className={inputStyle}/></div>
                                            </div>
                                            <div className="col-span-2"><label className={labelStyle}>사업기간 (시작일 ~
                                                종료일)<RequiredStar/></label><BusinessPeriodPicker
                                                startDate={contractForm.start_date} endDate={contractForm.end_date}
                                                onApply={handlePeriodApply} className={inputStyle}/></div>
                                            <div className="col-span-2">
                                                <label className={labelStyle}>하도급 업체</label>
                                                {renderUniquePartnerDropdown('sub_contractor', contractForm.sub_contractor, handleFormChange, '하도급 업체 선택')}
                                            </div>
                                            <div className="col-span-1">
                                                <label className={labelStyle}>하도급 담당자</label>
                                                {renderSubManagerDropdown(contractForm.sub_contractor, contractForm.sub_contract, handleFormChange)}
                                            </div>
                                        </div>
                                        <div onClick={() => setIsItemsExpanded(true)}
                                             className="mt-6 flex justify-between items-center cursor-pointer border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/70 p-3 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-slate-700 shadow-sm">
                                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">계약 품목 목록
                                                ({contractForm.items.length}건)</h3>
                                            <div
                                                className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">상세
                                                관리<ChevronDownIcon className="w-5 h-5 rotate-270"/></div>
                                        </div>
                                    </div>
                                )}
                                {isItemsExpanded && renderItemManagement({isUpdateMode: false})}
                            </div>

                            <div className="p-5 border-t border-gray-200 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-800 flex-shrink-0">
                                {isItemsExpanded ? (
                                    <>
                                        <div></div>
                                        <div className="flex gap-2">
                                            <button onClick={() => {
                                                setIsItemsExpanded(false);
                                                setIsItemInputOpen(false);
                                            }}
                                                    className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-white hover:border-gray-300 border border-transparent rounded-lg transition-all text-sm">기본
                                                정보로 돌아가기
                                            </button>
                                            <button onClick={handleSubmit}
                                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg">계약 등록
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <><Dialog.Close asChild>
                                        <button
                                            className="px-5 py-2 rounded-lg bg-gradient-to-r from-red-500 via-red-600 to-pink-600 text-white hover:opacity-90 hover:shadow-md transition-all font-bold text-sm shadow-sm">취소
                                        </button>
                                    </Dialog.Close>
                                        <button onClick={handleSubmit}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg">계약 등록
                                        </button>
                                    </>
                                )}
                            </div>
                        </Dialog.Content>
                    </Dialog.Portal>
                </Dialog.Root>

                {/* 수정 모달 */}
                <Dialog.Root open={!!selectedContract} onOpenChange={setSelectedContract}>
                    <Dialog.Portal>
                        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"/>
                        <Dialog.Content className={`${modalContentStyle} ${fixedModalWidth}`} onPointerDownOutside={(e) => e.preventDefault()}>
                            <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex-shrink-0">
                                <Dialog.Title
                                    className="text-xl font-bold text-gray-800 dark:text-gray-100">{isItemsExpanded ? '품목 수정/관리' : `${selectedContractForm?.name || '계약 상세/수정'}`}</Dialog.Title>
                                <Dialog.Close asChild>
                                    <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                        <XIcon/></button>
                                </Dialog.Close>
                            </div>

                            <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-hide">
                                {selectedContractForm && (
                                    <div className="space-y-4">
                                        {!isItemsExpanded && (
                                            <div className="space-y-4">
                                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">계약
                                                    기본정보 관리 </h3>
                                                <div className="grid grid-cols-3 gap-4 text-sm">
                                                    <div><label className={labelStyle}>구분<RequiredStar/></label><select
                                                        name="category" value={selectedContractForm.category}
                                                        onChange={handleSelectedFormChange}
                                                        className={`${inputStyle} appearance-none pr-8`}>
                                                        <option value="조달계약">조달계약</option>
                                                        <option value="수의계약">수의계약</option>
                                                    </select></div>
                                                    <div><label className={labelStyle}>진행
                                                        여부<RequiredStar/></label><select name="status"
                                                                                         value={selectedContractForm.status}
                                                                                         onChange={handleSelectedFormChange}
                                                                                         className={`${inputStyle} appearance-none pr-8`}>
                                                        <option value="예정">예정</option>
                                                        <option value="진행중">진행중</option>
                                                        <option value="진행완료">진행완료</option>
                                                    </select></div>
                                                    <div><label className={labelStyle}>계약
                                                        금액<RequiredStar/>{getTotalContractAmountSelected > 0 && (<span
                                                            className="text-blue-600 dark:text-blue-400 ml-2 text-xs font-normal">(상세품목 총액: {formatNumber(getTotalContractAmountSelected)}원)</span>)}
                                                    </label><input type="text" name="amount"
                                                                   value={formatNumber(selectedContractForm.amount)}
                                                                   onChange={handleSelectedFormChange}
                                                                   className={inputStyle} placeholder="금액"
                                                                   inputMode="numeric"/></div>
                                                    <div className="col-span-3"><label
                                                        className={labelStyle}>계약명<RequiredStar/><span
                                                        className="text-xs font-normal text-gray-400 ml-2">({(selectedContractForm.name || '').length}/50자)</span></label><input
                                                        name="name" value={selectedContractForm.name}
                                                        onChange={handleSelectedFormChange} className={inputStyle}
                                                        placeholder="사업명 (최대 50자)" maxLength={50}/></div>
                                                    <div><label
                                                        className={labelStyle}>고객사<RequiredStar/></label>{renderCompanyDropdown('company_name', selectedContractForm.company_name, handleSelectedFormChange)}
                                                    </div>
                                                    <div><label
                                                        className={labelStyle}>담당자<RequiredStar/></label>{renderManagerDropdown(selectedContractForm.company_name, selectedContractForm.main_contract, handleSelectedFormChange, 'main_contract')}
                                                    </div>
                                                    <div>
                                                        <label className={labelStyle}>주 계약업체<RequiredStar/></label>
                                                        {renderUniquePartnerDropdown('main_contractor', selectedContractForm.main_contractor, handleSelectedFormChange, '파트너사 선택')}
                                                    </div>
                                                    <div className="col-span-1"><label className={labelStyle}>계약
                                                        일자<RequiredStar/></label>
                                                        <div className="relative"><DatePicker
                                                            selected={selectedContractForm.contract_date ? new Date(selectedContractForm.contract_date) : null}
                                                            onChange={handleSelectedContractDateChange}
                                                            dateFormat="yyyy-MM-dd" locale={ko} className={inputStyle}/>
                                                        </div>
                                                    </div>
                                                    <div className="col-span-2"><label className={labelStyle}>사업 기간 (시작일
                                                        ~ 종료일)<RequiredStar/></label><BusinessPeriodPicker
                                                        startDate={selectedContractForm.start_date}
                                                        endDate={selectedContractForm.end_date}
                                                        onApply={handleSelectedPeriodApply} className={inputStyle}/>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <label className={labelStyle}>하도급 업체</label>
                                                        {renderUniquePartnerDropdown('sub_contractor', selectedContractForm.sub_contractor, handleSelectedFormChange, '하도급 업체 선택')}
                                                    </div>
                                                    <div>
                                                        <label className={labelStyle}>하도급 담당자</label>
                                                        {renderSubManagerDropdown(selectedContractForm.sub_contractor, selectedContractForm.sub_contract, handleSelectedFormChange)}
                                                    </div>
                                                </div>
                                                <div onClick={() => setIsItemsExpanded(true)}
                                                     className="mt-6 flex justify-between items-center cursor-pointer border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/70 p-3 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-slate-700 shadow-sm">
                                                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">계약
                                                        품목 목록 ({selectedContractForm.items?.length || 0}건)</h3>
                                                    <div
                                                        className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">상세
                                                        관리/수정<ChevronDownIcon className="w-5 h-5 rotate-270"/></div>
                                                </div>
                                            </div>
                                        )}
                                        {isItemsExpanded && renderItemManagement({isUpdateMode: true})}
                                    </div>
                                )}
                            </div>

                            {/* 푸터: 여백 축소(p-5) */}
                            <div className="p-5 border-t border-gray-200 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-800 flex-shrink-0">
                                {isItemsExpanded ? (
                                    <>
                                        <div></div>
                                        <div className="flex gap-2">
                                            <button onClick={() => {
                                                setIsItemsExpanded(false);
                                                setIsItemInputOpen(false);
                                            }}
                                                    className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-white hover:border-gray-300 border border-transparent rounded-lg transition-all text-sm">뒤로
                                                가기
                                            </button>
                                            <button onClick={handleUpdate}
                                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm text-sm font-bold">저장
                                                하기
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={handleDelete}
                                                className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg flex items-center gap-1 transition-colors text-sm font-bold">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor"
                                                 viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                            </svg>
                                            계약 삭제
                                        </button>
                                        <div className="flex gap-2"><Dialog.Close asChild>
                                            <button
                                                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-sm font-medium shadow-sm">닫기
                                            </button>
                                        </Dialog.Close>
                                            <button onClick={handleUpdate}
                                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm text-sm font-bold">수정
                                                완료
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </Dialog.Content>
                    </Dialog.Portal>
                </Dialog.Root>
            </div>
        </Tooltip.Provider>
    );
}