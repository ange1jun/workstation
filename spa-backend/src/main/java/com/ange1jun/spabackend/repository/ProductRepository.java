package com.ange1jun.spabackend.repository;

import com.ange1jun.spabackend.domain.Product;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // N+1 (Fetch Join)
    @Override
    @EntityGraph(attributePaths = {"productDetail"})
    List<Product> findAll();
}