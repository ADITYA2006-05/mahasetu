package com.mahasetu.interop.repository;

import com.mahasetu.interop.entity.Citizen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CitizenRepository extends JpaRepository<Citizen, Long> {
    Optional<Citizen> findByCitizenId(String citizenId);
    boolean existsByCitizenId(String citizenId);

    @Query("SELECT c.district.districtCode, c.district.name, COUNT(c) FROM Citizen c GROUP BY c.district.districtCode, c.district.name ORDER BY COUNT(c) DESC")
    List<Object[]> countCitizensGroupedByDistrict();
}
