package com.mahasetu.interop.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
    name = "consent_scopes",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_consent_scope", columnNames = {"consent_id", "data_scope"})
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConsentScope {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "consent_id", referencedColumnName = "consent_id", nullable = false)
    private Consent consent;

    @Column(name = "data_scope", nullable = false, length = 50)
    private String dataScope; // IDENTITY, LOCATION, LAND, AGRICULTURE, WELFARE
}
