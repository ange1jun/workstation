package com.ange1jun.spabackend.controller;


import com.ange1jun.spabackend.domain.Company;
import com.ange1jun.spabackend.dto.CompanyRequest;
import com.ange1jun.spabackend.dto.CompanyResponse;
import com.ange1jun.spabackend.serivce.CompanyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/company") // React에서 이 경로로 요청을 보냅니다.
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class CompanyController {

    private final CompanyService companyService;

    @GetMapping
    public ResponseEntity<List<CompanyResponse>> getCompany() {
        List<Company> company = companyService.findAllCompany();

        // Entity List -> Response DTO 변환
        List<CompanyResponse> responseList = company.stream()
                .map(CompanyResponse::of)
                .collect(Collectors.toList());

        return ResponseEntity.ok(responseList);
    }

    @PostMapping
    public ResponseEntity<CompanyResponse> registerCompany(@RequestBody CompanyRequest request) {
        // dto -> service
        Company savedCompany = companyService.saveNewCompany(request);

        // Entity -> Response dto = 201 http
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(CompanyResponse.of(savedCompany));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CompanyResponse> updateCompany(@PathVariable Long id, @RequestBody CompanyRequest request) {
        Company updatedCompany = companyService.updateCompany(id, request);
        return ResponseEntity.ok(CompanyResponse.of(updatedCompany));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCompany(@PathVariable Long id) {
        companyService.deleteCompany(id);
    }



}
