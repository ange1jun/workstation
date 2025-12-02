package com.ange1jun.spabackend.serivce;


import com.ange1jun.spabackend.domain.Employee;
import com.ange1jun.spabackend.dto.EmployeeRequest;
import com.ange1jun.spabackend.dto.EmployeeResponse;
import com.ange1jun.spabackend.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;

    @Transactional
    public Employee saveNewEmployee(EmployeeRequest request) {

        // DTO -> Entity
        Employee newEmployee = new Employee();
        newEmployee.setName(request.getName());
        newEmployee.setCompany(request.getCompany());
        newEmployee.setDepartment(request.getDepartment());
        newEmployee.setPosition(request.getPosition());
        newEmployee.setContact(request.getContact());
        newEmployee.setEmail(request.getEmail());
        newEmployee.setNote(request.getNote());

        // Repository를 통해 DB에 저장 (INSERT)
        return employeeRepository.save(newEmployee);
    }

    @Transactional(readOnly = true)
    public List<Employee> findAllEmployees() {
        return employeeRepository.findAll();
    }

    @Transactional
    public Employee updateEmployee(Long id, EmployeeRequest request) {

        // ID로 고객 조회
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("직원 ID 찾을 수 없음: " + id));

        // DTO -> Entity 반영
        employee.setDepartment(request.getDepartment());
        employee.setPosition(request.getPosition());
        employee.setContact(request.getContact());
        employee.setEmail(request.getEmail());
        employee.setNote(request.getNote());

        return employeeRepository.save(employee);
    }

    @Transactional
    public void deleteEmployee(Long id) {
        if (!employeeRepository.existsById(id)) {
            throw new IllegalArgumentException("직원 ID 찾을 수 없음: " + id);
        }

        employeeRepository.deleteById(id);
    }
}
