import ScoreMeter from './ScoreMeter';
import ReasonBadge from './ReasonBadge';

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function DecisionResult({ decision, onReset }) {
  const { status, creditScore, reasonCodes: rawReasonCodes, emiCalculated } = decision;
  const reasonCodes = Array.isArray(rawReasonCodes) ? rawReasonCodes : [];
  const isApproved = status === 'APPROVED';

  return (
    <div className="max-w-xl mx-auto">
      {/* Status Banner */}
      <div
        className={`rounded-2xl p-8 text-center mb-6 border-2 ${
          isApproved
            ? 'bg-primary-muted border-primary/25'
            : 'bg-accent-muted border-accent/30'
        }`}
      >
        <div
          className={`text-5xl mb-2 font-light ${
            isApproved ? 'text-primary' : 'text-accent'
          }`}
        >
          {isApproved ? '✓' : '✕'}
        </div>
        <h2
          className={`text-3xl font-bold tracking-tight ${
            isApproved ? 'text-primary' : 'text-accent'
          }`}
        >
          {status}
        </h2>
        <p className="text-ink/75 mt-2">
          {isApproved
            ? 'Your loan application has been approved.'
            : 'Your loan application has been rejected.'}
        </p>
      </div>

      {/* Score Meter */}
      <div className="bg-surface rounded-2xl border border-primary/10 p-6 mb-6 shadow-[0_4px_24px_rgba(29,53,87,0.06)]">
        <ScoreMeter score={creditScore} />
      </div>

      {/* EMI */}
      <div className="bg-surface rounded-2xl border border-primary/10 p-6 mb-6 shadow-[0_4px_24px_rgba(29,53,87,0.06)]">
        <p className="text-sm text-ink/65 mb-1">Estimated Monthly Repayment</p>
        <p className="text-2xl font-bold text-primary">
          {formatCurrency(emiCalculated)}
        </p>
      </div>

      {/* Reason Codes */}
      {reasonCodes.length > 0 && (
        <div className="bg-surface rounded-2xl border border-primary/10 p-6 mb-6 shadow-[0_4px_24px_rgba(29,53,87,0.06)]">
          <p className="text-sm text-ink/65 mb-3">
            {isApproved ? 'Informational Notes' : 'Rejection Reasons'}
          </p>
          <div className="flex flex-wrap gap-2">
            {reasonCodes.map((code) => (
              <ReasonBadge
                key={code}
                code={code}
                variant={isApproved ? 'primary' : 'accent'}
              />
            ))}
          </div>
        </div>
      )}

      {/* Apply Again */}
      <button
        onClick={onReset}
        className="w-full py-3.5 px-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors cursor-pointer shadow-sm"
      >
        Apply Again
      </button>
    </div>
  );
}
