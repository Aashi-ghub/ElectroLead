import pool from '../config/database.js';

// Log audit event
export const logAudit = async (userId, action, resourceType = null, resourceId = null, details = null, req = null) => {
  try {
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        userId,
        action,
        resourceType,
        resourceId,
        details ? JSON.stringify(details) : null,
        req?.ip || req?.connection?.remoteAddress || null,
        req?.get('user-agent') || null,
      ]
    );
  } catch (error) {
    // Don't fail the request if audit logging fails
    console.error('Audit log error:', error);
  }
};
