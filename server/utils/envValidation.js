/**
 * Validate required env vars at startup - fail fast with clear messages
 */
function validateEnv() {
  const required = ['MONGODB_URI'];
  const missing = required.filter((key) => !process.env[key] || !String(process.env[key]).trim());
  if (missing.length > 0) {
    console.error(`Missing required env vars: ${missing.join(', ')}`);
    process.exit(1);
  }
  if (process.env.NODE_ENV === 'production' && !process.env.CORS_ORIGIN) {
    console.error('CORS_ORIGIN is required in production');
    process.exit(1);
  }
}

module.exports = { validateEnv };
