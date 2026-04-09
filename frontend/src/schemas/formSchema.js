import { z } from 'zod';

const businessTypeSchema = z.preprocess(
  (value) => (value === '' ? undefined : value),
  z.enum(['retail', 'manufacturing', 'services', 'other'], {
    required_error: 'Business type is required',
  })
);

const numberSchema = (fieldName) =>
  z
    .number({
      required_error: `${fieldName} is required`,
      invalid_type_error: `${fieldName} must be a number`,
    })
    .finite(`${fieldName} must be a valid number`);

export const formSchema = z
  .object({
    ownerName: z
      .string({ required_error: 'Owner name is required' })
      .trim()
      .min(2, 'Owner name must be at least 2 characters')
      .max(100, 'Owner name must be at most 100 characters'),

    pan: z
      .string({ required_error: 'PAN is required' })
      .trim()
      .toUpperCase()
      .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format (expected: ABCDE1234F)'),

    businessType: businessTypeSchema,

    monthlyRevenue: numberSchema('Monthly revenue').min(1, 'Revenue must be at least ₹1'),

    loanAmount: numberSchema('Loan amount').min(1, 'Loan amount must be at least ₹1'),

    tenureMonths: numberSchema('Tenure')
      .int('Tenure must be a whole number')
      .min(1, 'Tenure must be at least 1 month')
      .max(360, 'Tenure cannot exceed 360 months'),

    purpose: z
      .string({ required_error: 'Purpose is required' })
      .trim()
      .min(5, 'Purpose must be at least 5 characters')
      .max(500, 'Purpose must be at most 500 characters'),
  })
  .superRefine(({ monthlyRevenue, loanAmount }, ctx) => {
    if (
      Number.isFinite(monthlyRevenue) &&
      Number.isFinite(loanAmount) &&
      monthlyRevenue > 0 &&
      loanAmount >= monthlyRevenue * 50
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['loanAmount'],
        message: 'Loan amount conflicts with the declared monthly revenue',
      });
    }
  });
