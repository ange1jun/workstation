package com.ange1jun.spabackend.domain;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "partner")
public class Partner {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 파트너사
    @Column(nullable = false, length = 50)
    private String name;

    // 담당자
    @Column(length = 50)
    private String rep;

    // 연락처
    @Column(length = 50)
    private String tel;

    // 이메일
    @Column(length = 100)
    private String email;

    // 메모
    @Lob // 대용량 텍스트 필드 (VARCHAR 범위를 넘을 경우)
    private String memo; // 메모/특이사항
}
