package com.ange1jun.spabackend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter

public class EmployeeRequest {

    @NotBlank(message = "이름은 필수 입력 항목입니다.")
    private String name;
    private String company;
    private String department;
    private String position;
    private String contact;
    private String email;
    private String note;
}
