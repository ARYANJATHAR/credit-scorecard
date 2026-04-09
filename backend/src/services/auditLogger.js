const AuditLog = require('../models/mongo/AuditLog');
const { isMongoAvailable } = require('../config/mongo');

async function writeAuditLog(entry) {
  if (!isMongoAvailable()) {
    console.warn(`Skipping audit log for ${entry.event}: MongoDB is unavailable`);
    return false;
  }

  try {
    await AuditLog.create({
      ...entry,
      timestamp: entry.timestamp || new Date(),
    });
    return true;
  } catch (err) {
    console.error(`Failed to write audit log for ${entry.event}:`, err.message);
    return false;
  }
}

module.exports = { writeAuditLog };
