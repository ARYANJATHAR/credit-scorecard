const { pool } = require('../config/postgres');
const { evaluate } = require('../services/decisionEngine');
const { writeAuditLog } = require('../services/auditLogger');

function mapDecisionRow(row) {
  const emi = parseFloat(row.emi_calculated);
  return {
    status: row.status,
    creditScore: row.credit_score,
    reasonCodes: row.reason_codes || [],
    emiCalculated: Number.isFinite(emi) ? emi : 0,
    createdAt: row.created_at,
  };
}

async function getLatestDecisionRow(applicationId) {
  const result = await pool.query(
    `SELECT status, credit_score, reason_codes, emi_calculated, created_at
     FROM decisions
     WHERE application_id = $1
     ORDER BY created_at DESC
     LIMIT 1`,
    [applicationId]
  );

  return result.rows[0] || null;
}

async function generateDecision(req, res, next) {
  try {
    const { applicationId } = req.params;

    const existingDecision = await getLatestDecisionRow(applicationId);
    if (existingDecision) {
      return res.json({
        success: true,
        data: mapDecisionRow(existingDecision),
      });
    }

    const appResult = await pool.query(
      `SELECT la.id AS application_id, la.loan_amount, la.tenure_months, la.purpose,
              b.owner_name, b.pan, b.business_type, b.monthly_revenue
       FROM loan_applications la
       JOIN businesses b ON b.id = la.business_id
       WHERE la.id = $1`,
      [applicationId]
    );

    if (appResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Application ${applicationId} not found`,
        },
      });
    }

    const app = appResult.rows[0];

    const decision = evaluate({
      monthlyRevenue: parseFloat(app.monthly_revenue),
      loanAmount: parseFloat(app.loan_amount),
      tenureMonths: parseInt(app.tenure_months, 10),
      pan: app.pan,
      businessType: app.business_type,
    });

    const insertResult = await pool.query(
      `INSERT INTO decisions (application_id, status, credit_score, reason_codes, emi_calculated)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (application_id) DO NOTHING
       RETURNING status, credit_score, reason_codes, emi_calculated, created_at`,
      [applicationId, decision.status, decision.creditScore, decision.reasonCodes, decision.emiCalculated]
    );

    const persistedDecision = insertResult.rows[0] || (await getLatestDecisionRow(applicationId));
    const responseDecision = persistedDecision ? mapDecisionRow(persistedDecision) : { ...decision };
    const statusCode = insertResult.rows[0] ? 201 : 200;

    if (insertResult.rows[0]) {
      await writeAuditLog({
        event: 'DECISION_GENERATED',
        applicationId,
        payload: {
          monthlyRevenue: parseFloat(app.monthly_revenue),
          loanAmount: parseFloat(app.loan_amount),
          tenureMonths: parseInt(app.tenure_months, 10),
          pan: app.pan,
          businessType: app.business_type,
        },
        result: responseDecision,
      });
    }

    res.status(statusCode).json({
      success: true,
      data: responseDecision,
    });
  } catch (err) {
    next(err);
  }
}

async function getDecision(req, res, next) {
  try {
    const { applicationId } = req.params;

    const row = await getLatestDecisionRow(applicationId);
    if (!row) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `No decision found for application ${applicationId}`,
        },
      });
    }

    res.json({
      success: true,
      data: mapDecisionRow(row),
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { generateDecision, getDecision };
