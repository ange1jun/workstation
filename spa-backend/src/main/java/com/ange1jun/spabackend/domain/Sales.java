package com.ange1jun.spabackend.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity
@Getter @Setter
@NoArgsConstructor
@Table(name = "sales")
public class Sales {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 중요도
    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private SalesPriority priority;

    // 제목
    @Column(nullable = false, length = 100)
    private String title;

    // 세부사항
    @Lob
    private String content;

    // 시작일
    @Column(name = "start_date", nullable = false)
    @Temporal(TemporalType.DATE)
    private Date startDate;

    // 종료일
    @Column(name = "end_date", nullable = false)
    @Temporal(TemporalType.DATE)
    private Date endDate;

    // 상태
    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private SalesStatus status;

    // 진행률 (0 ~ 100)
    @Column(nullable = false)
    private Integer progress;

    // --- Inner Enums ---
    public enum SalesPriority {
        LOW, MEDIUM, HIGH
    }

    public enum SalesStatus {
        SCHEDULED, IN_PROGRESS, COMPLETED
    }

    @OneToMany(mappedBy = "sales", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("recordedDate DESC, id DESC")
    private List<SalesHistory> histories = new ArrayList<>();

    public void addHistory(SalesHistory history) {
        this.histories.add(history);
        history.setSales(this);
    }
}