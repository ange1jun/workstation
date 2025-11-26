import React, { useState, useMemo, useEffect, useCallback } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Tooltip from '@radix-ui/react-tooltip';
import Swal from 'sweetalert2';

// --- 아이콘 컴포넌트 ---
const PlusIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>;
const MinusIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path></svg>;
const XIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>;
const SearchIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>;
const SettingsIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.941 3.31.81 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.81 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.941-3.31-.81-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.81-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065zM12 15a3 3 0 110-6 3 3 0 010 6z"></path></svg>;
const ChevronDownIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>;
const ChevronUpIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path></svg>;
const TrashIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>;


// --- 상태 및 상수 ---
const getCurrentDate = () => new Date().toISOString().split('T')[0];

const DUMMY_COMPANIES = [
    { id: 1, name: '네이버', tel: '031-123-4567' },
    { id: 2, name: '카카오', tel: '031-987-6543' },
    { id: 3, name: '대우조선해양', tel: '055-111-2222' },
];

export default function Contracts() {
    const [searchTerm, setSearchTerm] = useState('');
    const [isRegOpen, setIsRegOpen] = useState(false);
    const [selectedContract, setSelectedContract] = useState(null); // 수정할 계약 원본

    const [isItemsExpanded, setIsItemsExpanded] = useState(false);

    // --- 1. 등록 폼 상태 ---
    const initialContractForm = useMemo(() => ({
        category: '조달계약', status: '예정', contractName: '', amount: '',
        customerCompany: '', mainContractor: '', mainContact: '',
        startDate: getCurrentDate(), endDate: getCurrentDate(), contractDate: getCurrentDate(),
        subContractor: '', subContact: '',
        items: [], // { name, quantity, unitPrice, supplyValue, vatAmount, totalAmount, vendorName, vatRate }
    }), []);

    const [contractForm, setContractForm] = useState(initialContractForm);

    // --- 2. 수정 폼 상태 (selectedContract가 변경될 때마다 초기화) ---
    const [selectedContractForm, setSelectedContractForm] = useState(null); // 수정 중인 계약의 임시 상태 (Deep Copy)

    useEffect(() => {
        if (selectedContract) {
            // 수정 모드 진입 시 원본 계약을 Deep Copy하여 임시 상태로 사용
            setSelectedContractForm(JSON.parse(JSON.stringify(selectedContract)));
            // 수정 모달에서는 품목 상세를 기본으로 열어두지 않습니다.
            setIsItemsExpanded(false);
        } else {
            setSelectedContractForm(null);
        }
    }, [selectedContract]);


    const [contractList, setContractList] = useState([
        { id: 1, category: '조달계약', status: '진행중', contractName: '2025 ERP 시스템 구축', amount: 50000000, customerCompany: '네이버', mainContractor: 'ABC솔루션', mainContact: '김철수', startDate: '2025-08-01', endDate: '2026-07-31', contractDate: '2025-08-01', subContractor: '', subContact: '',
            items: [{ name: 'ERP 라이선스', quantity: 1, unitPrice: 40000000, vatRate: 0.1, supplyValue: 40000000, vatAmount: 4000000, totalAmount: 44000000, vendorName: 'ABC솔루션' }, { name: '컨설팅 용역', quantity: 10, unitPrice: 500000, vatRate: 0.1, supplyValue: 5000000, vatAmount: 500000, totalAmount: 5500000, vendorName: 'ABC솔루션' }]
        },
        { id: 2, category: '수의계약', status: '예정', contractName: '경영지원 컨설팅', amount: 15000000, customerCompany: '카카오', mainContractor: 'XYZ컨설팅', mainContact: '이영희', startDate: '2025-10-20', endDate: '2025-12-31', contractDate: '2025-10-15', subContractor: '', subContact: '',
            items: []
        },
    ]);
    const [newItem, setNewItem] = useState({ name: '', quantity: '1', unitPrice: '', vatRate: 0.1, vendorName: '' }); // vatRate 10%

    // --- 포맷터 및 계산 헬퍼 ---
    const formatNumber = (num) => {
        if (num === null || num === undefined || num === '') return '';
        // 숫자가 아닌 문자 제거 (소수점은 허용)
        const cleanNum = String(num).replace(/[^\d.]/g, '');
        if (cleanNum === '') return '';

        // 소수점이 포함되어 있다면 toLocaleString으로 포매팅할 수 없습니다.
        // 입력 필드에서는 일단 쉼표를 찍어주고, 계산 시에 Number()로 변환합니다.
        if (cleanNum.includes('.')) {
            // 소수점 이하는 그대로, 정수 부분만 포매팅
            const parts = cleanNum.split('.');
            return Number(parts[0]).toLocaleString('ko-KR') + (parts.length > 1 ? '.' + parts[1] : '');
        }
        return Number(cleanNum).toLocaleString('ko-KR');
    };

    const cleanNumber = (value) => {
        // 숫자, 소수점 외의 모든 문자 제거
        return Number(String(value).replace(/[^\d.]/g, '') || 0);
    }

    // 계산 로직 (등록 폼/수정 폼 모두 사용)
    const calculateItemTotals = useCallback((quantity, unitPrice, vatRate) => {
        const price = cleanNumber(unitPrice);
        const qty = cleanNumber(quantity);
        const rate = Number(vatRate) || 0; // vatRate는 이미 비율 (0.1)

        const supplyValue = price; // 단가 = 공급가액 (단위당)
        const totalSupplyValue = supplyValue * qty;

        const vat = Math.round(totalSupplyValue * rate); // 부가세
        const totalAmount = totalSupplyValue + vat;

        return { totalSupplyValue: totalSupplyValue, vatAmount: vat, totalAmount: totalAmount };
    }, []);

    // 등록 폼 총합 계산
    const getGrandTotalsReg = useMemo(() => {
        return (contractForm.items || []).reduce((totals, item) => ({
            totalQuantity: totals.totalQuantity + cleanNumber(item.quantity),
            totalUnitPrice: totals.totalUnitPrice + cleanNumber(item.unitPrice),
            totalSupplyValue: totals.totalSupplyValue + cleanNumber(item.supplyValue),
            totalVatAmount: totals.totalVatAmount + cleanNumber(item.vatAmount),
            totalAmount: totals.totalAmount + cleanNumber(item.totalAmount)
        }), { totalQuantity: 0, totalUnitPrice: 0, totalSupplyValue: 0, totalVatAmount: 0, totalAmount: 0 });
    }, [contractForm.items]);

    // 수정 폼 총합 계산
    const getGrandTotalsSelected = useMemo(() => {
        if (!selectedContractForm) return { totalQuantity: 0, totalUnitPrice: 0, totalSupplyValue: 0, totalVatAmount: 0, totalAmount: 0 };
        return (selectedContractForm.items || []).reduce((totals, item) => ({
            totalQuantity: totals.totalQuantity + cleanNumber(item.quantity),
            totalUnitPrice: totals.totalUnitPrice + cleanNumber(item.unitPrice),
            totalSupplyValue: totals.totalSupplyValue + cleanNumber(item.supplyValue),
            totalVatAmount: totals.totalVatAmount + cleanNumber(item.vatAmount),
            totalAmount: totals.totalAmount + cleanNumber(item.totalAmount)
        }), { totalQuantity: 0, totalUnitPrice: 0, totalSupplyValue: 0, totalVatAmount: 0, totalAmount: 0 });
    }, [selectedContractForm]);

    // 등록 폼의 최종 계약 금액
    const getTotalContractAmountReg = useMemo(() => getGrandTotalsReg.totalAmount, [getGrandTotalsReg]);
    // 수정 폼의 최종 계약 금액
    const getTotalContractAmountSelected = useMemo(() => getGrandTotalsSelected.totalAmount, [getGrandTotalsSelected]);


    // --- 필터링 ---
    const filteredContracts = contractList.filter(c =>
        c.contractName.includes(searchTerm) || c.customerCompany.includes(searchTerm)
    );

    // ==========================================
    //  핸들러 (등록 모달용)
    // ==========================================

    // 등록 모달: 계약 기본 정보 변경
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        if (name === 'amount') {
            const rawValue = value.replace(/[^0-9]/g, ''); // 숫자만 저장
            setContractForm(prev => ({ ...prev, amount: rawValue }));
        } else {
            setContractForm(prev => ({ ...prev, [name]: value }));
        }
    };

    // 등록 모달: 품목 입력 필드 변경
    const handleItemInputChange = (e) => {
        const { name, value } = e.target;
        const rawValue = (name === 'name' || name === 'vendorName') ? value : value.replace(/[^0-9.]/g, '');

        setNewItem(prev => {
            let nextState = { ...prev };

            if (name === 'vatRate') {
                // VAT율은 100으로 나눈 비율로 저장 (0.1)
                const rate = cleanNumber(rawValue) / 100;
                nextState[name] = rate;
            } else {
                nextState[name] = rawValue;
            }

            // 부가세 재계산 (현재 상태의 최신값 사용)
            if (name === 'unitPrice' || name === 'vatRate' || name === 'quantity') {
                const currentUnitPrice = nextState.unitPrice;
                const currentQuantity = nextState.quantity;
                const currentVatRate = nextState.vatRate;

                const { vatAmount } = calculateItemTotals(currentQuantity, currentUnitPrice, currentVatRate);

                return {
                    ...nextState,
                    vatAmount: vatAmount // 계산된 VAT 금액 업데이트
                };
            }
            return nextState;
        });
    };

    // 등록 모달: 품목 수량 변경 버튼
    const handleNewItemQtyChange = (delta) => {
        const currentQty = cleanNumber(newItem.quantity);
        const newQty = Math.max(1, currentQty + delta);
        setNewItem(prev => ({ ...prev, quantity: String(newQty) }));
    };

    // 등록 모달: 품목 추가
    const handleAddItem = () => {
        if (!newItem.name || !cleanNumber(newItem.quantity) || !cleanNumber(newItem.unitPrice)) {
            Swal.fire('입력 오류', '품목, 수량, 단가를 확인해주세요.', 'warning');
            return;
        }

        const totals = calculateItemTotals(newItem.quantity, newItem.unitPrice, newItem.vatRate);

        setContractForm(prev => ({
            ...prev,
            items: [...prev.items, {
                ...newItem,
                unitPrice: cleanNumber(newItem.unitPrice), // 숫자로 저장
                quantity: cleanNumber(newItem.quantity),
                vendorName: newItem.vendorName || prev.mainContractor || '',
                supplyValue: totals.totalSupplyValue,
                vatAmount: totals.vatAmount,
                totalAmount: totals.totalAmount,
                vatRate: newItem.vatRate || 0.1 // 비율 저장
            }]
        }));

        setNewItem(prev => ({
            ...prev,
            name: '',
            quantity: '1',
            unitPrice: '', // 단가도 비워서 새로운 품목 입력 용이하게
        }));
    };

    // 등록 모달: 품목 제거
    const handleRemoveItem = (index) => {
        setContractForm(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    // 등록 모달: 품목 테이블 내 직접 수정
    const handleItemTableChange = (index, field, rawValue) => {
        const value = field === 'name' || field === 'vendorName' ? rawValue : rawValue.replace(/[^0-9.]/g, '');

        setContractForm(prev => {
            const updatedItems = prev.items.map((item, i) => {
                if (i === index) {
                    const updatedItem = { ...item, [field]: value };

                    const unitPrice = cleanNumber(field === 'unitPrice' ? value : updatedItem.unitPrice);
                    const quantity = cleanNumber(field === 'quantity' ? value : updatedItem.quantity);
                    const vatRate = item.vatRate || 0.1; // 테이블에서는 vatRate 수정 X, 기존 값 사용

                    const totals = calculateItemTotals(quantity, unitPrice, vatRate);

                    return { ...updatedItem,
                        unitPrice: unitPrice, // 숫자로 변환된 값 저장
                        quantity: quantity, // 숫자로 변환된 값 저장
                        supplyValue: totals.totalSupplyValue,
                        vatAmount: totals.vatAmount,
                        totalAmount: totals.totalAmount
                    };
                }
                return item;
            });
            return { ...prev, items: updatedItems };
        });
    };

    // 등록 모달: 최종 등록
    const handleSubmit = () => {
        if (!contractForm.contractName || !contractForm.customerCompany) {
            Swal.fire('필수 입력', '계약명과 고객사는 필수 항목입니다.', 'warning');
            return;
        }

        const finalAmount = getTotalContractAmountReg;

        setContractList([...contractList, { ...contractForm, id: Date.now(), amount: finalAmount }]);
        setIsRegOpen(false);
        setContractForm(initialContractForm); // 폼 초기화
        Swal.fire({ icon: 'success', title: '등록 완료', text: '신규 계약이 등록되었습니다.', timer: 1500, showConfirmButton: false });
    };


    // ==========================================
    //  핸들러 (수정 모달용)
    // ==========================================

    // 수정 모달: 계약 기본 정보 변경
    const handleSelectedFormChange = (e) => {
        const { name, value } = e.target;
        if (!selectedContractForm) return;

        setSelectedContractForm(prev => {
            if (!prev) return null;

            if (name === 'amount') {
                const rawValue = value.replace(/[^0-9]/g, ''); // 숫자만 저장
                return { ...prev, amount: rawValue };
            } else {
                return { ...prev, [name]: value };
            }
        });
    };

    // 수정 모달: 품목 제거
    const handleRemoveSelectedItem = (index) => {
        setSelectedContractForm(prev => {
            if (!prev) return null;
            return {
                ...prev,
                items: prev.items.filter((_, i) => i !== index)
            };
        });
    };

    // 수정 모달: 품목 테이블 내 직접 수정
    const handleSelectedItemTableChange = (index, field, rawValue) => {
        const value = field === 'name' || field === 'vendorName' ? rawValue : rawValue.replace(/[^0-9.]/g, '');

        setSelectedContractForm(prev => {
            if (!prev) return null;

            const updatedItems = prev.items.map((item, i) => {
                if (i === index) {
                    const updatedItem = { ...item, [field]: value };

                    // item.vatRate이 없을 경우 기본값 0.1 사용
                    const unitPrice = cleanNumber(field === 'unitPrice' ? value : updatedItem.unitPrice);
                    const quantity = cleanNumber(field === 'quantity' ? value : updatedItem.quantity);
                    const vatRate = item.vatRate || 0.1;

                    const totals = calculateItemTotals(quantity, unitPrice, vatRate);

                    return { ...updatedItem,
                        unitPrice: unitPrice,
                        quantity: quantity,
                        supplyValue: totals.totalSupplyValue,
                        vatAmount: totals.vatAmount,
                        totalAmount: totals.totalAmount
                    };
                }
                return item;
            });
            return { ...prev, items: updatedItems };
        });
    };

    // 수정 모달: 품목 추가 (등록 모달의 newItem 상태를 재활용하거나 새 상태를 만들어야 함. 여기서는 새로운 입력 상태를 만들지 않고 등록폼의 newItem을 재활용하는 방식으로 단순화)
    const handleAddSelectedItem = () => {
        if (!newItem.name || !cleanNumber(newItem.quantity) || !cleanNumber(newItem.unitPrice)) {
            Swal.fire('입력 오류', '품목, 수량, 단가를 확인해주세요.', 'warning');
            return;
        }

        const totals = calculateItemTotals(newItem.quantity, newItem.unitPrice, newItem.vatRate);

        setSelectedContractForm(prev => {
            if (!prev) return null;
            return {
                ...prev,
                items: [...prev.items, {
                    ...newItem,
                    unitPrice: cleanNumber(newItem.unitPrice),
                    quantity: cleanNumber(newItem.quantity),
                    vendorName: newItem.vendorName || prev.mainContractor || '',
                    supplyValue: totals.totalSupplyValue,
                    vatAmount: totals.vatAmount,
                    totalAmount: totals.totalAmount,
                    vatRate: newItem.vatRate || 0.1
                }]
            };
        });

        setNewItem(prev => ({
            ...prev,
            name: '',
            quantity: '1',
            unitPrice: '',
        }));
    };

    // 수정 모달: 최종 수정
    const handleUpdate = () => {
        if (!selectedContractForm.contractName || !selectedContractForm.customerCompany) {
            Swal.fire('필수 입력', '계약명과 고객사는 필수 항목입니다.', 'warning');
            return;
        }

        Swal.fire({ title: '수정하시겠습니까?', icon: 'question', showCancelButton: true, confirmButtonText: '수정', cancelButtonText: '취소' }).then((res) => {
            if (res.isConfirmed) {
                const updatedContract = {
                    ...selectedContractForm,
                    amount: getTotalContractAmountSelected // 최종 금액을 품목 총합으로 갱신
                };

                setContractList(prev => prev.map(c => c.id === updatedContract.id ? updatedContract : c));
                setSelectedContract(null); // 모달 닫기
                Swal.fire({ icon: 'success', title: '수정 완료', text: '계약 정보가 수정되었습니다.', timer: 1500, showConfirmButton: false });
            }
        });
    };

    // 수정 모달: 삭제
    const handleDelete = () => {
        Swal.fire({
            title: '계약을 삭제하시겠습니까?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: '삭제',
            cancelButtonText: '취소'
        }).then((res) => {
            if (res.isConfirmed) {
                setContractList(prev => prev.filter(c => c.id !== selectedContract.id));
                setSelectedContract(null); // 모달 닫기
                Swal.fire({ icon: 'success', title: '삭제 완료', text: '계약이 삭제되었습니다.', timer: 1500, showConfirmButton: false });
            }
        });
    };


    // --- 렌더링 헬퍼 ---
    const renderDropdown = (name, value, onChange) => (
        <div className="relative">
            <select name={name} value={value} onChange={onChange} className={`${inputStyle} appearance-none pr-8`}>
                <option value="">고객사/업체 선택</option>
                {DUMMY_COMPANIES.map(comp => (
                    <option key={comp.id} value={comp.name}>{comp.name}</option>
                ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500">
                <ChevronDownIcon />
            </div>
        </div>
    );

    // 품목 상세 관리 UI (등록/수정 모달에서 재사용 가능하도록 함수로 분리)
    const renderItemManagement = ({ isUpdateMode = false }) => {
        const currentForm = isUpdateMode ? selectedContractForm : contractForm;
        const grandTotals = isUpdateMode ? getGrandTotalsSelected : getGrandTotalsReg;

        // 수정 모드에서는 등록 폼의 handleItemInputChange/handleAddItem 대신 수정 폼 핸들러 사용
        const handleTableChange = isUpdateMode ? handleSelectedItemTableChange : handleItemTableChange;
        const handleRemove = isUpdateMode ? handleRemoveSelectedItem : handleRemoveItem;
        const handleAdd = isUpdateMode ? handleAddSelectedItem : handleAddItem;

        if (!currentForm) return null;

        return (
            <div className="space-y-4">

                {/* 2.1. 품목 추가 폼 */}
                <div className="border p-3 rounded-lg bg-gray-50 dark:bg-slate-900/50 space-y-2">

                    {/* 1. 품목 이름, 거래처명 */}
                    <div className="grid grid-cols-2 gap-2">
                        <input name="name" value={newItem.name} onChange={handleItemInputChange} className={inputStyle} placeholder="품목 이름" />
                        <input name="vendorName" value={newItem.vendorName} onChange={handleItemInputChange} className={inputStyle} placeholder="거래처명" />
                    </div>

                    {/* 2. 단가, 수량, 부가세율, 합계 (4단 Grid) */}
                    <div className="grid grid-cols-4 gap-2">
                        {/* 단가 (공급가액) */}
                        <div className="col-span-1">
                            <label className={labelStyle}>단가</label>
                            <input name="unitPrice" type="text" value={formatNumber(newItem.unitPrice)} onChange={handleItemInputChange} placeholder="단가" inputMode="numeric" className={inputStyle} />
                        </div>
                        {/* 부가세 (세율) */}
                        <div className="col-span-1">
                            <label className={labelStyle}>부가세율 (%)</label>
                            <input name="vatRate" type="text" value={formatNumber(newItem.vatRate * 100)} onChange={handleItemInputChange} placeholder="10" inputMode="numeric" className={inputStyle} />
                        </div>
                        {/* 수량 (업/다운 버튼 포함) */}
                        <div className="col-span-1">
                            <label className={labelStyle}>수량</label>
                            <div className="relative flex items-center">
                                <input name="quantity" type="text"
                                       value={formatNumber(newItem.quantity)}
                                       onChange={handleItemInputChange} placeholder="수량"
                                       inputMode="numeric"
                                       className={`${inputStyle} pr-8`}/>
                                <div
                                    className="absolute right-0 flex flex-col h-full border-l dark:border-slate-600">
                                    <button
                                        type="button"
                                        onClick={() => handleNewItemQtyChange(1)}
                                        className="h-1/2 w-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 border-b dark:border-slate-600 rounded-tr-lg"
                                    >
                                        <ChevronUpIcon
                                            className="w-3 h-3"/>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleNewItemQtyChange(-1)}
                                        className="h-1/2 w-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-br-lg"
                                    >
                                        <ChevronDownIcon
                                            className="w-3 h-3"/>
                                    </button>
                                </div>
                            </div>
                        </div>
                        {/* 합계 (Display Only) */}
                        <div className="col-span-1">
                            <label className={labelStyle}>합계</label>
                            <input
                                value={formatNumber(calculateItemTotals(newItem.quantity, newItem.unitPrice, newItem.vatRate).totalAmount)}
                                readOnly
                                className={`${inputStyle} bg-gray-200 dark:bg-slate-700`}/>
                        </div>

                        {/* 품목 추가 버튼 (하단 전체) */}
                        <button onClick={handleAdd}
                                className="bg-green-600 text-white rounded-lg col-span-4 py-2 mt-2 hover:bg-green-700">
                            {/*<PlusIcon className="inline mr-1" /> */}
                            품목 추가
                        </button>
                    </div>
                </div>


                {/* 2.2. 품목 리스트 테이블 */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="text-xs uppercase bg-gray-100 dark:bg-slate-700/50">
                        <tr>
                            <th className="px-4 py-2 text-left">품목명</th>
                            <th className="px-4 py-2 text-right">단가</th>
                            <th className="px-4 py-2 text-right">수량</th>
                            <th className="px-4 py-2 text-right">공급가액</th>
                            <th className="px-4 py-2 text-right">부가세</th>
                            <th className="px-4 py-2 text-right">합계</th>
                            <th className="px-4 py-2 text-left">거래처명</th>
                            <th className="px-4 py-2 text-center">삭제</th>
                        </tr>
                        </thead>
                        <tbody>
                        {currentForm.items.map((item, index) => (
                            <tr key={index} className="border-t dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                <td className="px-4 py-2 font-medium">
                                    <input
                                        type="text"
                                        value={item.name}
                                        onChange={(e) => handleTableChange(index, 'name', e.target.value)}
                                        className="w-full bg-transparent border-none focus:ring-0 p-0 m-0"
                                    />
                                </td>
                                {/* 단가 (Editable) */}
                                <td className="px-4 py-2 text-right">
                                    <input
                                        type="text"
                                        value={formatNumber(item.unitPrice)}
                                        onChange={(e) => handleTableChange(index, 'unitPrice', e.target.value)}
                                        className="w-full text-right bg-transparent border-none focus:ring-0 p-0 m-0"
                                        inputMode="numeric"
                                    />
                                </td>
                                {/* 수량 (Editable) */}
                                <td className="px-4 py-2 text-right">
                                    <input
                                        type="text"
                                        value={formatNumber(item.quantity)}
                                        onChange={(e) => handleTableChange(index, 'quantity', e.target.value)}
                                        className="w-full text-right bg-transparent border-none focus:ring-0 p-0 m-0"
                                        inputMode="numeric"
                                    />
                                </td>
                                <td className="px-4 py-2 text-right">{formatNumber(item.supplyValue)}</td>
                                <td className="px-4 py-2 text-right text-orange-600 dark:text-orange-400">{formatNumber(item.vatAmount)}</td>
                                <td className="px-4 py-2 text-right font-bold text-blue-600 dark:text-blue-400">{formatNumber(item.totalAmount)}</td>
                                <td className="px-4 py-2 text-left">
                                    <input
                                        type="text"
                                        value={item.vendorName}
                                        onChange={(e) => handleTableChange(index, 'vendorName', e.target.value)}
                                        className="w-full bg-transparent border-none focus:ring-0 p-0 m-0"
                                    />
                                </td>
                                <td className="px-4 py-2 text-center">
                                    <button onClick={() => handleRemove(index)} className="text-red-500 hover:text-red-700">
                                        <XIcon className="w-4 h-4 inline" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                        {/* ⭐ 총 합계 푸터 ⭐ */}
                        <tfoot className="border-t-2 dark:border-slate-600 font-bold bg-gray-100 dark:bg-slate-700/50">
                        <tr>
                            <td className="px-4 py-2 text-left">총 합계</td>
                            <td className="px-4 py-2 text-right">{formatNumber(grandTotals.totalUnitPrice)}</td>
                            <td className="px-4 py-2 text-right">{formatNumber(grandTotals.totalQuantity)}</td>
                            <td className="px-4 py-2 text-right">{formatNumber(grandTotals.totalSupplyValue)}</td>
                            <td className="px-4 py-2 text-right text-orange-600 dark:text-orange-400">{formatNumber(grandTotals.totalVatAmount)}</td>
                            <td className="px-4 py-2 text-right text-lg text-blue-700 dark:text-blue-400">{formatNumber(grandTotals.totalAmount)}</td>
                            <td colSpan="2"></td>
                        </tr>
                        </tfoot>
                    </table>
                </div>

            </div>
        );
    };


    const inputStyle = "w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-colors";
    const labelStyle = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
    const modalContentStyle = "fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-[1200px] translate-x-[-50%] translate-y-[-50%] rounded-xl bg-white dark:bg-slate-800 shadow-2xl focus:outline-none z-50 overflow-y-auto border border-gray-200 dark:border-slate-700 transition-colors";

    const fixedModalWidth = 'max-w-[800px]';

    return (
        <Tooltip.Provider delayDuration={300}>
            <style>{`
                .swal2-container { z-index: 99999 !important; pointer-events: auto !important; }
            `}</style>

            <div className="p-8 max-w-7xl mx-auto min-h-screen text-gray-900 dark:text-gray-100 transition-colors duration-300">

                {/* 컨트롤 바 */}
                <div className="flex justify-between items-center mb-6 gap-4">
                    <div className="relative w-96">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><SearchIcon /></div>
                        <input type="text" className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-full bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition-colors shadow-sm"
                               placeholder="계약명 또는 고객사 검색" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <button onClick={() => setIsRegOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm whitespace-nowrap">
                        <PlusIcon /> 계약 등록
                    </button>
                </div>

                {/* 메인 테이블 영역 (리스트) */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden transition-colors duration-300">
                    <table className="w-full text-left">
                        <thead className="bg-gray-100 dark:bg-slate-700/50 text-gray-700 dark:text-gray-400 uppercase text-sm font-bold border-b border-gray-200 dark:border-slate-700">
                        <tr>
                            <th className="px-6 py-4">계약명</th>
                            <th className="px-6 py-4">고객사</th>
                            <th className="px-6 py-4">계약금액</th>
                            <th className="px-6 py-4">진행여부</th>
                            <th className="px-6 py-4">계약일자</th>
                            <th className="px-6 py-4 text-center">관리</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-700 bg-white dark:bg-slate-800">
                        {filteredContracts.length > 0 ? filteredContracts.map(contract => (
                            <tr key={contract.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                                <td className="px-6 py-4 font-bold text-gray-900 dark:text-gray-100">{contract.contractName}</td>
                                <td className="px-6 py-4 text-blue-600 dark:text-blue-400">{contract.customerCompany}</td>
                                {/* 계약 금액 쉼표 표시 */}
                                <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{formatNumber(contract.amount)} 원</td>
                                <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${contract.status === '진행중' ? 'bg-yellow-100 text-yellow-800' : contract.status === '진행완료' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                            {contract.status}
                                        </span>
                                </td>
                                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{contract.contractDate}</td>
                                <td className="px-6 py-4 text-center">
                                    <button onClick={() => setSelectedContract(contract)} className="p-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-slate-700 transition-colors rounded-full hover:bg-gray-100">
                                        <SettingsIcon className="w-5 h-5"/>
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="6" className="text-center py-8 text-gray-500">등록된 계약이 없습니다.</td></tr>
                        )}
                        </tbody>
                    </table>
                </div>

                {/* ========================================== */}
                {/* 1. 계약 등록 모달 */}
                {/* ========================================== */}
                <Dialog.Root
                    open={isRegOpen}
                    onOpenChange={(newOpenState) => {
                        setIsRegOpen(newOpenState);
                        if (newOpenState === false) {
                            setIsItemsExpanded(false);
                            // 닫을 때 폼 초기화는 handleSubmit에서 이미 처리
                        }
                    }}
                >
                    <Dialog.Portal>
                        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" />
                        {/* 모달 너비 고정 */}
                        <Dialog.Content className={`${modalContentStyle} ${fixedModalWidth}`}>
                            <div
                                className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
                                <Dialog.Title className="text-xl font-bold text-gray-800 dark:text-gray-100">
                                    {isItemsExpanded ? '계약 품목 상세 관리' : '신규 계약 등록'}
                                </Dialog.Title>
                                <Dialog.Close asChild>
                                    <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                        <XIcon/></button>
                                </Dialog.Close>
                            </div>
                            <div className="p-6 space-y-4">

                                {/* 1차 화면: 기본 정보 입력 */}
                                {!isItemsExpanded && (
                                    <div className="space-y-4 transition-opacity duration-500 ease-in-out">
                                        <div className="grid grid-cols-3 gap-4">
                                            {/* 구분 / 진행 여부 / 계약 금액 */}
                                            <div><label className={labelStyle}>구분</label>
                                                <select name="category" value={contractForm.category}
                                                        onChange={handleFormChange}
                                                        className={`${inputStyle} appearance-none pr-8`}>
                                                    <option value="조달계약">조달계약</option>
                                                    <option value="수의계약">수의계약</option>
                                                </select>
                                            </div>
                                            <div><label className={labelStyle}>진행 여부</label>
                                                <select name="status" value={contractForm.status}
                                                        onChange={handleFormChange}
                                                        className={`${inputStyle} appearance-none pr-8`}>
                                                    <option value="예정">예정</option>
                                                    <option value="진행중">진행중</option>
                                                    <option value="진행완료">진행완료</option>
                                                </select>
                                            </div>
                                            <div className="col-span-1">
                                                <label className={labelStyle}>계약 금액 (예상)</label>
                                                {/* amount 상태는 숫자만 저장, formatNumber로 표시 */}
                                                <input type="text" name="amount"
                                                       value={formatNumber(contractForm.amount)}
                                                       onChange={handleFormChange} className={inputStyle}
                                                       placeholder="예상 금액" inputMode="numeric"/>
                                            </div>

                                            {/* 계약명 */}
                                            <div className="col-span-3">
                                                <label className={labelStyle}>계약명</label>
                                                <input name="contractName" value={contractForm.contractName}
                                                       onChange={handleFormChange} className={inputStyle}
                                                       placeholder="사업명"/>
                                            </div>

                                            {/* 고객사 / 주 계약업체 / 담당자 */}
                                            <div className="col-span-1">
                                                <label className={labelStyle}>고객사</label>
                                                {renderDropdown('customerCompany', contractForm.customerCompany, handleFormChange)}
                                            </div>
                                            <div className="col-span-1">
                                                <label className={labelStyle}>주 계약업체</label>
                                                {renderDropdown('mainContractor', contractForm.mainContractor, handleFormChange)}
                                            </div>
                                            <div className="col-span-1">
                                                <label className={labelStyle}>주 계약업체 담당자</label>
                                                <input name="mainContact" value={contractForm.mainContact}
                                                       onChange={handleFormChange} className={inputStyle}
                                                       placeholder="담당자 이름"/>
                                            </div>

                                            {/* 날짜 정보 */}
                                            <div>
                                                <label className={labelStyle}>사업 시작 날짜</label>
                                                <input type="date" name="startDate" value={contractForm.startDate}
                                                       onChange={handleFormChange} className={inputStyle}/>
                                            </div>
                                            <div>
                                                <label className={labelStyle}>사업 종료 날짜</label>
                                                <input type="date" name="endDate" value={contractForm.endDate}
                                                       onChange={handleFormChange} className={inputStyle}/>
                                            </div>
                                            <div>
                                                <label className={labelStyle}>계약 일자</label>
                                                <input type="date" name="contractDate"
                                                       value={contractForm.contractDate} onChange={handleFormChange}
                                                       className={inputStyle}/>
                                            </div>

                                            {/* 하도급 정보 */}
                                            <div className="col-span-2">
                                                <label className={labelStyle}>하도급 업체</label>
                                                <input name="subContractor" value={contractForm.subContractor}
                                                       onChange={handleFormChange} className={inputStyle}
                                                       placeholder="업체명"/>
                                            </div>
                                            <div className="col-span-1">
                                                <label className={labelStyle}>하도급 담당자</label>
                                                <input name="subContact" value={contractForm.subContact}
                                                       onChange={handleFormChange} className={inputStyle}
                                                       placeholder="담당자 이름"/>
                                            </div>

                                        </div>

                                        {/* 계약 품목 헤더 (클릭 트리거) */}
                                        <div
                                            onClick={() => setIsItemsExpanded(true)}
                                            className="mt-6 flex justify-between items-center cursor-pointer border border-gray-300 dark:border-slate-700
                                                bg-gray-50 dark:bg-slate-700/70 p-3 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-slate-700 shadow-sm"
                                        >
                                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                                                계약 품목 목록 ({contractForm.items.length}건)
                                            </h3>
                                            <div
                                                className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">
                                                상세 관리
                                                <ChevronDownIcon className="w-5 h-5 rotate-270"/>
                                            </div>
                                        </div>
                                    </div>
                                )}


                                {/* 2차 화면: 품목 상세 관리 테이블 */}
                                {isItemsExpanded && renderItemManagement({isUpdateMode: false})}


                            </div>
                            <div className="p-6 border-t border-gray-200 dark:border-slate-700 flex justify-end gap-3">
                                {isItemsExpanded ? (
                                    <>
                                        {/* 품목 상세 화면일 때: 기본 정보로 돌아가기 */}
                                        <button
                                            onClick={() => setIsItemsExpanded(false)}
                                            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors"
                                        >
                                            기본 정보로 돌아가기
                                        </button>

                                        {/* 등록 모달이므로 '삭제' 버튼은 표시하지 않음 */}

                                        <button onClick={handleSubmit}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg">계약 등록
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        {/* 기본 정보 화면일 때: 취소 */}
                                        <Dialog.Close asChild>
                                            <button className="px-4 py-2 text-gray-600 dark:text-gray-300">취소</button>
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

                {/* ========================================== */}
                {/* 2. 계약 상세/수정 모달 (selectedContractForm 사용) */}
                {/* ========================================== */}
                <Dialog.Root open={!!selectedContract} onOpenChange={setSelectedContract}>
                    <Dialog.Portal>
                        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"/>
                        <Dialog.Content className={`${modalContentStyle} max-w-[1200px]`}> {/* 품목이 많아 너비 확장 */}
                            <div
                                className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
                                <Dialog.Title className="text-xl font-bold text-gray-800 dark:text-gray-100">
                                    {isItemsExpanded ? '품목 수정/관리' : `${selectedContractForm?.contractName || '계약 상세/수정'}`}
                                </Dialog.Title>
                                <Dialog.Close asChild>
                                    <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                        <XIcon/></button>
                                </Dialog.Close>
                            </div>

                            <div className="p-6 space-y-6">
                                {selectedContractForm && (
                                    <div className="space-y-4">

                                        {!isItemsExpanded && (
                                            <div className="space-y-4">
                                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">계약 기본정보 관리 </h3>
                                                <div className="grid grid-cols-3 gap-4 text-sm">

                                                    {/* 1열: 구분 / 진행여부 / 금액 */}
                                                    <div><label className={labelStyle}>구분</label>
                                                        <select name="category" value={selectedContractForm.category} onChange={handleSelectedFormChange} className={`${inputStyle} appearance-none pr-8`}>
                                                            <option value="조달계약">조달계약</option>
                                                            <option value="수의계약">수의계약</option>
                                                        </select>
                                                    </div>
                                                    <div><label className={labelStyle}>진행 여부</label>
                                                        <select name="status" value={selectedContractForm.status} onChange={handleSelectedFormChange} className={`${inputStyle} appearance-none pr-8`}>
                                                            <option value="예정">예정</option>
                                                            <option value="진행중">진행중</option>
                                                            <option value="진행완료">진행완료</option>
                                                        </select>
                                                    </div>
                                                    {/* amount 필드는 품목 총합으로 자동 업데이트되지만, 수기 입력도 허용합니다. */}
                                                    <div><label className={labelStyle}>계약 금액 (품목 총합: {formatNumber(getTotalContractAmountSelected)})</label>
                                                        <input type="text" name="amount" value={formatNumber(selectedContractForm.amount)} onChange={handleSelectedFormChange} className={inputStyle} placeholder="금액" inputMode="numeric"/>
                                                    </div>

                                                    {/* 계약명 */}
                                                    <div className="col-span-3">
                                                        <label className={labelStyle}>계약명</label>
                                                        <input name="contractName" value={selectedContractForm.contractName} onChange={handleSelectedFormChange} className={inputStyle} placeholder="사업명"/>
                                                    </div>

                                                    {/* 고객사 / 주 계약업체 / 담당자 */}
                                                    <div><label className={labelStyle}>고객사</label>{renderDropdown('customerCompany', selectedContractForm.customerCompany, handleSelectedFormChange)}</div>
                                                    <div><label className={labelStyle}>주 계약업체</label>{renderDropdown('mainContractor', selectedContractForm.mainContractor, handleSelectedFormChange)}</div>
                                                    <div><label className={labelStyle}>담당자</label><input name="mainContact" value={selectedContractForm.mainContact} onChange={handleSelectedFormChange} className={inputStyle} placeholder="담당자 이름"/></div>

                                                    {/* 날짜 정보 */}
                                                    <div><label className={labelStyle}>계약 일자</label><input type="date" name="contractDate" value={selectedContractForm.contractDate} onChange={handleSelectedFormChange} className={inputStyle}/></div>
                                                    <div><label className={labelStyle}>사업 시작일</label><input type="date" name="startDate" value={selectedContractForm.startDate} onChange={handleSelectedFormChange} className={inputStyle}/></div>
                                                    <div><label className={labelStyle}>사업 종료일</label><input type="date" name="endDate" value={selectedContractForm.endDate} onChange={handleSelectedFormChange} className={inputStyle}/></div>

                                                    {/* 하도급 정보 */}
                                                    <div className="col-span-2"><label className={labelStyle}>하도급 업체</label><input name="subContractor" value={selectedContractForm.subContractor} onChange={handleSelectedFormChange} className={inputStyle} placeholder="업체명"/></div>
                                                    <div><label className={labelStyle}>하도급 담당자</label><input name="subContact" value={selectedContractForm.subContact} onChange={handleSelectedFormChange} className={inputStyle} placeholder="담당자 이름"/></div>
                                                </div>

                                                {/* 계약 품목 헤더 (클릭 트리거) */}
                                                <div
                                                    onClick={() => setIsItemsExpanded(true)}
                                                    className="mt-6 flex justify-between items-center cursor-pointer border border-gray-300 dark:border-slate-700
                                                    bg-gray-50 dark:bg-slate-700/70 p-3 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-slate-700 shadow-sm"
                                                >
                                                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                                                        계약 품목 목록 ({selectedContractForm.items?.length || 0}건)
                                                    </h3>
                                                    <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">
                                                        상세 관리/수정
                                                        <ChevronDownIcon className="w-5 h-5 rotate-270"/>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* 2차 화면: 품목 상세 수정/관리 테이블 */}
                                        {isItemsExpanded && renderItemManagement({ isUpdateMode: true })}

                                    </div>
                                )}
                            </div>

                            <div className="p-6 border-t border-gray-200 dark:border-slate-700 flex justify-end gap-3">
                                {/* 품목 상세 화면일 때는 돌아가기/취소 버튼만 표시 */}
                                {isItemsExpanded ? (
                                    <>
                                        {/* 아이콘 제거 */}
                                        <button
                                            onClick={() => setIsItemsExpanded(false)}
                                            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors"
                                        >
                                            기본 정보로 돌아가기
                                        </button>

                                        {/*<button onClick={handleDelete} className="px-4 py-2 bg-red-100 text-red-600 rounded-lg flex items-center gap-1">*/}
                                        {/*    삭제*/}
                                        {/*</button>*/}
                                        <button onClick={handleUpdate} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                                            수정 완료
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Dialog.Close asChild>
                                            <button className="px-4 py-2 text-gray-600 dark:text-gray-300">취소</button>
                                        </Dialog.Close>

                                        <button onClick={handleDelete} className="px-4 py-2 bg-red-100 text-red-600 rounded-lg flex items-center gap-1">
                                            삭제
                                        </button>
                                        <button onClick={handleUpdate} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                                            수정 완료
                                        </button>
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