package com.ange1jun.spabackend.domain;

import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;

import java.util.Date;

@Entity
@Data
@Table(name ="product_detail")
public class ProductDetail {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    @ToString.Exclude // 롬복 무한 루프 방지
    private Product product;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // hostname
    @Column(length = 50)
    private String host_name;

    // IP
    @Column(length = 50)
    private String ip;

    // ID
    @Column(length = 50)
    private String detail_id;

    // PW
    @Column(length = 50)
    private String detail_pw;

    // OS
    @Column(length = 50)
    private String detail_os;

    // OS ver
    @Column(length = 50)
    private String os_version;

    // CPU
    @Column(length = 50)
    private String detail_cpu;

    // MEMORY
    @Column(length = 50)
    private String detail_memory;

    // DISK
    @Column(length = 50)
    private String detail_disk;

    // 생성일자
    @Column(length = 50)
    private Date process_date;
}
