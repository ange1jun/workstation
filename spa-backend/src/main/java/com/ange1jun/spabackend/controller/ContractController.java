package com.ange1jun.spabackend.controller;

import com.ange1jun.spabackend.domain.Contract;
import com.ange1jun.spabackend.dto.ContractRequest;
import com.ange1jun.spabackend.dto.ContractResponse;
import com.ange1jun.spabackend.serivce.ContractService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/contract") // React에서 이 경로로 요청을 보냅니다.
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ContractController {

    private final ContractService contractService;


    @GetMapping
    public ResponseEntity<List<ContractResponse>> getContrcat() {
        List<Contract> contract = contractService.findAllContract();

        // Entity List -> Response DTO 변환
        List<ContractResponse> responseList = contract.stream()
                .map(ContractResponse::of)
                .collect(Collectors.toList());

        return ResponseEntity.ok(responseList);
    }

    @PostMapping
    public ResponseEntity<ContractResponse> registerContrcat(@RequestBody ContractRequest request) {
        // dto -> service
        Contract savedContrcat = contractService.saveNewContract(request);

        // Entity -> Response dto = 201 http
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ContractResponse.of(savedContrcat));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ContractResponse> updateconstract(@PathVariable Long id, @RequestBody ContractRequest request) {
        Contract updatedcontract = contractService.updateContract(id, request);
        return ResponseEntity.ok(ContractResponse.of(updatedcontract));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteContact(@PathVariable Long id) {
        contractService.deleteContract(id);
    }

}
