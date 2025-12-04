package com.ange1jun.spabackend.service;

import com.ange1jun.spabackend.domain.Sales;
import com.ange1jun.spabackend.domain.SalesHistory;
import com.ange1jun.spabackend.dto.SalesHistoryRequest;
import com.ange1jun.spabackend.dto.SalesRequest;
import com.ange1jun.spabackend.repository.SalesHistoryRepository;
import com.ange1jun.spabackend.repository.SalesRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SalesService {

    private final SalesRepository salesRepository;
    private final SalesHistoryRepository salesHistoryRepository;

    @Transactional(readOnly = true)
    public List<Sales> findAllSales() {
        return salesRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Sales findSalesById(Long id) {
        return salesRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 영업 건을 찾을 수 없습니다. ID=" + id));
    }

    @Transactional
    public Sales saveSales(SalesRequest request) {
        Sales sales = new Sales();
        updateSalesFromRequest(sales, request);
        return salesRepository.save(sales);
    }

    @Transactional
    public Sales updateSales(Long id, SalesRequest request) {
        Sales sales = findSalesById(id); // 중복 로직 제거하고 위 메서드 재사용
        updateSalesFromRequest(sales, request);
        return salesRepository.save(sales);
    }

    @Transactional
    public void deleteSales(Long id) {
        if (!salesRepository.existsById(id)) {
            throw new IllegalArgumentException("해당 영업 건을 찾을 수 없습니다. ID=" + id);
        }
        salesRepository.deleteById(id);
    }

    @Transactional
    public void addHistory(Long salesId, SalesHistoryRequest reqDto) {
        Sales sales = findSalesById(salesId);

        SalesHistory history = new SalesHistory();
        history.setContent(reqDto.getContent());
        history.setRecordedDate(LocalDateTime.now());

        sales.addHistory(history);

        salesRepository.save(sales);
    }

    @Transactional
    public void updateHistory(Long historyId, String content) {
        SalesHistory history = salesHistoryRepository.findById(historyId)
                .orElseThrow(() -> new IllegalArgumentException("이력을 찾을 수 없습니다. ID=" + historyId));
        history.setContent(content);

        history.setRecordedDate(LocalDateTime.now());
    }

    @Transactional
    public void deleteHistory(Long historyId) {
        if (!salesHistoryRepository.existsById(historyId)) {
            throw new IllegalArgumentException("이력을 찾을 수 없습니다. ID=" + historyId);
        }
        salesHistoryRepository.deleteById(historyId);
    }

    // DTO -> Entity 매핑 헬퍼 메서드
    private void updateSalesFromRequest(Sales sales, SalesRequest request) {
        sales.setTitle(request.getTitle());
        sales.setPriority(request.getPriority());
        sales.setStatus(request.getStatus());
        sales.setStartDate(request.getStart_date());
        sales.setEndDate(request.getEnd_date());
        sales.setProgress(request.getProgress());
        sales.setContent(request.getContent());
    }
}