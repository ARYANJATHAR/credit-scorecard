const { pool } = require('../config/postgres');
const { writeAuditLog } = require('../services/auditLogger');

async function createApplication(req, res, next) {
  let client;

  try {
    const { ownerName, pan, businessType, monthlyRevenue, loanAmount, tenureMonths, purpose } = req.body;

    client = await pool.connect();
    await client.query('BEGIN');

    const businessResult = await client.query(
      `INSERT INTO businesses (owner_name, pan, business_type, monthly_revenue)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [ownerName, pan, businessType, monthlyRevenue]
    );
    const businessId = businessResult.rows[0].id;

    const applicationResult = await client.query(
      `INSERT INTO loan_applications (business_id, loan_amount, tenure_months, purpose)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [businessId, loanAmount, tenureMonths, purpose]
    );
    const applicationId = applicationResult.rows[0].id;

    await client.query('COMMIT');

    await writeAuditLog({
      event: 'APPLICATION_SUBMITTED',
      applicationId,
      payload: req.body,
    });

    res.status(201).json({
      success: true,
      data: { applicationId },
    });
  } catch (err) {
    if (client) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackErr) {
        console.error('Failed to rollback application transaction:', rollbackErr.message);
      }
    }
    next(err);
  } finally {
    client?.release();
  }
}

module.exports = { createApplication };
