# MahaSetu API Specification (OpenAPI 3.0 Standard)
**Project**: MahaSetu — Government Digital Interoperability Platform (SIH26129)  
**Version**: 1.0.0-phase2  
**Base URL**: `http://localhost:8080` (or `/api` via Vite Reverse Proxy)

---

## Security & Authentication

MahaSetu uses **Spring Security 6** with **HMAC-SHA256 JSON Web Tokens (JWT)**.
Protected endpoints require an `Authorization` header:

```http
Authorization: Bearer <jwt_access_token>
```

### Predefined Roles (RBAC)
- `ROLE_ADMIN`: Full system administration, stats telemetry, and configuration.
- `ROLE_DEPARTMENT_OFFICER`: Sovereign departmental officer with domain-specific access (`REV`, `AGR`, `WEL`).
- `ROLE_CITIZEN`: Citizen user with self-service entitlement access.
- `ROLE_SYSTEM`: Automated service account for inter-departmental federation.

---

## Authentication Endpoints

### 1. User Authentication / Login
- **Endpoint**: `POST /api/auth/login`
- **Access**: Public
- **Description**: Authenticates a user by username or email and password, returning an access token and user profile.

#### Request Body
```json
{
  "usernameOrEmail": "admin",
  "password": "Admin@MahaSetu2026"
}
```

#### Success Response (`200 OK`)
```json
{
  "status": "SUCCESS",
  "message": "User authenticated successfully",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresInMs": 86400000,
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@mahasetu.gov.in",
    "fullName": "MahaSetu State Administrator",
    "phoneMasked": "+91-XXXXX-00001",
    "departmentCode": null,
    "citizenId": null,
    "roles": ["ROLE_ADMIN"],
    "active": true
  },
  "timestamp": "2026-08-27T23:55:00.000000+05:30"
}
```

#### Error Response (`401 Unauthorized`)
```json
{
  "status": 401,
  "error": "Unauthorized",
  "message": "Invalid username/email or password",
  "timestamp": "2026-08-27T23:55:00.000000+05:30"
}
```

---

### 2. User Registration
- **Endpoint**: `POST /api/auth/register`
- **Access**: Public
- **Description**: Registers a new synthetic citizen user account with default `ROLE_CITIZEN`.

#### Request Body
```json
{
  "username": "kailas.salunkhe",
  "email": "kailas@gov-synthetic.in",
  "password": "SecurePassword@2026",
  "fullName": "Kailas Pandurang Salunkhe",
  "phone": "9876543210",
  "citizenId": "MH-CIT-10009"
}
```

#### Success Response (`201 Created`)
```json
{
  "status": "SUCCESS",
  "message": "User registered successfully",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresInMs": 86400000,
  "user": {
    "id": 6,
    "username": "kailas.salunkhe",
    "email": "kailas@gov-synthetic.in",
    "fullName": "Kailas Pandurang Salunkhe",
    "phoneMasked": "+91-XXXXX-3210",
    "departmentCode": null,
    "citizenId": "MH-CIT-10009",
    "roles": ["ROLE_CITIZEN"],
    "active": true
  },
  "timestamp": "2026-08-27T23:55:00.000000+05:30"
}
```

---

### 3. Get Authenticated User Profile
- **Endpoint**: `GET /api/auth/me`
- **Access**: Authenticated (`ROLE_ADMIN`, `ROLE_DEPARTMENT_OFFICER`, `ROLE_CITIZEN`, `ROLE_SYSTEM`)
- **Headers**: `Authorization: Bearer <token>`

#### Success Response (`200 OK`)
```json
{
  "id": 1,
  "username": "admin",
  "email": "admin@mahasetu.gov.in",
  "fullName": "MahaSetu State Administrator",
  "phoneMasked": "+91-XXXXX-00001",
  "departmentCode": null,
  "citizenId": null,
  "roles": ["ROLE_ADMIN"],
  "active": true
}
```

---

## Interoperability Core Endpoints

### 4. Health Check
- **Endpoint**: `GET /api/health`
- **Access**: Public
- **Description**: Returns real-time health and database connectivity telemetry.

#### Success Response (`200 OK`)
```json
{
  "status": "UP",
  "service": "MahaSetu Interoperability Platform",
  "version": "1.0.0-phase2",
  "environment": "production-ready",
  "database": {
    "status": "CONNECTED",
    "dialect": "PostgreSQL",
    "entities_loaded": 14,
    "seeder_mode": "SYNTHETIC_CONSISTENT"
  },
  "timestamp": "2026-08-27T23:55:00.000000+05:30"
}
```

---

