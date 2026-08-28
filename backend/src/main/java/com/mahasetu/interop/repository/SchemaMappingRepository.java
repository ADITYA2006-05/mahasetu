package com.mahasetu.interop.repository;

import com.mahasetu.interop.entity.SchemaMapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SchemaMappingRepository extends JpaRepository<SchemaMapping, Long> {
    List<SchemaMapping> findByEntityType(String entityType);
    List<SchemaMapping> findBySourceDepartmentId(Long sourceDepartmentId);
    List<SchemaMapping> findBySourceDepartment_DepartmentCodeAndIsActiveTrue(String departmentCode);
    List<SchemaMapping> findBySourceDepartment_DepartmentCode(String departmentCode);
    List<SchemaMapping> findByIsActiveTrue();
}
