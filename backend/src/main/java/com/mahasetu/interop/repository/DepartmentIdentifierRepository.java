package com.mahasetu.interop.repository;

import com.mahasetu.interop.entity.DepartmentIdentifier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DepartmentIdentifierRepository extends JpaRepository<DepartmentIdentifier, Long> {
    Optional<DepartmentIdentifier> findByDepartmentIdAndDepartmentSpecificId(Long departmentId, String departmentSpecificId);
    List<DepartmentIdentifier> findByCitizenId(Long citizenId);
    long countByDepartmentId(Long departmentId);
}
