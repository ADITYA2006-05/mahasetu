package com.mahasetu.interop.repository;

import com.mahasetu.interop.entity.Taluka;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TalukaRepository extends JpaRepository<Taluka, Long> {
    Optional<Taluka> findByTalukaCode(String talukaCode);
}
