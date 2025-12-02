package com.ange1jun.spabackend.controller;

import com.ange1jun.spabackend.domain.Partner;
import com.ange1jun.spabackend.dto.PartnerRequest;
import com.ange1jun.spabackend.dto.PartnerResponse;
import com.ange1jun.spabackend.service.PartnerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/partner")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173") // React 개발 서버 허용
public class PartnerController {

    private final PartnerService partnerService;

    @GetMapping
    public ResponseEntity<List<PartnerResponse>> getPartners() {
        List<Partner> partners = partnerService.findAllPartners();

        List<PartnerResponse> responseList = partners.stream()
                .map(PartnerResponse::of)
                .collect(Collectors.toList());

        return ResponseEntity.ok(responseList);
    }

    @PostMapping
    public ResponseEntity<PartnerResponse> registerPartner(@RequestBody PartnerRequest request) {
        Partner savedPartner = partnerService.saveNewPartner(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(PartnerResponse.of(savedPartner));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PartnerResponse> updatePartner(@PathVariable Long id, @RequestBody PartnerRequest request) {
        Partner updatedPartner = partnerService.updatePartner(id, request);
        return ResponseEntity.ok(PartnerResponse.of(updatedPartner));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePartner(@PathVariable Long id) {
        partnerService.deletePartner(id);
    }
}