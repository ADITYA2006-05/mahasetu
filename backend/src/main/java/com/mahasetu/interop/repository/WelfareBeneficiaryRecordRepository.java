package com.mahasetu.interop.repository;

import com.mahasetu.interop.entity.WelfareBeneficiaryRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface WelfareBeneficiaryRecordRepository extends JpaRepository<WelfareBeneficiaryRecord, Long> {
    Optional<WelfareBeneficiaryRecord> findByBeneficiaryRecordId(String beneficiaryRecordId);
    List<WelfareBeneficiaryRecord> findByCitizenId(Long citizenId);

    @Query("SELECT w FROM WelfareBeneficiaryRecord w WHERE w.citizen.citizenId = :citizenId")
    Optional<WelfareBeneficiaryRecord> findFirstByCitizen_CitizenId(@Param("citizenId") String citizenId);

    @Query("SELECT COALESCE(SUM(w.monthlyStipendInr), 0) FROM WelfareBeneficiaryRecord w")
    BigDecimal sumTotalMonthlyStipendInr();

    @Query("SELECT w.disbursementStatus, COUNT(w) FROM WelfareBeneficiaryRecord w GROUP BY w.disbursementStatus")
    List<Object[]> countGroupedByDisbursementStatus();

    @Query("SELECT w.schemeName, COUNT(w) FROM WelfareBeneficiaryRecord w GROUP BY w.schemeName ORDER BY COUNT(w) DESC")
    List<Object[]> countGroupedByScheme();
}
