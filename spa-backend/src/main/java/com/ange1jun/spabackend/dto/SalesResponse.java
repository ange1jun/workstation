package com.ange1jun.spabackend.dto;

import com.ange1jun.spabackend.domain.Sales;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Getter @Setter
@Builder
@AllArgsConstructor
public class SalesResponse {

    private Long id;
    private String title;
    private Sales.SalesPriority priority;
    private Sales.SalesStatus status;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd", timezone = "Asia/Seoul")
    private Date start_date;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd", timezone = "Asia/Seoul")
    private Date end_date;

    private Integer progress;
    private String content;

    private List<SalesHistoryResponse> histories;

    public static SalesResponse of(Sales sales) {
        return SalesResponse.builder()
                .id(sales.getId())
                .title(sales.getTitle())
                .priority(sales.getPriority())
                .status(sales.getStatus())
                .start_date(sales.getStartDate())
                .end_date(sales.getEndDate())
                .progress(sales.getProgress())
                .content(sales.getContent())
                .histories(sales.getHistories() != null ?
                        sales.getHistories().stream()
                                .map(SalesHistoryResponse::of)
                                .collect(Collectors.toList()) : null)
                .build();
    }
}