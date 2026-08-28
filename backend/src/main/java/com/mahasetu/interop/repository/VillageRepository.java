package com.mahasetu.interop.repository;

import com.mahasetu.interop.entity.Village;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VillageRepository extends JpaRepository<Village, Long> {
    Optional<Village> findByVillageCode(String villageCode);
    long countByDistrictId(Long districtId);
}
