package com.ange1jun.spabackend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class CustomerRequest {

    @NotBlank(message = "이름은 필수 입력 항목입니다.")
    private String name;
    private String company;
    private String department; // 부서
    private String part; // 파트
    private String position; // 직급
    private String contact; // 연락처
    private String email; // 이메일
    private String responsibilities; //담당업무
    private String memo; // 메모/특이사항
}
