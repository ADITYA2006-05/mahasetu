# MahaSetu (महासेतू) — Integration Lifecycle & Orchestration

**Government of Maharashtra State Digital Interoperability Platform**  
**SIH26129 — Request Orchestration Specification**

---

## 1. Federated Integration Lifecycle Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor Officer as Department Officer
    participant GW as MahaSetu Gateway
    participant AUTH as JWT / Security Guard
    participant CGK as Consent Gatekeeper
    participant IDMAP as Synthetic ID Crosswalk
    participant REV as Revenue Node (Mock)
    participant AGR as Agriculture Node (Mock)
    participant WEL as Welfare Node (Mock)
    participant SCHEMA as Schema Engine
    participant AUDIT as Immutable Audit Log

    Officer->>GW: POST /api/integration/request { citizenId, purpose, depts }
    GW->>AUTH: Validate Bearer JWT Token & Officer Role
    AUTH-->>GW: OK (Authorized)

    GW->>CGK: Check Active Consent for Citizen + Purpose + Scopes
    alt Consent Invalid / Expired / Revoked
        CGK-->>GW: REJECT (CONSENT_REQUIRED)
        GW-->>Officer: 403 Forbidden { error: "CONSENT_REQUIRED" }
    else Consent Valid
        CGK-->>GW: ALLOW (Permitted Scopes: IDENTITY, LAND, AGR, WEL)
    end

    GW->>IDMAP: Resolve Synthetic IDs for Citizen
    IDMAP-->>GW: { REV: MH-REV-KH-10001, AGR: MH-AGR-REG-10001, WEL: MH-WEL-BR-10001 }

    par Query Revenue Gateway
        GW->>REV: GET /api/mock/revenue/citizens/MH-CIT-10001
        REV-->>GW: 200 OK (snake_case JSON)
    and Query Agriculture Gateway
        GW->>AGR: GET /api/mock/agriculture/farmers/MH-CIT-10001
        AGR-->>GW: 200 OK (camelCase JSON)
    and Query Welfare Gateway
        GW->>WEL: GET /api/mock/welfare/beneficiaries/MH-CIT-10001
        WEL-->>GW: 200 OK (nested JSON)
    end

    GW->>SCHEMA: Transform Disparate JSONs to Canonical Schema
    SCHEMA-->>GW: Standard Canonical Response Model

    GW->>AUDIT: Record Immutable Transaction Audit Entry
    AUDIT-->>GW: OK (Audit ID: AUD-XXXXXXXX)

    GW-->>Officer: 200 OK { status: "SUCCESS", canonical data, telemetry }
```

---

## 2. Fault Tolerance & Outage Failover Orchestration

MahaSetu implements resilient failover logic to prevent cascading system failures:

```mermaid
stateDiagram-v2
    [*] --> Dispatched
    Dispatched --> ParallelQueries
    ParallelQueries --> AllSuccessful: All 3 Nodes Online
    ParallelQueries --> PartialFailures: 1 or 2 Nodes Offline
    ParallelQueries --> TotalFailure: All Nodes Offline

    AllSuccessful --> SUCCESS: Return 100% Canonical Data
    PartialFailures --> PARTIAL_SUCCESS: Return Available Records + Diagnostics
    TotalFailure --> FAILED: Return Graceful Error Envelope (No Crash)

    SUCCESS --> PersistAudit
    PARTIAL_SUCCESS --> PersistAudit
    FAILED --> PersistAudit
    PersistAudit --> [*]
```

### Outage Handling Rules:
1. **Single Department Outage** (e.g. Agriculture Gateway Offline):
   - Revenue returns `SUCCESS` (Land records available).
   - Agriculture returns `OFFLINE FAILOVER` (`503 Service Unavailable` simulated).
   - Welfare returns `SUCCESS` (DBT benefits available).
   - Overall Request Status: `PARTIAL_SUCCESS`.
   - Result: Officer receives Land and Welfare records with a clear status badge that Agriculture is undergoing a temporary outage.
2. **Total Gateway Outage** (All 3 departments offline):
   - Handled gracefully with overall status `FAILED` and error diagnostics. The system **never crashes** with an unhandled 500 error.
