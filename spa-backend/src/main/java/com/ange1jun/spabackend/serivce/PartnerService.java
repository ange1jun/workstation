package com.ange1jun.spabackend.service; // 혹은 com.ange1jun.spabackend.serivce (기존 오타 유지 시)

import com.ange1jun.spabackend.domain.Partner;
import com.ange1jun.spabackend.dto.PartnerRequest;
import com.ange1jun.spabackend.repository.PartnerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PartnerService {

    private final PartnerRepository partnerRepository;

    @Transactional
    public Partner saveNewPartner(PartnerRequest request) {
        Partner newPartner = new Partner();
        updatePartnerFromRequest(newPartner, request);

        return partnerRepository.save(newPartner);
    }

    @Transactional(readOnly = true)
    public List<Partner> findAllPartners() {
        return partnerRepository.findAll();
    }

    @Transactional
    public Partner updatePartner(Long id, PartnerRequest request) {
        Partner partner = partnerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("파트너 ID를 찾을 수 없음: " + id));

        updatePartnerFromRequest(partner, request);

        return partnerRepository.save(partner);
    }

    @Transactional
    public void deletePartner(Long id) {
        if (!partnerRepository.existsById(id)) {
            throw new IllegalArgumentException("파트너 ID를 찾을 수 없음: " + id);
        }
        partnerRepository.deleteById(id);
    }

    // DTO -> Entity 매핑 헬퍼 메서드
    private void updatePartnerFromRequest(Partner partner, PartnerRequest request) {
        partner.setName(request.getName());
        partner.setRep(request.getRep());
        partner.setTel(request.getTel());
        partner.setEmail(request.getEmail());
        partner.setMemo(request.getMemo());
    }
}