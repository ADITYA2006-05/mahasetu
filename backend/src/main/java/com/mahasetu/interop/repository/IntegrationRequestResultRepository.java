package com.mahasetu.interop.repository;

import com.mahasetu.interop.entity.IntegrationRequestResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IntegrationRequestResultRepository extends JpaRepository<IntegrationRequestResult, Long> {
    List<IntegrationRequestResult> findByIntegrationRequest_RequestId(String requestId);
}
