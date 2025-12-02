package com.ange1jun.spabackend.dto;


import com.ange1jun.spabackend.domain.Company;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CompanyResponse {

    private Long id;
    private String name;
    private String reg;
    private String rep;
    private String tel;
    private String email;
    private String address;
    private String memo;

    public static CompanyResponse of(Company company){
        return CompanyResponse.builder()
                .id(company.getId())
                .name(company.getName())
                .reg(company.getReg())
                .rep(company.getRep())
                .tel(company.getTel())
                .email(company.getEmail())
                .address(company.getAddress())
                .memo(company.getMemo())
                .build();
    }
}
