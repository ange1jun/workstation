package com.ange1jun.spabackend.dto;


import com.ange1jun.spabackend.domain.SalesHistory;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Date;

@Getter
@Setter
@Builder
public class SalesHistoryResponse {

    private Long id;
    private String content;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime recordedDate;

    // Entity -> DTO 변환 메서드
    public static SalesHistoryResponse of(SalesHistory history) {
        return SalesHistoryResponse.builder()
                .id(history.getId())
                .content(history.getContent())
                .recordedDate(history.getRecordedDate())
                .build();
    }
}
