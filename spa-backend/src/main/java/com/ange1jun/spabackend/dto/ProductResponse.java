package com.ange1jun.spabackend.dto;

import com.ange1jun.spabackend.domain.Product;
import com.ange1jun.spabackend.domain.ProductDetail;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.Date;

@Getter @Setter
@Builder
@AllArgsConstructor
public class ProductResponse {

    private Long id;
    private String category;
    private String type;
    private String product_name;
    private String product_serial;
    private String contract_name;
    private String contract_master;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd", timezone = "Asia/Seoul")
    private Date introduction;

    private Boolean partnership;
    private String memo;

    // 상세 정보 포함
    private ProductDetailResponse productDetail;

    @Getter @Setter
    @Builder
    @AllArgsConstructor
    public static class ProductDetailResponse {
        private Long id;
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

        public static ProductDetailResponse of(ProductDetail detail) {
            if (detail == null) return null;
            return ProductDetailResponse.builder()
                    .id(detail.getId())
                    .host_name(detail.getHost_name())
                    .ip(detail.getIp())
                    .detail_id(detail.getDetail_id())
                    .detail_pw(detail.getDetail_pw())
                    .detail_os(detail.getDetail_os())
                    .os_version(detail.getOs_version())
                    .detail_cpu(detail.getDetail_cpu())
                    .detail_memory(detail.getDetail_memory())
                    .detail_disk(detail.getDetail_disk())
                    .process_date(detail.getProcess_date())
                    .build();
        }
    }

    public static ProductResponse of(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .category(product.getCategory())
                .type(product.getType())
                .product_name(product.getProduct_name())
                .product_serial(product.getProduct_serial())
                .contract_name(product.getContract_name())
                .contract_master(product.getContract_master())
                .introduction(product.getIntroduction())
                .partnership(product.getPartnership())
                .memo(product.getMemo())
                .productDetail(ProductDetailResponse.of(product.getProductDetail()))
                .build();
    }
}