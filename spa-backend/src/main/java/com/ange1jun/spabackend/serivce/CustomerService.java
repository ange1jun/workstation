package com.ange1jun.spabackend.serivce;


import com.ange1jun.spabackend.domain.Customer;
import com.ange1jun.spabackend.dto.CustomerRequest;
import com.ange1jun.spabackend.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;

    @Transactional
    public Customer saveNewCustomer(CustomerRequest request) {

        // DTO -> Entity
        Customer newCustomer = new Customer();
        newCustomer.setName(request.getName());
        newCustomer.setCompany(request.getCompany());
        newCustomer.setDepartment(request.getDepartment());
        newCustomer.setPart(request.getPart());
        newCustomer.setPosition(request.getPosition());
        newCustomer.setContact(request.getContact());
        newCustomer.setEmail(request.getEmail());
        newCustomer.setResponsibilities(request.getResponsibilities());
        newCustomer.setMemo(request.getMemo());

        return customerRepository.save(newCustomer);
    }


    @Transactional(readOnly = true)
    public List<Customer> findAllCustomer() {
        return customerRepository.findAll();
    }

    @Transactional
    public Customer updateCustomer(Long id, CustomerRequest request) {

        // ID로 고객 조회
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("직원 ID 찾을 수 없음: " + id));

        // DTO -> Entity 반영
        customer.setDepartment(request.getDepartment());
        customer.setPart(request.getPart());
        customer.setPosition(request.getPosition());
        customer.setContact(request.getContact());
        customer.setEmail(request.getEmail());
        customer.setResponsibilities(request.getResponsibilities());
        customer.setMemo(request.getMemo());

        return customerRepository.save(customer);
    }

    @Transactional
    public void deleteCustomer(Long id) {
        // 고객 ID 존재하지 않을 경우 -> 예외
        if (!customerRepository.existsById(id)) {
            throw new IllegalArgumentException("직원 ID 찾을 수 없음: " + id);
        }

        customerRepository.deleteById(id);
    }
}
