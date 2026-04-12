/**
 * sanitizeMiddleware.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Global middleware that scans every incoming request (body, query, params)
 * for SQL injection and NoSQL injection patterns and rejects them with 400.
 *
 * Why here and not only in validators?
 *  - Validators only run on specific routes. Placing detection here ensures
 *    ALL routes are covered, including any future ones.
 *  - NoSQL injection (e.g. { $gt: "" }) bypasses SQL-focused checks.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── SQL Injection patterns ────────────────────────────────────────────────────
// Covers classic SQL payloads: comment sequences, UNION-based, boolean-based,
// tautology attacks, stacked queries, and common keywords used to manipulate queries.
const SQL_INJECTION_PATTERN =
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|EXEC|EXECUTE|UNION|FROM|WHERE|HAVING|ORDER\s+BY|GROUP\s+BY|CAST|CONVERT|DECLARE|INFORMATION_SCHEMA|SLEEP|BENCHMARK|LOAD_FILE|OUTFILE|INTO\s+OUTFILE)\b)|(-{2,}|\/\*[\s\S]*?\*\/|;[\s]*$)|(\'|\")?\s*OR\s+(\'|\")?\s*[\w\d\'"]+\s*=\s*[\w\d\'"]+|(\'|\")?\s*AND\s+(\'|\")?\s*[\w\d\'"]+\s*=\s*[\w\d\'"]|(\bxp_\w+\b)/gi;

// ── NoSQL Injection patterns ──────────────────────────────────────────────────
// Covers MongoDB operator injections: $where, $gt, $ne, $regex, $or, etc.
const NOSQL_INJECTION_PATTERN =
  /(\$where|\$gt|\$lt|\$gte|\$lte|\$ne|\$in|\$nin|\$or|\$and|\$nor|\$not|\$exists|\$type|\$regex|\$expr|\$jsonSchema|\$mod|\$text|\$elemMatch|\$size|\$all)/i;

/**
 * Recursively scan a value for injection patterns.
 * Handles strings, arrays, and plain objects.
 */
const containsInjection = (value) => {
  if (typeof value === "string") {
    return SQL_INJECTION_PATTERN.test(value) || NOSQL_INJECTION_PATTERN.test(value);
  }
  if (Array.isArray(value)) {
    return value.some(containsInjection);
  }
  if (value !== null && typeof value === "object") {
    // Reject if any key is a MongoDB operator
    return Object.keys(value).some(
      (key) => NOSQL_INJECTION_PATTERN.test(key) || containsInjection(value[key])
    );
  }
  return false;
};

/**
 * Express middleware — call next() if clean, respond 400 if injection detected.
 */
const sanitizeRequest = (req, res, next) => {
  const targets = [req.body, req.query, req.params];

  for (const target of targets) {
    if (target && containsInjection(target)) {
      return res.status(400).json({
        success: false,
        message: "Invalid input detected. Request contains disallowed characters or patterns.",
      });
    }
  }

  // Reset regex lastIndex (global flag side-effect)
  SQL_INJECTION_PATTERN.lastIndex = 0;

  next();
};

module.exports = { sanitizeRequest };
