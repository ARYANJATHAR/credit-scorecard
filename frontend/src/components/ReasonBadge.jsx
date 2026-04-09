const REASON_LABELS = {
  HIGH_EMI_RATIO: 'High EMI-to-Revenue Ratio',
  MODERATE_EMI_RATIO: 'Moderate EMI-to-Revenue Ratio',
  HIGH_LOAN_RATIO: 'High Loan-to-Revenue Ratio',
  ELEVATED_LOAN_RATIO: 'Elevated Loan-to-Revenue Ratio',
  INVALID_PAN: 'Invalid PAN Format',
  LOW_REVENUE: 'Low Monthly Revenue',
  UNUSUAL_TENURE: 'Unusual Tenure Length',
  DATA_INCONSISTENCY: 'Data Inconsistency Detected',
};

export default function ReasonBadge({ code, variant = 'accent' }) {
  const label = REASON_LABELS[code] || code;

  const colors =
    variant === 'primary'
      ? 'bg-primary-muted text-primary border-primary/20'
      : 'bg-accent-muted text-accent-dark border-accent/25';

  return (
    <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full border ${colors}`}>
      {label}
    </span>
  );
}
