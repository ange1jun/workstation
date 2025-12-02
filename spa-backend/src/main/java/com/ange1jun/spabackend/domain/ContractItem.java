package com.ange1jun.spabackend.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.Builder;
import lombok.AllArgsConstructor;

@Entity
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "contract_items") // 테이블명 지정
public class ContractItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 어떤 계약에 속하는지 연결 (필수)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id")
    private Contract contract;

    // 품목 이름 (input name="name")
    @Column(nullable = false, length = 100)
    private String name;

    // 거래처명
    @Column(length = 100)
    private String vendorName;

    // 단가
    @Column(nullable = false)
    private Long unitPrice;

    // 수량
    @Column(nullable = false)
    private Integer quantity;

    // 부가세율
    @Column(nullable = false)
    private Double vatRate;

    // 공급가액 (단가 * 수량)
    @Column(name = "supply_value")
    private Long supplyValue;

    // 부가세액 (공급가액 * 부가세율)
    @Column(name = "vat_amount")
    private Long vatAmount;

    // 총 합계 (공급가액 + 부가세액)
    @Column(name = "total_amount")
    private Long totalAmount;

    public void calculateDetails() {
        if (this.unitPrice != null && this.quantity != null) {
            this.supplyValue = this.unitPrice * this.quantity;

            if (this.vatRate != null) {
                this.vatAmount = Math.round(this.supplyValue * this.vatRate);
            } else {
                this.vatAmount = 0L;
            }

            this.totalAmount = this.supplyValue + this.vatAmount;
        }
    }
}