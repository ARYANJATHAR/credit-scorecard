/**
 * Credit Decision Engine
 *
 * Evaluates an MSME loan application and returns a credit decision.
 * Starts with a perfect score of 100 and deducts points based on risk signals.
 * Approval threshold: score >= 60.
 *
 * Signals:
 *  1. EMI-to-Revenue Ratio   — can the business afford monthly repayments?
 *  2. Loan-to-Revenue Multiple — is the total loan reasonable relative to income?
 *  3. PAN Validation           — basic identity format check
 *  4. Tenure Reasonableness    — flags unusually short or long terms
 *  5. Revenue Floor            — flags suspiciously low revenue
 *  6. Data Consistency         — catches obvious data conflicts / fraud signals
 */
function evaluate({ monthlyRevenue, loanAmount, tenureMonths, pan, businessType }) {
  const hasInvalidNumbers =
    !Number.isFinite(monthlyRevenue) ||
    !Number.isFinite(loanAmount) ||
    !Number.isFinite(tenureMonths) ||
    monthlyRevenue <= 0 ||
    loanAmount <= 0 ||
    tenureMonths <= 0;

  if (hasInvalidNumbers) {
    return {
      status: 'REJECTED',
      creditScore: 0,
      reasonCodes: ['INVALID_APPLICATION_DATA'],
      emiCalculated: 0,
    };
  }

  let score = 100;
  const reasons = [];

  // Signal 1: EMI to Revenue Ratio
  // Simplified EMI (no interest) = loanAmount / tenureMonths
  // If EMI exceeds 50% of monthly revenue the business likely cannot repay.
  const emi = loanAmount / tenureMonths;
  const emiRatio = emi / monthlyRevenue;

  if (emiRatio > 0.5) {
    score -= 35;
    reasons.push('HIGH_EMI_RATIO');
  } else if (emiRatio > 0.35) {
    score -= 15;
    reasons.push('MODERATE_EMI_RATIO');
  }

  // Signal 2 & 6: Loan to Revenue Multiple (mutually exclusive to avoid double-counting)
  const loanMultiple = loanAmount / monthlyRevenue;

  if (loanMultiple >= 50) {
    score -= 40;
    reasons.push('DATA_INCONSISTENCY');
  } else if (loanMultiple > 10) {
    score -= 30;
    reasons.push('HIGH_LOAN_RATIO');
  } else if (loanMultiple > 6) {
    score -= 15;
    reasons.push('ELEVATED_LOAN_RATIO');
  }

  // Signal 3: PAN Validation
  // Indian PAN format: 5 uppercase letters, 4 digits, 1 uppercase letter
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  if (!panRegex.test(pan)) {
    score -= 20;
    reasons.push('INVALID_PAN');
  }

  // Signal 4: Tenure Check
  // Tenures under 3 months or over 84 months are unusual for MSME loans.
  if (tenureMonths < 3 || tenureMonths > 84) {
    score -= 10;
    reasons.push('UNUSUAL_TENURE');
  }

  // Signal 5: Revenue Floor — suspiciously low for any operating business
  if (monthlyRevenue < 10000) {
    score -= 20;
    reasons.push('LOW_REVENUE');
  }

  score = Math.max(0, Math.min(100, score));

  const status = score >= 60 ? 'APPROVED' : 'REJECTED';

  return {
    status,
    creditScore: score,
    reasonCodes: reasons,
    emiCalculated: parseFloat(emi.toFixed(2)),
  };
}

module.exports = { evaluate };
