package com.ange1jun.spabackend.domain;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "Company")
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 고객사 기본정보
    // 고객사명
    @Column(nullable = false, length = 50)
    private String name;

    // 사업자등록번호
    @Column(length = 50)
    private String reg;

    // 회계담당자
    @Column(length = 255)
    private String rep;

    // 대표전화
    @Column(length = 50)
    private String tel;

    // 이메일
    @Column(length = 100)
    private String email;

    // 주소
    @Column(length = 100)
    private String address;

    // 메모
    @Lob // 대용량 텍스트 필드 (VARCHAR 범위를 넘을 경우)
    private String memo; // 메모/특이사항

}
