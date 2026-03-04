/**
 * Validate required env vars at startup - fail fast with clear messages
 */
function validateEnv() {
  const required = ['MONGODB_URI'];
  const missing = required.filter((key) => !process.env[key] || !String(process.env[key]).trim());
  if (missing.length > 0) {
    console.error(
      `Missing required env vars: ${missing.join(', ')}. ` +
      'Example: MONGODB_URI=mongodb://localhost:27017/surveymage (see server/.env.example)'
    );
    process.exit(1);
  }
  if (process.env.NODE_ENV === 'production' && !process.env.CORS_ORIGIN) {
    console.error('CORS_ORIGIN is required in production. Set it to your frontend origin.');
    process.exit(1);
  }
}

module.exports = { validateEnv };
