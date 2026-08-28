# MahaSetu (महासेतू) — System Architecture

**Government of Maharashtra State Digital Interoperability Gateway**  
**SIH26129 — Technical Architecture Specification**

---

## 1. Executive Architecture Overview

MahaSetu is designed as a **federated, zero-data-hoarding state interoperability gateway**. Rather than consolidating citizen records into a monolithic, vulnerable central database, MahaSetu orchestrates real-time, privacy-gated data exchange between sovereign departmental databases while guaranteeing:

1. **Zero Data Hoarding**: Department records remain solely inside departmental databases. MahaSetu persists only synthetic cross-references, active consent tokens, and cryptographic audit ledgers.
2. **Citizen-Centric Privacy**: Under the Digital Personal Data Protection (DPDP) principles, no officer query executes without active, scoped citizen consent.
3. **Semantic Schema Normalization**: Translates disparate departmental formats (snake_case, camelCase, nested legacy JSON) into one canonical MahaSetu standard model in memory.
4. **Fault-Tolerant High Availability**: Gracefully degrades during departmental gateway outages, returning partial records without system failure.

---

## 2. High-Level System Architecture Diagram

```mermaid
graph TD
    subgraph "Client Presentation Layer"
        CP[Citizen Self-Service Portal<br/>React + Tailwind]
        OP[Department Officer Console<br/>React + Tailwind]
        AP[State Admin & Telemetry<br/>React + Recharts]
    end

    subgraph "MahaSetu Gateway (Spring Boot 3.3 / Java 21)"
        GW[State Data Gateway / API Gateway]
        AUTH[Security & RBAC Engine<br/>HMAC-SHA256 JWT + BCrypt]
        CGK[Consent Gatekeeper & Scope Engine<br/>DPDP Compliance]
        IDMAP[Synthetic Identity Crosswalk]
        ORCH[Parallel Query Orchestrator]
        SCHEMA[Semantic Schema Mapping Engine]
        CANON[Canonical Model Builder]
        AUDIT[Immutable Audit Logger]
        MON[Gateway Health Monitor]
    end

    subgraph "State Persistence Cluster (PostgreSQL 16)"
        DB[(MahaSetu Ledger<br/>19 Tables, Synthetic Crosswalks,<br/>Consents & Audit Logs)]
    end

    subgraph "Sovereign Department Nodes (Simulated / Mock Gateways)"
        REV[Revenue & Forest Dept<br/>7/12 Land Records<br/>GET /api/mock/revenue/*]
        AGR[Dept of Agriculture<br/>Farmer Profiles & Crops<br/>GET /api/mock/agriculture/*]
        WEL[Social Justice & Welfare<br/>DBT & Pensions<br/>GET /api/mock/welfare/*]
    end

    %% Client to Gateway
    CP -->|HTTPS / JWT| GW
    OP -->|HTTPS / JWT| GW
    AP -->|HTTPS / JWT| GW

    %% Gateway Internal Pipeline
    GW --> AUTH
    AUTH --> CGK
    CGK --> IDMAP
    IDMAP --> ORCH
    ORCH -->|Async Parallel Query| REV
    ORCH -->|Async Parallel Query| AGR
    ORCH -->|Async Parallel Query| WEL

    REV -->|Legacy JSON| SCHEMA
    AGR -->|Legacy JSON| SCHEMA
    WEL -->|Legacy JSON| SCHEMA

    SCHEMA --> CANON
    CANON --> GW
    CANON -.-> AUDIT
    AUDIT --> DB
    CGK <--> DB
    IDMAP <--> DB
    MON --> REV & AGR & WEL
```

---

## 3. Core Architectural Principles

### 3.1. Zero-Data-Hoarding Principle
MahaSetu **never permanently stores** land records, crop data, or welfare disbursement details. It maintains only:
- A synthetic master citizen crosswalk (`MH-CIT-10001` $\rightarrow$ `REV-7-12-001`, `AGR-FARM-001`, `WEL-BEN-001`).
- Active citizen consents and permitted data scopes.
- Immutable audit ledger entries.

### 3.2. Stateless Security Architecture
All requests are verified statelessly using JSON Web Tokens (JJWT) signed with HMAC-SHA256. Role-Based Access Control (RBAC) is enforced at both the HTTP security filter chain and method-level security (`@PreAuthorize`).

### 3.3. Parallel Query Orchestration
When an authorized officer submits an interoperability request, MahaSetu dispatches parallel asynchronous HTTP calls to the selected departmental gateways. If one department is offline (e.g. during an outage), MahaSetu captures the failure, collects available data from healthy departments, and returns a structured `PARTIAL_SUCCESS` canonical response.

---

## 4. Network and Deployment Topology

```mermaid
flowchart LR
    subgraph "Frontend Layer (Port 5173)"
        Browser[Client Browser]
        Vite[Vite Single Page App]
    end

    subgraph "Application Layer (Port 8080)"
        SpringBoot[MahaSetu Spring Boot App]
        Actuator[Spring Actuator Metrics]
        OpenAPI[Swagger UI /openapi.json]
    end

    subgraph "Database Layer (Port 5432)"
        Postgres[(PostgreSQL 16 Database)]
    end

    Browser <-->|HTTP/REST| Vite
    Vite <-->|JSON over HTTP / CORS| SpringBoot
    SpringBoot <-->|JDBC / HikariCP| Postgres
```
