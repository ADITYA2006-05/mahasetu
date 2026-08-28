package com.mahasetu.interop.repository;

import com.mahasetu.interop.entity.ConsentScope;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConsentScopeRepository extends JpaRepository<ConsentScope, Long> {
    List<ConsentScope> findByConsent_ConsentId(String consentId);
}
