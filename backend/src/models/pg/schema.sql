CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_name VARCHAR(100) NOT NULL,
  pan VARCHAR(10) NOT NULL,
  business_type VARCHAR(50) NOT NULL,
  monthly_revenue NUMERIC(15, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS loan_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id),
  loan_amount NUMERIC(15, 2) NOT NULL,
  tenure_months INTEGER NOT NULL,
  purpose TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES loan_applications(id),
  status VARCHAR(10) NOT NULL,
  credit_score INTEGER NOT NULL,
  reason_codes TEXT[] NOT NULL,
  emi_calculated NUMERIC(15, 2),
  created_at TIMESTAMP DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'businesses_owner_name_not_blank_check'
  ) THEN
    ALTER TABLE businesses
      ADD CONSTRAINT businesses_owner_name_not_blank_check
      CHECK (btrim(owner_name) <> '') NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'businesses_pan_format_check'
  ) THEN
    ALTER TABLE businesses
      ADD CONSTRAINT businesses_pan_format_check
      CHECK (pan ~ '^[A-Z]{5}[0-9]{4}[A-Z]$') NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'businesses_business_type_check'
  ) THEN
    ALTER TABLE businesses
      ADD CONSTRAINT businesses_business_type_check
      CHECK (business_type IN ('retail', 'manufacturing', 'services', 'other')) NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'businesses_monthly_revenue_positive_check'
  ) THEN
    ALTER TABLE businesses
      ADD CONSTRAINT businesses_monthly_revenue_positive_check
      CHECK (monthly_revenue > 0) NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'loan_applications_loan_amount_positive_check'
  ) THEN
    ALTER TABLE loan_applications
      ADD CONSTRAINT loan_applications_loan_amount_positive_check
      CHECK (loan_amount > 0) NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'loan_applications_tenure_months_range_check'
  ) THEN
    ALTER TABLE loan_applications
      ADD CONSTRAINT loan_applications_tenure_months_range_check
      CHECK (tenure_months BETWEEN 1 AND 360) NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'loan_applications_purpose_not_blank_check'
  ) THEN
    ALTER TABLE loan_applications
      ADD CONSTRAINT loan_applications_purpose_not_blank_check
      CHECK (btrim(purpose) <> '') NOT VALID;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS decisions_application_id_unique_idx
  ON decisions(application_id);
