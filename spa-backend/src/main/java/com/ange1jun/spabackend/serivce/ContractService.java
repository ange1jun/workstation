package com.ange1jun.spabackend.serivce;

import com.ange1jun.spabackend.domain.Contract;
import com.ange1jun.spabackend.domain.ContractItem;
import com.ange1jun.spabackend.dto.ContractRequest;
import com.ange1jun.spabackend.dto.ContractItemDto;
import com.ange1jun.spabackend.repository.ContractRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ContractService {

    private final ContractRepository contractRepository;

    @Transactional
    public Contract saveNewContract(ContractRequest request) {

        Contract newContract = new Contract();
        updateContractFields(newContract, request); // 필드 세팅 로직 분리

        if (request.getItems() != null) {
            for (ContractItemDto itemDto : request.getItems()) {
                ContractItem item = createContractItemFromDto(itemDto);
                newContract.addContractItem(item); // 연관관계 편의 메서드 사용
            }
        }

        return contractRepository.save(newContract);
    }

    @Transactional
    public Contract updateContract(Long id, ContractRequest request) {

        Contract contract = contractRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("계약 ID 찾을 수 없음: " + id));

        updateContractFields(contract, request);

        contract.getContractItems().clear();

        if (request.getItems() != null) {
            for (ContractItemDto itemDto : request.getItems()) {
                ContractItem item = createContractItemFromDto(itemDto);
                contract.addContractItem(item);
            }
        }

        return contractRepository.save(contract);
    }

    private void updateContractFields(Contract contract, ContractRequest request) {
        contract.setCategory(request.getCategory());
        contract.setStatus(request.getStatus());
        contract.setAmount(request.getAmount());
        contract.setName(request.getName());
        contract.setCompany_name(request.getCompany_name());
        contract.setMain_contractor(request.getMain_contractor());
        contract.setMain_contract(request.getMain_contract());
        contract.setStart_date(request.getStart_date());
        contract.setEnd_date(request.getEnd_date());
        contract.setContract_date(request.getContract_date());
        contract.setSub_contractor(request.getSub_contractor());
        contract.setSub_contract(request.getSub_contract());
    }

    // DTO -> Entity 변환 및 계산 로직
    private ContractItem createContractItemFromDto(ContractItemDto dto) {
        ContractItem item = ContractItem.builder()
                .name(dto.getName())
                .vendorName(dto.getVendorName())
                .unitPrice(dto.getUnitPrice())
                .quantity(dto.getQuantity())
                .vatRate(dto.getVatRate())
                .build();

        // 금액 자동 계산
        item.calculateDetails();
        return item;
    }

    @Transactional(readOnly = true)
    public List<Contract> findAllContract() {
        return contractRepository.findAll();
    }

    @Transactional
    public void deleteContract(Long id) {
        if (!contractRepository.existsById(id)) {
            throw new IllegalArgumentException("계약 ID 찾을 수 없음: " + id);
        }
        contractRepository.deleteById(id);
    }
}