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

    // [추가] ID로 단건 조회 (Controller에서 상세 조회 및 이력 추가 시 사용)
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
        // 1. 부모 엔티티(Sales) 조회
        Sales sales = findSalesById(salesId);

        // 2. 자식 엔티티(SalesHistory) 생성
        SalesHistory history = new SalesHistory();
        history.setContent(reqDto.getContent());
        history.setRecordedDate(new Date()); // 현재 서버 시간 입력

        // 3. 연관관계 설정 (Sales 엔티티의 편의 메서드 사용)
        sales.addHistory(history);

        // 4. 저장 (Cascade 설정이 되어 있다면 sales가 저장될 때 history도 같이 저장됨)
        // 명시적으로 저장하려면 아래 주석 해제 (JPA Dirty Checking으로 인해 생략 가능)
        // salesRepository.save(sales);
    }

    @Transactional
    public void updateHistory(Long historyId, String content) {
        SalesHistory history = salesHistoryRepository.findById(historyId)
                .orElseThrow(() -> new IllegalArgumentException("이력을 찾을 수 없습니다. ID=" + historyId));
        history.setContent(content);
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