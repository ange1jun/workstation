package com.ange1jun.spabackend.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;
import lombok.Setter;

import java.util.Date;

@Getter @Setter
public class ProductRequest {

    private String category;
    private String type;
    private String product_name;
    private String product_serial;
    private String contract_name;
    private String contract_master;

    // 프론트 "yyyy-MM-dd" 문자열로 옴 -> Date 변환
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd", timezone = "Asia/Seoul")
    private Date introduction;

    private Boolean partnership;
    private String memo;

    // 1:1 상세 정보
    private ProductDetailRequest productDetail;

    @Getter @Setter
    public static class ProductDetailRequest {
        private String host_name;
        private String ip;
        private String detail_id;
        private String detail_pw;
        private String detail_os;
        private String os_version;
        private String detail_cpu;
        private String detail_memory;
        private String detail_disk;

        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd", timezone = "Asia/Seoul")
        private Date process_date;
    }
}