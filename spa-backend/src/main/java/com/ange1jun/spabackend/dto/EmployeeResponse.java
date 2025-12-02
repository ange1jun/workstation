package com.ange1jun.spabackend.dto;

import com.ange1jun.spabackend.domain.Employee;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class EmployeeResponse {

    private Long id;
    private String name;
    private String company;
    private String department;
    private String position;
    private String contact;
    private String email;
    private String note;

    // Entity -> Response DTO 변환 메서드
    public static EmployeeResponse of(Employee employee) {
        return EmployeeResponse.builder()
                .id(employee.getId())
                .name(employee.getName())
                .company(employee.getCompany())
                .department(employee.getDepartment())
                .position(employee.getPosition())
                .contact(employee.getContact())
                .email(employee.getEmail())
                .note(employee.getNote())
                .build();
    }
}
