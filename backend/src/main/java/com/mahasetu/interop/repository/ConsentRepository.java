package com.mahasetu.interop.repository;

import com.mahasetu.interop.entity.Consent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ConsentRepository extends JpaRepository<Consent, Long> {

    Optional<Consent> findByConsentId(String consentId);

    List<Consent> findByCitizenIdOrderByCreatedAtDesc(String citizenId);

    List<Consent> findByCitizenIdAndStatusOrderByCreatedAtDesc(String citizenId, String status);

    List<Consent> findAllByOrderByCreatedAtDesc();

    @Query("SELECT c FROM Consent c WHERE c.citizenId = :citizenId " +
           "AND c.status = 'ACTIVE' " +
           "AND (c.expiresAt IS NULL OR c.expiresAt > :now) " +
           "AND c.purpose = :purpose " +
           "AND (c.requestingDepartment = :department OR c.requestingDepartment = 'ALL')")
    List<Consent> findValidActiveConsents(
            @Param("citizenId") String citizenId,
            @Param("department") String department,
            @Param("purpose") String purpose,
            @Param("now") OffsetDateTime now
    );
}
