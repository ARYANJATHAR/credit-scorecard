# Credit Scorecard — MSME Lending Decision System

A full-stack lending decision app where you enter a business profile and loan request, and the system returns an instant decision (approved/rejected) with a 0–100 credit score, calculated EMI, and clear reason codes, with audit events recorded when the audit store is available.

## Tech Stack

| Layer    | Technology                                   |
| -------- | -------------------------------------------- |
| Frontend | React 18, Vite, Tailwind CSS, react-hook-form, Zod |
| Backend  | Node.js, Express                             |
| Database | PostgreSQL (structured data), MongoDB (audit logs) |
| Infra    | Docker Compose (local), Vercel + Render (prod)     |

---

## Getting Started

### Prerequisites

- Node.js >= 18
- PostgreSQL 15+
- MongoDB 6+
- (Optional) Docker & Docker Compose

### Option A: Local Setup

**1. Clone the repo**

```bash
git clone https://github.com/<your-username>/credit-scorecard.git
cd credit-scorecard
```

**2. Start PostgreSQL and MongoDB**

- Create a local PostgreSQL database named `credit_scorecard`.
- Start MongoDB locally on port `27017`.

Example PostgreSQL commands:

```bash
psql -U postgres -c "CREATE DATABASE credit_scorecard;"
psql -U postgres -d credit_scorecard
```

**3. Backend**

```bash
cd backend
cp .env.example .env
# Uses:
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/credit_scorecard
# MONGO_URI=mongodb://localhost:27017/credit_scorecard
npm install
npm run dev
```

The backend runs at `http://localhost:5000`.

On startup, the backend automatically initializes PostgreSQL using `backend/src/models/pg/schema.sql`, so you do not need to run the schema manually in the normal local flow.

**4. Frontend**

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

The frontend runs at `http://localhost:5173` and proxies API calls to the backend.

### Using SQL Locally

After the backend starts, connect to PostgreSQL with:

```bash
psql postgresql://postgres:postgres@localhost:5432/credit_scorecard
```

Useful commands inside `psql`:

```sql
\dt
SELECT * FROM businesses;
SELECT * FROM loan_applications;
SELECT * FROM decisions;
```

Example query to inspect applications with their business and decision data:

```sql
SELECT
  b.owner_name,
  b.pan,
  la.id AS application_id,
  la.loan_amount,
  la.tenure_months,
  d.status,
  d.credit_score,
  d.reason_codes,
  d.emi_calculated
FROM businesses b
JOIN loan_applications la ON la.business_id = b.id
LEFT JOIN decisions d ON d.application_id = la.id
ORDER BY la.created_at DESC;
```

If you want to apply the schema manually for any reason, run:

```bash
psql postgresql://postgres:postgres@localhost:5432/credit_scorecard -f backend/src/models/pg/schema.sql
```

### Option B: Docker Compose

```bash
docker compose up --build
```

This starts PostgreSQL, MongoDB, the backend, and the frontend. Access the app at `http://localhost:5173`.

To open PostgreSQL inside Docker and run SQL commands:

```bash
docker compose exec postgres psql -U postgres -d credit_scorecard
```

---

## API Documentation

All responses follow this envelope:

```json
// Success
{ "success": true, "data": { ... } }

// Error
{ "success": false, "error": { "code": "...", "message": "...", "details": [...] } }
```

### `GET /api/health`

Check API readiness and dependency status.

**Success response (200):**

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "dependencies": {
      "postgres": "up",
      "mongo": "up"
    }
  }
}
```

If MongoDB is unavailable, the API stays online and returns `status: "degraded"` while audit logging is skipped.

### `POST /api/v1/application`

Submit a new loan application.

**Request body:**

```json
{
  "ownerName": "Rajesh Kumar",
  "pan": "ABCDE1234F",
  "businessType": "retail",
  "monthlyRevenue": 500000,
  "loanAmount": 2000000,
  "tenureMonths": 24,
  "purpose": "Expanding retail store inventory"
}
```

**Success response (201):**

```json
{
  "success": true,
  "data": {
    "applicationId": "a1b2c3d4-..."
  }
}
```

**Validation error (400):**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      { "field": "pan", "message": "Invalid PAN format (expected: ABCDE1234F)" }
    ]
  }
}
```

---

## Decision Logic Explanation

The scoring engine in `backend/src/services/decisionEngine.js` uses a transparent rule-based approach:

1. Start score at **100**.
2. Compute EMI using simplified formula: `emi = loanAmount / tenureMonths`.
3. Apply deductions for risk signals (EMI ratio, loan multiple, PAN validity, tenure, low revenue, and data inconsistency).
4. Clamp final score between **0 and 100**.
5. Return:
   - `status` (`APPROVED` / `REJECTED`)
   - `creditScore`
   - `reasonCodes`
   - `emiCalculated`

Decision threshold:
- **Score >= 60** -> `APPROVED`
- **Score < 60** -> `REJECTED`

---

### `POST /api/v1/decision/:applicationId`

Generate a credit decision for an existing application.

