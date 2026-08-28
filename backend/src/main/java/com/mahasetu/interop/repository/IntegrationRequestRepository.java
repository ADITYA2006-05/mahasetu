package com.mahasetu.interop.repository;

import com.mahasetu.interop.entity.IntegrationRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IntegrationRequestRepository extends JpaRepository<IntegrationRequest, Long> {
    Optional<IntegrationRequest> findByRequestId(String requestId);
    List<IntegrationRequest> findByCitizenIdOrderByCreatedAtDesc(String citizenId);
    List<IntegrationRequest> findTop20ByOrderByCreatedAtDesc();
    Page<IntegrationRequest> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
