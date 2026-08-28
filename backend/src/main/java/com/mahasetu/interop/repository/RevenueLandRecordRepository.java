package com.mahasetu.interop.repository;

import com.mahasetu.interop.entity.RevenueLandRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface RevenueLandRecordRepository extends JpaRepository<RevenueLandRecord, Long> {
    Optional<RevenueLandRecord> findByRecordId(String recordId);
    Optional<RevenueLandRecord> findByKhataNumber(String khataNumber);
    List<RevenueLandRecord> findByCitizenId(Long citizenId);

    @Query("SELECT r FROM RevenueLandRecord r WHERE r.citizen.citizenId = :citizenId")
    Optional<RevenueLandRecord> findFirstByCitizen_CitizenId(@Param("citizenId") String citizenId);

    @Query("SELECT COALESCE(SUM(r.totalAreaHectares), 0) FROM RevenueLandRecord r")
    BigDecimal sumTotalAreaHectares();

    @Query("SELECT COALESCE(SUM(r.cultivableAreaHectares), 0) FROM RevenueLandRecord r")
    BigDecimal sumCultivableAreaHectares();

    @Query("SELECT r.landType, COUNT(r) FROM RevenueLandRecord r GROUP BY r.landType")
    List<Object[]> countGroupedByLandType();
}
