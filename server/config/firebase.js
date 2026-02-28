const admin = require('firebase-admin');

// Download your service account key from Firebase Console:
// Project Settings > Service Accounts > Generate New Private Key
// Save it as serviceAccountKey.json in the server directory

let serviceAccount;
try {
  serviceAccount = require('../serviceAccountKey.json');
} catch (error) {
  console.error('Service account key not found. Please download it from Firebase Console.');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.FIREBASE_PROJECT_ID
});

module.exports = admin;