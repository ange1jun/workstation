package com.ange1jun.spabackend.domain;


import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;

import java.sql.Date;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@Table(name = "contract")
public class Contract {

    @OneToMany(mappedBy = "contract", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @ToString.Exclude
    private List<ContractItem> contractItems = new ArrayList<>();

    @OneToMany(mappedBy = "contract", fetch = FetchType.LAZY)
    @ToString.Exclude
    private List<Product> products = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    @ToString.Exclude
    private Company company;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 구분
    @Column(nullable = false, length = 50)
    private String category;

    // 진행여부
    @Column(nullable = false, length = 50)
    private String status;

    // 금액
    @Column(nullable = false, length = 50)
    private Long amount;

    // 계약명
    @Column(nullable = false, length = 50)
    private String name;

    // 고객사명
    @Column(nullable = false, length = 50)
    private String company_name;

    // 주 계약업체 (파트너사)
    @Column(nullable = false, length = 50)
    private String main_contractor;

    // 계약 담당자
    @Column(nullable = false, length = 50)
    private String main_contract;

    // 사업 시작 날짜
    @Column(nullable = false, length = 50)
    private Date start_date;

    // 사업 종료 날짜
    @Column(nullable = false, length = 50)
    private Date end_date;

    // 계약 날짜
    @Column(nullable = false, length = 50)
    private Date contract_date;

    // 하도급 업체
    @Column(nullable = true, length = 50)
    private String sub_contractor;

    // 하도급 담당자
    @Column(nullable = true, length = 50)
    private String sub_contract;

    public void addContractItem(ContractItem item) {
        this.contractItems.add(item);
        item.setContract(this);
    }
}
