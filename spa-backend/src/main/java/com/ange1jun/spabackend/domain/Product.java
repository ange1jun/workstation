package com.ange1jun.spabackend.domain;

import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;

import java.util.Date;

@Entity @Data
@Table(name ="product")
public class Product {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id")
    @ToString.Exclude // 무한 루프 방지
    private Contract contract;

    @OneToOne(mappedBy = "product",
            cascade = CascadeType.ALL,
            fetch = FetchType.LAZY)
    @ToString.Exclude
    private ProductDetail productDetail;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 제품 카테고리
    @Column(length = 50)
    private String category;

    // 제품군
    @Column(length = 50)
    private String type;

    // 제품명
    @Column(length = 50)
    private String product_name;

    // S/N
    @Column(length = 50)
    private String product_serial;

    // 계약명
    @Column(nullable = false, length = 50)
    private String contract_name;

    // 계약 담당자
    @Column(nullable = false, length = 50)
    private String contract_master;

    // 도입년도
    @Column(nullable = false, length = 50)
    private Date introduction;

    // 파트너 계약
    @Column(nullable = false, length = 50)
    private Boolean partnership;

    // 메모
    @Lob // 대용량 텍스트 필드 (VARCHAR 범위를 넘을 경우)
    private String memo; // 메모/특이사항

    public String getContractName() {
        return (contract != null) ? contract.getName() : null;
    }

    public String getContractMaster() {
        return (contract != null) ? contract.getMain_contract() : null;
    }
}
