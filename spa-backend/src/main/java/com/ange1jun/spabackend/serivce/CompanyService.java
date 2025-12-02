package com.ange1jun.spabackend.serivce;


import com.ange1jun.spabackend.domain.Company;
import com.ange1jun.spabackend.dto.CompanyRequest;
import com.ange1jun.spabackend.repository.CompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CompanyService {

    private final CompanyRepository companyRepository;

    @Transactional
    public Company saveNewCompany(CompanyRequest request) {

        // DTO -> Entity
        Company newCompany = new Company();
        newCompany.setName(request.getName());
        newCompany.setReg((request.getReg()));
        newCompany.setRep((request.getRep()));
        newCompany.setTel((request.getTel()));
        newCompany.setEmail((request.getEmail()));
        newCompany.setAddress((request.getAddress()));
        newCompany.setMemo((request.getMemo()));

        return companyRepository.save(newCompany);
    }

    @Transactional(readOnly = true)
    public List<Company> findAllCompany() {
        return companyRepository.findAll();
    }

    @Transactional
    public Company updateCompany(Long id, CompanyRequest request) {

        // ID로 고객 조회
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("고객사 ID 찾을 수 없음: " + id));

        // DTO -> Entity 반영
        company.setName((request.getName()));
        company.setReg((request.getReg()));
        company.setRep((request.getRep()));
        company.setTel((request.getTel()));
        company.setEmail((request.getEmail()));
        company.setAddress((request.getAddress()));
        company.setMemo((request.getMemo()));

        return companyRepository.save(company);
    }

    @Transactional
    public void deleteCompany(Long id) {
        // 고객 ID 존재하지 않을 경우 -> 예외
        if (!companyRepository.existsById(id)) {
            throw new IllegalArgumentException("고객사 ID 찾을 수 없음: " + id);
        }

        companyRepository.deleteById(id);
    }
}
