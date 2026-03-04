const path = require('path');
const admin = require('firebase-admin');

const REQUIRED_KEYS = ['type', 'project_id', 'private_key_id', 'private_key', 'client_email'];

function loadServiceAccount() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    try {
      const parsed = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      const missing = REQUIRED_KEYS.filter((k) => !parsed[k]);
      if (missing.length > 0) {
        console.error(`FIREBASE_SERVICE_ACCOUNT_JSON missing keys: ${missing.join(', ')}`);
        process.exit(1);
      }
      return parsed;
    } catch (err) {
      console.error('Invalid FIREBASE_SERVICE_ACCOUNT_JSON: must be valid JSON. Check for unescaped quotes or newlines.');
      process.exit(1);
    }
  }
  try {
    return require('../serviceAccountKey.json');
  } catch {
    const keyPath = path.join(__dirname, '../serviceAccountKey.json');
    console.error(
      `Firebase service account not found. Set FIREBASE_SERVICE_ACCOUNT_JSON env, or save serviceAccountKey.json at ${keyPath}. ` +
      'Download from Firebase Console: Project Settings > Service Accounts > Generate New Private Key.'
    );
    process.exit(1);
  }
}

if (!admin.apps.length) {
  const serviceAccount = loadServiceAccount();
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id
  });
}

module.exports = admin;