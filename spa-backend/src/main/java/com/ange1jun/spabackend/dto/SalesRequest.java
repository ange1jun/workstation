package com.ange1jun.spabackend.dto;

import com.ange1jun.spabackend.domain.Sales.SalesPriority;
import com.ange1jun.spabackend.domain.Sales.SalesStatus;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;
import lombok.Setter;

import java.util.Date;

@Getter @Setter
public class SalesRequest {

    private String title;
    private SalesPriority priority;
    private SalesStatus status;

    // 프론트엔드 input type="date"는 "yyyy-MM-dd" 형식을 보냅니다.
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd", timezone = "Asia/Seoul")
    private Date start_date;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd", timezone = "Asia/Seoul")
    private Date end_date;

    private Integer progress;
    private String content;

}