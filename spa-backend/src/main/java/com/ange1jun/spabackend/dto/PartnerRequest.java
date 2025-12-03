package com.ange1jun.spabackend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PartnerRequest {

    @NotBlank(message = "파트너사 이름은 필수 입력 항목입니다.")
    private String name;
    private String rep;
    private String tel;
    private String position;
    private String work_type;
    private String email;
    private String memo;
}