# System Design & Architecture Documentation

Please refer to the comprehensive architectural specification at:
- **[System Design Architecture Specification](../../ARCHITECTURE.md)**

### Key Highlights
- **Pre-Commit Trust Engine**: Algorithmic gatekeeper with 10 deterministic checks.
- **Decoupled Dual-State Persistence**: Fast PostgreSQL operational store + immutable Hyperledger Fabric ledger.
- **GS1 EPCIS 2.0 Mapping**: JSON-LD format with standardized CBV vocabulary.
- **Privacy-Preserving Off-Chain Evidence**: S3/MinIO storage + SHA-256 cryptographic anchoring.