### 5. Administrative Platform Telemetry & Aggregation
- **Endpoint**: `GET /api/stats`
- **Access**: Protected (`ROLE_ADMIN`, `ROLE_SYSTEM`)
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Returns aggregated metrics across all 11 core entities, 3 departments, and 10 districts.

#### Unauthorized Response (`401 Unauthorized` - Missing Token)
```json
{
  "status": 401,
  "error": "Unauthorized",
  "message": "Full authentication is required to access this resource. Please provide a valid JWT Bearer token.",
  "path": "/api/stats",
  "timestamp": "2026-08-27T23:55:00.000000+05:30"
}
```

#### Forbidden Response (`403 Forbidden` - Insufficient Role, e.g. Citizen)
```json
{
  "status": 403,
  "error": "Forbidden",
  "message": "Access Denied. You do not possess the required departmental or administrative role to perform this operation.",
  "path": "/api/stats",
  "timestamp": "2026-08-27T23:55:00.000000+05:30"
}
```

---

## Phase 3: Mock Sovereign Department APIs

### 1. Revenue Department (7/12 Land Records)
- **Endpoint**: `GET /api/mock/revenue/citizens/{citizenId}`
- **Access**: Public / Authenticated
- **Example**: `GET /api/mock/revenue/citizens/MH-CIT-10001`
- **Response (`200 OK`)**:
```json
{
  "citizen_name": "Ramesh Tukaram Shinde",
  "district_name": "Pune",
  "taluka_name": "Haveli",
  "village_name": "Wagholi",
  "survey_no": "SN-101",
  "area_acres": 1.98
}
```

- **Health Endpoint**: `GET /api/mock/revenue/health`
- **Response (`200 OK`)**:
```json
{
  "department": "REV",
  "department_name": "Revenue & Forest Department (Legacy Land Record System)",
  "status": "UP",
  "gateway_state": "ONLINE",
  "service_code": "REV_LAND_RECORD_MOCK_V1",
  "latency_ms": 42,
  "timestamp": "2026-08-28T00:15:00+05:30"
}
```

---

### 2. Department of Agriculture (Farmer & Crop Profile)
- **Endpoint**: `GET /api/mock/agriculture/farmers/{citizenId}`
- **Access**: Public / Authenticated
- **Example**: `GET /api/mock/agriculture/farmers/MH-CIT-10001`
- **Response (`200 OK`)**:
```json
{
  "farmerName": "Ramesh Tukaram Shinde",
  "district": "Pune",
  "landSurveyNumber": "SN-101",
  "cropName": "Cotton",
  "season": "Kharif",
  "landUsage": "0.8000 Ha"
}
```

- **Health Endpoint**: `GET /api/mock/agriculture/health`

---

### 3. Social Justice & Welfare Department (Beneficiary Ledger)
- **Endpoint**: `GET /api/mock/welfare/beneficiaries/{citizenId}`
- **Access**: Public / Authenticated
- **Example**: `GET /api/mock/welfare/beneficiaries/MH-CIT-10001`
- **Response (`200 OK`)**:
```json
{
  "beneficiary_name": "Ramesh Tukaram Shinde",
  "scheme_code": "SCH-SGNY-01",
  "scheme_name": "Sanjay Gandhi Niradhar Anudan Yojana",
  "previous_benefit": true,
  "application_status": "APPROVED",
  "benefit_amount": 1500.0
}
```

- **Health Endpoint**: `GET /api/mock/welfare/health`

---

### 4. Admin Department Simulation API

#### Get Status of All Gateways
- **Endpoint**: `GET /api/mock/admin/departments/status`
- **Access**: `ROLE_ADMIN`

#### Update Department Status (Simulate Outage)
- **Endpoint**: `PUT /api/mock/admin/departments/{departmentCode}/status`
- **Access**: `ROLE_ADMIN`
- **Request Body**:
```json
{
  "status": "OFFLINE"
}
```
- **Response (`200 OK`)**:
```json
{
  "departmentCode": "REV",
  "departmentName": "Revenue & Forest Department",
  "status": "OFFLINE",
  "message": "Department gateway status successfully updated to OFFLINE",
  "updatedAt": "2026-08-28T00:15:00+05:30"
}
```
- **Error Response When OFFLINE (`503 Service Unavailable`)**:
```json
{
  "status": 503,
  "error": "Service Unavailable",
  "message": "Revenue & Forest Department (7/12) API gateway is currently OFFLINE (Simulated State Outage).",
  "path": "/api/mock/revenue/citizens/MH-CIT-10001",
  "timestamp": "2026-08-28T00:15:01+05:30"
}
```

