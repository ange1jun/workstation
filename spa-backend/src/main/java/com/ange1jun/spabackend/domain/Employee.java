package com.ange1jun.spabackend.domain;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name ="Employee")
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 직원 기본 정보
    @Column(nullable = false, length = 50)
    private String name;

    @Column(length = 50)
    private String company; // 회사

    @Column(length = 50)
    private String department; // 부서

    @Column(length = 50)
    private String position; // 직급

    @Column(length = 20)
    private String contact; // 연락처

    @Column(length = 100)
    private String email; // 이메일 (유니크, 필수)

    @Lob // 대용량 텍스트 필드 (VARCHAR 범위를 넘을 경우)
    private String note; // 메모/특이사항

}
