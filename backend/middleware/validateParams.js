const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Rejects a malformed id before it reaches Postgres.
 *
 * Without this, `/api/enquiries/not-a-uuid/quote` sends the string straight
 * into a uuid-typed query, Postgres raises 22P02, and the generic error
 * handler turns it into a 500 - an input mistake reported as a server fault.
 */
export const validateUuidParam = (name = 'id') => (req, res, next) => {
  const value = req.params[name];
  if (!UUID_RE.test(value ?? '')) {
    return res.status(400).json({ error: `Invalid ${name}` });
  }
  next();
};
