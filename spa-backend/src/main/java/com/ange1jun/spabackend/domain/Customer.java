package com.ange1jun.spabackend.domain;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "Customer")
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 고객 기본정보
    @Column(nullable = false, length = 50)
    private String name;

    @Column(length = 50)
    private String company; // 회사

    @Column(length = 50)
    private String department; // 부서

    @Column(length = 50)
    private String part; // 파트

    @Column(length = 50)
    private String position; // 직급

    @Column(length = 20)
    private String contact; // 연락처

    @Column(length = 100)
    private String email; // 이메일

    @Column(length = 100)
    private String responsibilities; //담당업무

    @Lob // 대용량 텍스트 필드 (VARCHAR 범위를 넘을 경우)
    private String memo; // 메모/특이사항


}
