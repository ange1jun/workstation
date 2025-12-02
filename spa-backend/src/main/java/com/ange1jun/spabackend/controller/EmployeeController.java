package com.ange1jun.spabackend.controller;


import com.ange1jun.spabackend.domain.Employee;
import com.ange1jun.spabackend.dto.EmployeeRequest;
import com.ange1jun.spabackend.dto.EmployeeResponse;
import com.ange1jun.spabackend.serivce.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/employee") // React에서 이 경로로 요청을 보냅니다.
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class EmployeeController {

    private final EmployeeService employeeService;

    @GetMapping
    public ResponseEntity<List<EmployeeResponse>> getEmployees() {
        List<Employee> employees = employeeService.findAllEmployees();

        // Entity List -> Response DTO 변환
        List<EmployeeResponse> responseList = employees.stream()
                .map(EmployeeResponse::of)
                .collect(Collectors.toList());

        return ResponseEntity.ok(responseList);
    }

    @PostMapping
    public ResponseEntity<EmployeeResponse> registerEmployee(@RequestBody EmployeeRequest request) {
        // dto -> service
        Employee savedEmployee = employeeService.saveNewEmployee(request);

        // Entity -> Response dto = 201 http
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(EmployeeResponse.of(savedEmployee));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmployeeResponse> updateEmployee(@PathVariable Long id, @RequestBody EmployeeRequest request) {
        Employee updatedEmployee = employeeService.updateEmployee(id, request);
        return ResponseEntity.ok(EmployeeResponse.of(updatedEmployee));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteEmployee(@PathVariable Long id) {
        employeeService.deleteEmployee(id);
    }


}
