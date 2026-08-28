package com.mahasetu.interop.repository;

import com.mahasetu.interop.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long>, JpaSpecificationExecutor<AuditLog> {

    Optional<AuditLog> findByAuditId(String auditId);

    List<AuditLog> findByCitizenIdOrderByTimestampDesc(String citizenId);

    List<AuditLog> findTop100ByOrderByTimestampDesc();
}
