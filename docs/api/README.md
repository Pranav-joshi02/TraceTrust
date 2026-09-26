# TrustTrace REST API Reference

The TrustTrace API is built using **NestJS** and provides modular REST endpoints across the supply chain lifecycle.

## Base URL
- Local Development: `http://localhost:4000/api`
- Default Port: `4000`

## Core Modules & Endpoints

| Resource | Method | Path | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/auth/login` | Authenticate operator & retrieve JWT bearer token |
| **Auth** | `GET` | `/auth/profile` | Current authenticated user & organization profile |
| **Health** | `GET` | `/health` | Service liveness & database connectivity probe |
| **Products** | `GET` | `/products` | List all registered products & GTIN codes |
| **Products** | `POST` | `/products` | Register a new product catalog item |
| **Batches** | `GET` | `/batches` | List product batches with pagination & filters |
| **Batches** | `POST` | `/batches` | Mint a new production or harvest batch |
| **Batches** | `GET` | `/batches/:id` | Retrieve batch details and state machine status |
| **Events** | `GET` | `/events` | Stream and filter supply chain trace events |
| **Events** | `POST` | `/events` | Ingest a new trace event (triggers Trust Engine) |
| **Trust** | `GET` | `/trust/verify/:id` | Execute 10-point algorithmic trust evaluation |
| **Traceability** | `GET` | `/traceability/graph/:batchId` | Retrieve forward/backward provenance DAG |
| **Traceability** | `GET` | `/traceability/verify/:code` | Public consumer provenance projection |
| **Recalls** | `POST` | `/recalls` | Initiate emergency product recall across downstream batches |
| **Evidence** | `POST` | `/evidence/upload` | Upload supporting document & calculate SHA-256 |
| **Certificates** | `GET` | `/certificates` | List accredited compliance & ISO certificates |
| **Disputes** | `POST` | `/disputes` | Raise transaction dispute for auditor review |
| **Audits** | `GET` | `/audits` | Query immutable audit log stream |