This endpoint is idempotent: once a decision exists for an application, repeated `POST` requests return the same decision instead of creating duplicates.

**Success response (201 on first decision, 200 on repeats):**

```json
{
  "success": true,
  "data": {
    "status": "APPROVED",
    "creditScore": 85,
    "reasonCodes": [],
    "emiCalculated": 83333.33,
    "createdAt": "2025-01-15T10:30:00.000Z"
  }
}
```

**Not found (404):**

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Application a1b2c3d4-... not found"
  }
}
```

**Invalid route parameter (400):**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid route parameter",
    "details": [
      { "field": "applicationId", "message": "Application ID must be a valid UUID" }
    ]
  }
}
```

**Rate limited (429):**

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many decision requests. Please try again after 2 minutes."
  }
}
```

---

### `GET /api/v1/decision/:applicationId`

Retrieve a previously generated decision (useful for async polling).

**Success response (200):**

```json
{
  "success": true,
  "data": {
    "status": "REJECTED",
    "creditScore": 35,
    "reasonCodes": ["HIGH_EMI_RATIO", "HIGH_LOAN_RATIO"],
    "emiCalculated": 416666.67,
    "createdAt": "2025-01-15T10:30:00.000Z"
  }
}
```

---

## Decision Logic

The decision engine starts every application at a perfect score of **100** and deducts points based on risk signals. A final score of **60 or above** results in approval.

### Scoring Signals

| # | Signal | Condition | Score Impact | Reason Code |
|---|--------|-----------|-------------|-------------|
| 1 | EMI-to-Revenue Ratio | EMI > 50% of monthly revenue | **-35** | `HIGH_EMI_RATIO` |
| 1 | EMI-to-Revenue Ratio | EMI between 35%-50% of revenue | **-15** | `MODERATE_EMI_RATIO` |
| 2 | Loan-to-Revenue Multiple | Loan > 10x monthly revenue | **-30** | `HIGH_LOAN_RATIO` |
| 2 | Loan-to-Revenue Multiple | Loan between 6x-10x revenue | **-15** | `ELEVATED_LOAN_RATIO` |
| 3 | PAN Validation | Does not match `[A-Z]{5}[0-9]{4}[A-Z]` | **-20** | `INVALID_PAN` |
| 4 | Tenure Check | < 3 months or > 84 months | **-10** | `UNUSUAL_TENURE` |
| 5 | Revenue Floor | Monthly revenue < ₹10,000 | **-20** | `LOW_REVENUE` |
| 6 | Data Consistency | Loan > 50x monthly revenue | **-25** | `DATA_INCONSISTENCY` |

### Threshold Justification

- **60 as cutoff**: Allows applications that trigger at most one major risk signal (e.g. high EMI alone = 65, still approved). Two major signals together (e.g. high EMI + high loan ratio = 35) result in rejection this prevents stacking risk.
- **50% EMI ratio**: Industry standard for MSME lending. Beyond 50%, the business has less than half its revenue for operating expenses, making repayment unreliable.
- **Simplified EMI**: Uses `loanAmount / tenureMonths` without interest to keep scoring transparent and auditable for this assessment.

---

## Edge Case Handling

| Scenario | How It's Handled |
|----------|-----------------|
| Missing or empty fields | Zod validation returns 400 with field-level error messages |
| Negative revenue or loan amount | Zod `.positive()` check rejects at validation |
| Non-numeric values in number fields | Zod type coercion returns 400 with type error |
| Malformed PAN (e.g. `abc123`) | Zod regex rejects at validation **and** the engine flags `INVALID_PAN` |
| Loan grossly exceeds revenue (₹10L revenue, ₹5Cr loan) | Engine flags `DATA_INCONSISTENCY` (-25) + `HIGH_LOAN_RATIO` (-30) = rejection |
| Tenure of 0 or negative months | Zod `.min(1)` rejects at validation |
| Invalid `applicationId` in route params | Request is rejected with 400 before any database query runs |
| Non-existent application ID | Controller returns 404 with clear error message |
| Duplicate decision generation | Existing decision is returned; duplicate rows are prevented |
| MongoDB unavailable during startup or runtime | API stays available in degraded mode and skips audit writes |
| Database connection failure | Health endpoint returns 503; request-time failures are caught by the global error handler |
| Too many decision requests | Rate limiter (10 req / 2 min per IP) returns 429 |

---

## Assumptions

1. **No authentication** — this is a demo system; in production, all endpoints would be behind auth.
2. **Simplified EMI** — calculated as `loanAmount / tenureMonths` without interest rate to keep scoring logic transparent.
3. **Mock PAN validation** — checks format only (`ABCDE1234F`), not against any real registry.
4. **Single-pass scoring** — all signals are evaluated independently and summed; no weighted ML model.
5. **Best-effort audit logging** — the API continues serving requests if MongoDB is unavailable, and skips audit writes until it recovers.
6. **One decision per application** — decision generation is idempotent and returns the already-persisted decision on repeat requests.
7. **No currency conversion** — all amounts assumed to be in Indian Rupees (₹).

---


