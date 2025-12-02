package com.ange1jun.spabackend.controller;


import com.ange1jun.spabackend.domain.Customer;
import com.ange1jun.spabackend.dto.CustomerRequest;
import com.ange1jun.spabackend.dto.CustomerResponse;
import com.ange1jun.spabackend.serivce.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/customer") // React에서 이 경로로 요청을 보냅니다.
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping
    public ResponseEntity<List<CustomerResponse>> getCustomer() {
        List<Customer> customer = customerService.findAllCustomer();

        // Entity List -> Response DTO 변환
        List<CustomerResponse> responseList = customer.stream()
                .map(CustomerResponse::of)
                .collect(Collectors.toList());

        return ResponseEntity.ok(responseList);
    }


    @PostMapping
    public ResponseEntity<CustomerResponse> registerCustomer(@RequestBody CustomerRequest request) {
        // dto -> service
        Customer savedCustomer = customerService.saveNewCustomer(request);

        // Entity -> Response dto = 201 http
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(CustomerResponse.of(savedCustomer));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CustomerResponse> updateCustomer(@PathVariable Long id, @RequestBody CustomerRequest request) {
        Customer updatedCustomer = customerService.updateCustomer(id, request);
        return ResponseEntity.ok(CustomerResponse.of(updatedCustomer));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteEmployee(@PathVariable Long id) {
        customerService.deleteCustomer(id);
    }


}
