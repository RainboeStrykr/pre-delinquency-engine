# System Architecture: Enterprise Pre-Delinquency Intelligence Platform

## 1. High-Level Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          PRESENTATION LAYER                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │   Dashboard  │  │  Real-time   │  │  Fairness    │  │ Intervention│ │
│  │   (Next.js)  │  │  Monitoring  │  │  Monitor     │  │   Studio    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↕ REST/WebSocket
┌─────────────────────────────────────────────────────────────────────────┐
│                          API GATEWAY LAYER                               │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  Next.js API Routes (/api/*)                                     │   │
│  │  - /api/risk/score          - /api/interventions/recommend       │   │
│  │  - /api/risk/acceleration   - /api/fairness/metrics              │   │
│  │  - /api/cashflow/project    - /api/stream/events (SSE)           │   │
│  │  - /api/archetypes/cluster  - /api/portfolio/migration           │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↕
┌─────────────────────────────────────────────────────────────────────────┐
│                       INTELLIGENCE ENGINE LAYER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │  Behavioral  │  │     Risk     │  │   Cashflow   │  │  Archetype  │ │
│  │    Drift     │  │ Acceleration │  │  Projection  │  │  Clustering │ │
│  │   Detector   │  │    Index     │  │    Engine    │  │   Engine    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └─────────────┘ │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │   Unified    │  │ Intervention │  │   Fairness   │  │    Noise    │ │
│  │    Stress    │  │ Recommender  │  │   Monitor    │  │  Suppressor │ │
│  │    Index     │  │  (Hybrid)    │  │              │  │             │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↕
┌─────────────────────────────────────────────────────────────────────────┐
│                      STREAMING & EVENT LAYER                             │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  Event Stream Simulator (Mock Kafka)                             │   │
│  │  - Transaction events    - Salary credit events                  │   │
│  │  - EMI payment events    - External bureau updates               │   │
│  │  - Balance snapshots     - Merchant category changes             │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  Event Processor (Windowed Aggregations)                         │   │
│  │  - 7-day rolling windows  - 30-day baseline computation          │   │
│  │  - Real-time drift calc   - Trigger threshold evaluation         │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↕
┌─────────────────────────────────────────────────────────────────────────┐
│                         DATA & MODEL LAYER                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │   Customer   │  │ Transaction  │  │   Feature    │  │    Model    │ │
│  │   Profiles   │  │   History    │  │    Store     │  │   Registry  │ │
│  │  (JSON/DB)   │  │  (Time-series│  │  (Computed)  │  │ (ONNX/JSON) │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

## 2. Technology Stack

### Core Platform
- **Frontend**: Next.js 16 (App Router), React 19, Chart.js, D3.js (for advanced viz)
- **API Layer**: Next.js API Routes (serverless functions)
- **State Management**: React Context + Zustand (for complex state)
- **Real-time**: Server-Sent Events (SSE) for streaming updates

### Intelligence Layer
- **ML Runtime**: ONNX Runtime (browser + server), TensorFlow.js (optional)
- **Numerical Computing**: math.js, simple-statistics
- **Time-series**: Custom windowing logic + rolling aggregations
- **Clustering**: ml-kmeans, ml-dbscan (JavaScript implementations)

### Data Layer
- **Primary Storage**: JSON files (for hackathon), SQLite (for production-like demo)
- **Time-series Cache**: In-memory circular buffers (for streaming simulation)
- **Feature Store**: Redis-like in-memory cache (using node-cache)

### Streaming Simulation
- **Event Generator**: Custom Node.js event emitter
- **Message Queue**: EventEmitter + async queues (bull-lite or custom)
- **Windowing**: Custom sliding window implementation

## 3. Data Flow Architecture

### A. Batch Processing Flow (Historical Analysis)
```
Customer Data → Feature Engineering → Model Inference → Risk Scoring
                      ↓
              Baseline Computation → Drift Detection Setup
                      ↓
              Archetype Clustering → Segment Assignment
                      ↓
              Portfolio Analytics → Migration Matrices
```

### B. Real-time Processing Flow (Streaming Events)
```
Event Stream → Event Parser → Window Aggregator → Feature Computation
                                                          ↓
                                                   Drift Detector
                                                          ↓
                                              Acceleration Calculator
                                                          ↓
                                              Threshold Evaluator
                                                          ↓
                                              Alert Generator
                                                          ↓
                                              Noise Suppressor
                                                          ↓
                                              Intervention Recommender
                                                          ↓
                                              Dashboard Update (SSE)
```

### C. Intervention Flow
```
Alert Trigger → Context Enrichment → Rule Engine → ML Recommender
                                                          ↓
                                              Fairness Check
                                                          ↓
                                              Priority Ranking
                                                          ↓
                                              Action Queue
                                                          ↓
                                              Dashboard Notification
```

## 4. API Structure

### 4.1 Risk Intelligence APIs

#### GET /api/risk/score/:customerId
```json
{
  "customerId": "CUST-2024-91047",
  "timestamp": "2026-02-16T21:00:00Z",
  "riskScore": 91,
  "riskLevel": "HIGH",
  "defaultProbability": 0.528,
  "unifiedStressIndex": 0.847,
  "components": {
    "baseRisk": 0.65,
    "behavioralDrift": 0.23,
    "accelerationFactor": 1.18,
    "cashflowStress": 0.89
  },
  "confidence": 0.92
}
```

#### GET /api/risk/acceleration/:customerId
```json
{
  "customerId": "CUST-2024-91047",
  "accelerationIndex": 1.18,
  "velocityMetrics": {
    "riskVelocity": 0.042,        // points per day
    "spendVelocity": -0.15,       // % change per day
    "balanceVelocity": -0.08      // % change per day
  },
  "projectedRisk30d": 96.2,
  "criticalityFlag": "URGENT",
  "daysToThreshold": 8
}
```

#### POST /api/risk/drift/detect
```json
{
  "customerId": "CUST-2024-91047",
  "metrics": [
    {
      "feature": "avg_daily_spend",
      "baseline": 2450.00,
      "current": 3890.00,
      "drift": 0.588,              // 58.8% increase
      "zScore": 2.34,
      "isDrifting": true,
      "severity": "HIGH"
    },
    {
      "feature": "transaction_frequency",
      "baseline": 18.5,
      "current": 12.3,
      "drift": -0.335,
      "zScore": -1.89,
      "isDrifting": true,
      "severity": "MEDIUM"
    }
  ],
  "overallDriftScore": 0.67,
  "driftingFeatures": 5
}
```

### 4.2 Projection & Forecasting APIs

#### GET /api/cashflow/project/:customerId
```json
{
  "customerId": "CUST-2024-91047",
  "projectionHorizon": 30,
  "projections": [
    {
      "day": 1,
      "expectedInflow": 0,
      "expectedOutflow": 1200,
      "projectedBalance": 4800,
      "stressLevel": "LOW"
    },
    {
      "day": 15,
      "expectedInflow": 0,
      "expectedOutflow": 18500,
      "projectedBalance": -8700,
      "stressLevel": "CRITICAL"
    }
  ],
  "criticalDays": [15, 20, 28],
  "shortfallAmount": 8700,
  "recoveryProbability": 0.23
}
```

### 4.3 Archetype & Clustering APIs

#### GET /api/archetypes/customer/:customerId
```json
{
  "customerId": "CUST-2024-91047",
  "archetype": "SALARY_DELAY_OVERSPENDER",
  "archetypeId": "A3",
  "confidence": 0.89,
  "characteristics": [
    "Consistent salary delays (14+ days)",
    "High discretionary spending",
    "Multiple EMI obligations",
    "Low savings buffer"
  ],
  "similarCustomers": 247,
  "defaultRate": 0.42,
  "recommendedInterventions": [
    "PAYMENT_PLAN_RESTRUCTURE",
    "SPENDING_COUNSELING"
  ]
}
```

#### GET /api/archetypes/clusters
```json
{
  "clusters": [
    {
      "id": "A1",
      "name": "STABLE_LOW_RISK",
      "size": 8151,
      "avgRisk": 22.3,
      "defaultRate": 0.018
    },
    {
      "id": "A3",
      "name": "SALARY_DELAY_OVERSPENDER",
      "size": 247,
      "avgRisk": 87.5,
      "defaultRate": 0.42
    }
  ],
  "totalClusters": 8,
  "silhouetteScore": 0.73
}
```

### 4.4 Intervention APIs

#### POST /api/interventions/recommend
```json
{
  "customerId": "CUST-2024-91047",
  "context": {
    "riskScore": 91,
    "archetype": "A3",
    "daysToEMI": 1,
    "currentBalance": 1200
  },
  "recommendations": [
    {
      "action": "EMERGENCY_PAYMENT_PLAN",
      "priority": 1,
      "confidence": 0.94,
      "expectedImpact": -15.2,      // risk reduction
      "channel": "SMS + CALL",
      "timing": "IMMEDIATE",
      "message": "Offer 7-day EMI extension with 0% penalty"
    },
    {
      "action": "CREDIT_LINE_TEMPORARY_INCREASE",
      "priority": 2,
      "confidence": 0.78,
      "expectedImpact": -8.5,
      "channel": "APP_NOTIFICATION",
      "timing": "WITHIN_24H"
    }
  ],
  "fairnessCheck": {
    "biasScore": 0.12,
    "protected": false,
    "approved": true
  }
}
```

### 4.5 Streaming & Real-time APIs

#### GET /api/stream/events (Server-Sent Events)
```javascript
// Client receives:
event: transaction
data: {"customerId":"CUST-2024-91047","amount":5600,"merchant":"ELECTRONICS","timestamp":"..."}

event: risk_update
data: {"customerId":"CUST-2024-91047","newRisk":92,"delta":1,"reason":"LARGE_TRANSACTION"}

event: alert
data: {"customerId":"CUST-2024-91047","type":"DRIFT_DETECTED","severity":"HIGH"}
```

### 4.6 Portfolio Analytics APIs

#### GET /api/portfolio/migration
```json
{
  "period": "30_DAYS",
  "migrationMatrix": {
    "LOW_TO_MEDIUM": 142,
    "LOW_TO_HIGH": 8,
    "MEDIUM_TO_HIGH": 89,
    "MEDIUM_TO_LOW": 67,
    "HIGH_TO_MEDIUM": 23
  },
  "netDegradation": 149,
  "improvementRate": 0.07,
  "degradationRate": 0.19,
  "portfolioHealthIndex": 0.73
}
```

#### GET /api/fairness/metrics
```json
{
  "period": "30_DAYS",
  "metrics": {
    "demographicParity": 0.89,
    "equalizedOdds": 0.92,
    "predictiveParity": 0.87
  },
  "segmentAnalysis": [
    {
      "segment": "AGE_25_35",
      "avgRisk": 45.2,
      "interventionRate": 0.18,
      "falsePositiveRate": 0.12
    }
  ],
  "alerts": []
}
```

## 5. Directory Structure

```
/pre-delinquency-engine
├── /app
│   ├── /api
│   │   ├── /risk
│   │   │   ├── score/[customerId]/route.js
│   │   │   ├── acceleration/[customerId]/route.js
│   │   │   └── drift/detect/route.js
│   │   ├── /cashflow
│   │   │   └── project/[customerId]/route.js
│   │   ├── /archetypes
│   │   │   ├── customer/[customerId]/route.js
│   │   │   └── clusters/route.js
│   │   ├── /interventions
│   │   │   └── recommend/route.js
│   │   ├── /stream
│   │   │   └── events/route.js
│   │   ├── /portfolio
│   │   │   └── migration/route.js
│   │   └── /fairness
│   │       └── metrics/route.js
│   ├── page.js
│   ├── layout.js
│   └── globals.css
│
├── /lib
│   ├── /engines
│   │   ├── behavioral-drift.js
│   │   ├── risk-acceleration.js
│   │   ├── cashflow-projection.js
│   │   ├── archetype-clustering.js
│   │   ├── unified-stress-index.js
│   │   ├── intervention-recommender.js
│   │   ├── fairness-monitor.js
│   │   └── noise-suppressor.js
│   │
│   ├── /streaming
│   │   ├── event-generator.js
│   │   ├── event-processor.js
│   │   └── window-aggregator.js
│   │
│   ├── /ml
│   │   ├── model-loader.js
│   │   ├── feature-engineering.js
│   │   └── inference.js
│   │
│   └── /utils
│       ├── math-helpers.js
│       ├── time-series.js
│       └── statistics.js
│
├── /components
│   ├── /intelligence
│   │   ├── DriftMonitor.js
│   │   ├── AccelerationGauge.js
│   │   ├── CashflowTimeline.js
│   │   ├── ArchetypeCard.js
│   │   └── StressIndexMeter.js
│   │
│   ├── /realtime
│   │   ├── EventStream.js
│   │   ├── LiveRiskFeed.js
│   │   └── AlertPanel.js
│   │
│   └── /existing...
│
├── /data
│   ├── customers.js
│   ├── transactions.js (NEW)
│   ├── baselines.js (NEW)
│   └── models/ (NEW)
│       ├── risk-model.json
│       └── archetype-centroids.json
│
└── /public
    └── /models
        └── risk-classifier.onnx (optional)
```

## 6. Deployment Architecture (Production-Ready)

```
┌─────────────────────────────────────────────────────────────┐
│                         VERCEL EDGE                          │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Next.js App (Static + SSR)                            │  │
│  │  - Dashboard pages                                     │  │
│  │  - API Routes (Serverless Functions)                   │  │
│  └────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Supabase   │  │   Upstash    │  │   Vercel     │      │
│  │   (Postgres) │  │   (Redis)    │  │   (Storage)  │      │
│  │   [Optional] │  │  [Features]  │  │   [Models]   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## 7. Key Architectural Decisions

### Decision 1: Serverless-First
- **Rationale**: Next.js API routes scale automatically, zero DevOps overhead
- **Trade-off**: Cold starts (mitigated with edge functions)

### Decision 2: In-Memory Feature Store
- **Rationale**: Sub-millisecond feature retrieval, perfect for real-time scoring
- **Trade-off**: Limited to single instance (use Redis for multi-instance)

### Decision 3: ONNX for ML Models
- **Rationale**: Cross-platform, fast inference, no Python runtime needed
- **Trade-off**: Model conversion required (from scikit-learn/PyTorch)

### Decision 4: SSE over WebSockets
- **Rationale**: Simpler implementation, auto-reconnect, HTTP/2 compatible
- **Trade-off**: Unidirectional (sufficient for dashboard updates)

### Decision 5: JSON-Based Data Layer
- **Rationale**: Zero setup, version-controllable, perfect for hackathon
- **Trade-off**: Not production-scale (migrate to Postgres/Supabase later)

## 8. Performance Targets

| Metric | Target | Strategy |
|--------|--------|----------|
| API Response Time | < 100ms | In-memory caching, pre-computed features |
| Dashboard Load | < 2s | Code splitting, lazy loading, SSR |
| Real-time Latency | < 500ms | SSE with 100ms event batching |
| Concurrent Users | 100+ | Serverless auto-scaling |
| Model Inference | < 50ms | ONNX runtime, batch predictions |

## 9. Security & Compliance

- **Authentication**: NextAuth.js (for demo: mock auth)
- **Authorization**: Role-based access control (RBAC)
- **Data Privacy**: PII masking in logs, encrypted storage
- **Audit Trail**: All interventions logged with timestamps
- **Fairness**: Automated bias detection in recommendations

## 10. Next Steps

1. ✅ Architecture defined
2. ⏭️ ML & Feature Design (next artifact)
3. ⏭️ Advanced Innovation Layer
4. ⏭️ Dashboard Enhancements
5. ⏭️ Demo Walkthrough Strategy
