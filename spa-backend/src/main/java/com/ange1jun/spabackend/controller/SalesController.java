package com.ange1jun.spabackend.controller;

import com.ange1jun.spabackend.domain.Sales;
import com.ange1jun.spabackend.dto.SalesHistoryRequest;
import com.ange1jun.spabackend.dto.SalesRequest;
import com.ange1jun.spabackend.dto.SalesResponse;
import com.ange1jun.spabackend.service.SalesService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/sales")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173") // React 개발 서버 포트 허용
public class SalesController {

    private final SalesService salesService;

    @GetMapping
    public ResponseEntity<List<SalesResponse>> getSales() {
        List<Sales> salesList = salesService.findAllSales();

        List<SalesResponse> responseList = salesList.stream()
                .map(SalesResponse::of)
                .collect(Collectors.toList());

        return ResponseEntity.ok(responseList);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SalesResponse> getSalesDetail(@PathVariable Long id) {
        Sales sales = salesService.findSalesById(id);
        return ResponseEntity.ok(SalesResponse.of(sales));
    }

    @PostMapping
    public ResponseEntity<SalesResponse> registerSales(@RequestBody SalesRequest request) {
        Sales savedSales = salesService.saveSales(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(SalesResponse.of(savedSales));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SalesResponse> updateSales(@PathVariable Long id, @RequestBody SalesRequest request) {
        Sales updatedSales = salesService.updateSales(id, request);
        return ResponseEntity.ok(SalesResponse.of(updatedSales));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteSales(@PathVariable Long id) {
        salesService.deleteSales(id);
    }

    @PostMapping("/{id}/history")
    public ResponseEntity<Void> addHistory(@PathVariable Long id, @RequestBody SalesHistoryRequest request) {
        salesService.addHistory(id, request);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/history/{historyId}")
    public ResponseEntity<Void> updateHistory(@PathVariable Long historyId, @RequestBody SalesHistoryRequest request) {
        salesService.updateHistory(historyId, request.getContent());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/history/{historyId}")
    public ResponseEntity<Void> deleteHistory(@PathVariable Long historyId) {
        salesService.deleteHistory(historyId);
        return ResponseEntity.ok().build();
    }
}