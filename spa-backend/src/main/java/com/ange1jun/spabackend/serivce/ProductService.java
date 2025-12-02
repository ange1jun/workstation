package com.ange1jun.spabackend.service;

import com.ange1jun.spabackend.domain.Product;
import com.ange1jun.spabackend.domain.ProductDetail;
import com.ange1jun.spabackend.dto.ProductRequest;
import com.ange1jun.spabackend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public List<Product> findAllProducts() {
        return productRepository.findAll();
    }

    @Transactional
    public Product saveProduct(ProductRequest request) {
        Product product = new Product();
        updateProductFromRequest(product, request);

        // 상세 정보(ProductDetail) 처리
        if (request.getProductDetail() != null) {
            ProductDetail detail = new ProductDetail();
            updateDetailFromRequest(detail, request.getProductDetail());

            // 양방향 연관관계 설정 (중요)
            detail.setProduct(product);
            product.setProductDetail(detail);
        }

        return productRepository.save(product);
    }

    @Transactional
    public Product updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("제품을 찾을 수 없습니다. ID=" + id));

        // 기본 정보 업데이트
        updateProductFromRequest(product, request);

        // 상세 정보 업데이트
        if (request.getProductDetail() != null) {
            ProductDetail detail = product.getProductDetail();
            if (detail == null) {
                detail = new ProductDetail();
                detail.setProduct(product);
                product.setProductDetail(detail);
            }
            updateDetailFromRequest(detail, request.getProductDetail());
        }

        return productRepository.save(product);
    }

    @Transactional
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new IllegalArgumentException("삭제할 제품이 존재하지 않습니다. ID=" + id);
        }
        productRepository.deleteById(id);
    }

    private void updateProductFromRequest(Product product, ProductRequest request) {
        product.setCategory(request.getCategory());
        product.setType(request.getType());
        product.setProduct_name(request.getProduct_name());
        product.setProduct_serial(request.getProduct_serial());
        product.setContract_name(request.getContract_name());
        product.setContract_master(request.getContract_master());
        product.setIntroduction(request.getIntroduction());
        product.setPartnership(request.getPartnership());
        product.setMemo(request.getMemo());
    }

    private void updateDetailFromRequest(ProductDetail detail, ProductRequest.ProductDetailRequest requestDto) {
        detail.setHost_name(requestDto.getHost_name());
        detail.setIp(requestDto.getIp());
        detail.setDetail_id(requestDto.getDetail_id());
        detail.setDetail_pw(requestDto.getDetail_pw());
        detail.setDetail_os(requestDto.getDetail_os());
        detail.setOs_version(requestDto.getOs_version());
        detail.setDetail_cpu(requestDto.getDetail_cpu());
        detail.setDetail_memory(requestDto.getDetail_memory());
        detail.setDetail_disk(requestDto.getDetail_disk());
        detail.setProcess_date(requestDto.getProcess_date());
    }
}