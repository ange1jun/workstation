package com.ange1jun.spabackend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
public class CompanyRequest {
    private Long id;
    private String name;
    private String reg;
    private String rep;
    private String tel;
    private String email;
    private String address;
    private String memo;
}
