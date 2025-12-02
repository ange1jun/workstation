package com.ange1jun.spabackend.dto;

import com.ange1jun.spabackend.domain.Contract;
import lombok.Builder;
import lombok.Getter;

import java.sql.Date;
import java.util.List;
import java.util.stream.Collectors;

@Getter @Builder
public class ContractResponse {

    private Long id;
    private String category;
    private String status;
    private Number amount;
    private String name;
    private String company_name;
    private String main_contractor;
    private String main_contract;
    private Date start_date;
    private Date end_date;
    private Date contract_date;
    private String sub_contractor;
    private String sub_contract;

    private List<ContractItemDto> items;

    public static ContractResponse of(Contract contract){
        return ContractResponse.builder()
                .id(contract.getId())
                .category(contract.getCategory())
                .status(contract.getStatus())
                .amount(contract.getAmount())
                .name(contract.getName())
                .company_name(contract.getCompany_name())
                .main_contractor(contract.getMain_contractor())
                .main_contract(contract.getMain_contract())
                .start_date(contract.getStart_date())
                .end_date(contract.getEnd_date())
                .contract_date(contract.getContract_date())
                .sub_contract(contract.getSub_contract())
                .sub_contract(contract.getSub_contract())
                .items(contract.getContractItems().stream()
                        .map(ContractItemDto::from)
                        .collect(Collectors.toList()))
                .build();
    }
}
