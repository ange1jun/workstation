package com.ange1jun.spabackend.dto;

import com.ange1jun.spabackend.domain.ContractItem;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ContractItemDto {
    private String name;        // 품목명
    private String vendorName;  // 거래처명
    private Long unitPrice;     // 단가
    private Integer quantity;   // 수량
    private Double vatRate;     // 부가세율
    private Long supplyValue;   // 공급가액
    private Long vatAmount;     // 부가세액
    private Long totalAmount;   // 합계

    // Entity -> DTO 변환 메서드 (조회용)
    public static ContractItemDto from(ContractItem entity) {
        ContractItemDto dto = new ContractItemDto();
        dto.setName(entity.getName());
        dto.setVendorName(entity.getVendorName());
        dto.setUnitPrice(entity.getUnitPrice());
        dto.setQuantity(entity.getQuantity());
        dto.setVatRate(entity.getVatRate());

        dto.setSupplyValue(entity.getSupplyValue());
        dto.setVatAmount(entity.getVatAmount());
        dto.setTotalAmount(entity.getTotalAmount());

        return dto;
    }
}