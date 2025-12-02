package com.ange1jun.spabackend.controller;

import com.ange1jun.spabackend.domain.Product;
import com.ange1jun.spabackend.dto.ProductRequest;
import com.ange1jun.spabackend.dto.ProductResponse;
import com.ange1jun.spabackend.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/product")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<List<ProductResponse>> getProducts() {
        List<Product> products = productService.findAllProducts();

        List<ProductResponse> responseList = products.stream()
                .map(ProductResponse::of)
                .collect(Collectors.toList());

        return ResponseEntity.ok(responseList);
    }

    @PostMapping
    public ResponseEntity<ProductResponse> registerProduct(@RequestBody ProductRequest request) {
        Product savedProduct = productService.saveProduct(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ProductResponse.of(savedProduct));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> updateProduct(@PathVariable Long id, @RequestBody ProductRequest request) {
        Product updatedProduct = productService.updateProduct(id, request);

        return ResponseEntity.ok(ProductResponse.of(updatedProduct));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
    }
}