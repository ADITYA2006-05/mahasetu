package com.mahasetu.interop.repository;

import com.mahasetu.interop.entity.AgricultureFarmerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface AgricultureFarmerProfileRepository extends JpaRepository<AgricultureFarmerProfile, Long> {
    Optional<AgricultureFarmerProfile> findByProfileId(String profileId);
    Optional<AgricultureFarmerProfile> findByCitizenId(Long citizenId);

    @Query("SELECT p FROM AgricultureFarmerProfile p WHERE p.citizen.citizenId = :citizenId")
    Optional<AgricultureFarmerProfile> findFirstByCitizen_CitizenId(@Param("citizenId") String citizenId);

    @Query("SELECT p.farmerCategory, COUNT(p) FROM AgricultureFarmerProfile p GROUP BY p.farmerCategory")
    List<Object[]> countGroupedByFarmerCategory();

    @Query("SELECT p.primaryCrop, COUNT(p) FROM AgricultureFarmerProfile p GROUP BY p.primaryCrop ORDER BY COUNT(p) DESC")
    List<Object[]> countGroupedByPrimaryCrop();

    @Query("SELECT COALESCE(SUM(p.subsidyAvailedInr), 0) FROM AgricultureFarmerProfile p")
    BigDecimal sumTotalSubsidiesInr();
}
