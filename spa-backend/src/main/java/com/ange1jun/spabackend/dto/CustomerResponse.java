package com.ange1jun.spabackend.dto;

import com.ange1jun.spabackend.domain.Customer;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CustomerResponse {

    private Long id;
    private String name;
    private String company;
    private String department; // 부서
    private String part; // 파트
    private String position; // 직급
    private String contact; // 연락처
    private String email; // 이메일
    private String responsibilities; //담당업무
    private String memo; // 메모/특이사항

    public static CustomerResponse of(Customer customer) {
        return CustomerResponse.builder()
                .id(customer.getId())
                .company(customer.getCompany())
                .name(customer.getName())
                .company(customer.getCompany())
                .department(customer.getDepartment())
                .part(customer.getPart())
                .position(customer.getPosition())
                .contact(customer.getContact())
                .contact(customer.getContact())
                .email(customer.getEmail())
                .responsibilities(customer.getResponsibilities())
                .memo(customer.getMemo())
                .build();
    }
}

