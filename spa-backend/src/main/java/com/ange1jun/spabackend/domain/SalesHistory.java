package com.ange1jun.spabackend.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

import java.time.LocalDateTime;
import java.util.Date;

@Entity
@Getter @Setter
@NoArgsConstructor
@Table(name = "sales_history")
public class SalesHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Lob
    @Column(nullable = false)
    private String content;

    @LastModifiedDate
    @Column(name = "recorded_date", nullable = false) // updatable = false 제거!
    private LocalDateTime recordedDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sales_id")
    private Sales sales;
}