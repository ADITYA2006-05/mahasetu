package com.mahasetu.interop.repository;

import com.mahasetu.interop.entity.ServiceRegistry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceRegistryRepository extends JpaRepository<ServiceRegistry, Long> {
    Optional<ServiceRegistry> findByServiceCode(String serviceCode);
    List<ServiceRegistry> findByDepartmentId(Long departmentId);
    long countByDepartmentId(Long departmentId);
}
