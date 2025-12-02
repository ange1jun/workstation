package com.ange1jun.spabackend.repository;

import com.ange1jun.spabackend.domain.SalesHistory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SalesHistoryRepository extends JpaRepository<SalesHistory, Long> {
}