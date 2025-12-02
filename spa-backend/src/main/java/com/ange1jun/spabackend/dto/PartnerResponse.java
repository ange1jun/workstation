package com.ange1jun.spabackend.dto;

import com.ange1jun.spabackend.domain.Partner;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class PartnerResponse {
    private Long id;
    private String name;
    private String rep;
    private String tel;
    private String email;
    private String memo;

    // Entity -> DTO
    public static PartnerResponse of(Partner partner) {
        return new PartnerResponse(
                partner.getId(),
                partner.getName(),
                partner.getRep(),
                partner.getTel(),
                partner.getEmail(),
                partner.getMemo()
        );
    }
}