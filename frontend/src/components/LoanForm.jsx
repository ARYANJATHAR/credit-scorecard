import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { formSchema } from '../schemas/formSchema';

const BUSINESS_TYPES = [
  { value: '', label: 'Select business type' },
  { value: 'retail', label: 'Retail' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'services', label: 'Services' },
  { value: 'other', label: 'Other' },
];

const PAN_MAX_LENGTH = 10;
const normalizePanInput = (value) =>
  typeof value === 'string' ? value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, PAN_MAX_LENGTH) : value;

export default function LoanForm({ onSubmit, isLoading }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ownerName: '',
      pan: '',
      businessType: undefined,
      monthlyRevenue: undefined,
      loanAmount: undefined,
      tenureMonths: undefined,
      purpose: '',
    },
  });

  const inputClass = (field) =>
    `w-full px-4 py-2.5 rounded-lg border bg-surface text-ink placeholder-ink/40 focus:outline-none focus:ring-2 transition-colors ${
      errors[field]
        ? 'border-accent focus:ring-accent/25'
        : 'border-primary/15 focus:ring-primary/20 focus:border-primary/40'
    }`;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-xl mx-auto space-y-5 rounded-2xl border border-primary/10 bg-surface p-6 sm:p-8 shadow-[0_4px_24px_rgba(29,53,87,0.06)]"
    >
      {/* Owner Name */}
      <div>
        <label htmlFor="ownerName" className="block text-sm font-medium text-ink mb-1">
          Owner Full Name
        </label>
        <input
          id="ownerName"
          type="text"
          placeholder="e.g. Rajesh Kumar"
          className={inputClass('ownerName')}
          {...register('ownerName')}
        />
        {errors.ownerName && (
          <p className="mt-1 text-sm text-accent">{errors.ownerName.message}</p>
        )}
      </div>

      {/* PAN */}
      <div>
        <label htmlFor="pan" className="block text-sm font-medium text-ink mb-1">
          PAN Number
        </label>
        <input
          id="pan"
          type="text"
          placeholder="ABCDE1234F"
          maxLength={PAN_MAX_LENGTH}
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          className={inputClass('pan')}
          {...register('pan', {
            onChange: (event) => {
              event.target.value = normalizePanInput(event.target.value);
            },
            setValueAs: normalizePanInput,
          })}
        />
        {errors.pan && (
          <p className="mt-1 text-sm text-accent">{errors.pan.message}</p>
        )}
      </div>

      {/* Business Type */}
      <div>
        <label htmlFor="businessType" className="block text-sm font-medium text-ink mb-1">
          Business Type
        </label>
        <select id="businessType" className={inputClass('businessType')} {...register('businessType')}>
          {BUSINESS_TYPES.map((bt) => (
            <option key={bt.value} value={bt.value}>
              {bt.label}
            </option>
          ))}
        </select>
        {errors.businessType && (
          <p className="mt-1 text-sm text-accent">{errors.businessType.message}</p>
        )}
      </div>

      {/* Monthly Revenue */}
      <div>
        <label htmlFor="monthlyRevenue" className="block text-sm font-medium text-ink mb-1">
          Monthly Revenue (₹)
        </label>
        <input
          id="monthlyRevenue"
          type="number"
          placeholder="e.g. 500000"
          className={inputClass('monthlyRevenue')}
          {...register('monthlyRevenue', { valueAsNumber: true })}
        />
        {errors.monthlyRevenue && (
          <p className="mt-1 text-sm text-accent">{errors.monthlyRevenue.message}</p>
        )}
      </div>

      {/* Loan Amount */}
      <div>
        <label htmlFor="loanAmount" className="block text-sm font-medium text-ink mb-1">
          Loan Amount (₹)
        </label>
        <input
          id="loanAmount"
          type="number"
          placeholder="e.g. 2000000"
          className={inputClass('loanAmount')}
          {...register('loanAmount', { valueAsNumber: true })}
        />
        {errors.loanAmount && (
          <p className="mt-1 text-sm text-accent">{errors.loanAmount.message}</p>
        )}
      </div>

      {/* Tenure */}
      <div>
        <label htmlFor="tenureMonths" className="block text-sm font-medium text-ink mb-1">
          Repayment Tenure (months)
        </label>
        <input
          id="tenureMonths"
          type="number"
          placeholder="e.g. 24"
          className={inputClass('tenureMonths')}
          {...register('tenureMonths', { valueAsNumber: true })}
        />
        {errors.tenureMonths && (
          <p className="mt-1 text-sm text-accent">{errors.tenureMonths.message}</p>
        )}
      </div>

      {/* Purpose */}
      <div>
        <label htmlFor="purpose" className="block text-sm font-medium text-ink mb-1">
          Purpose of Loan
        </label>
        <textarea
          id="purpose"
          rows={3}
          placeholder="Describe why you need this loan..."
          className={inputClass('purpose')}
          {...register('purpose')}
        />
        {errors.purpose && (
          <p className="mt-1 text-sm text-accent">{errors.purpose.message}</p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3.5 px-4 bg-accent text-white font-semibold rounded-lg hover:bg-accent-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Processing...
          </>
        ) : (
          'Submit Application'
        )}
      </button>
    </form>
  );
}
