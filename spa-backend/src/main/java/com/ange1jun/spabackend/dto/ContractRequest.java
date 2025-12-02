package com.ange1jun.spabackend.dto;

import lombok.Getter;
import lombok.Setter;

import java.sql.Date;
import java.util.List;

@Getter @Setter
public class ContractRequest {

    private Long id;
    private String category;
    private String status;
    private Long amount;
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
}
