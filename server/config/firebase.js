const admin = require('firebase-admin');

// Only initialize if Firebase credentials are configured
if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID || '';
  const privateKey = process.env.FIREBASE_PRIVATE_KEY || '';
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || '';

  // Skip Firebase if any placeholder / disabled value is present
  const SKIP_VALUES = ['', 'your_project_id', 'your_private_key', 'your_client_email', 'disabled'];
  const hasFirebaseConfig =
    !SKIP_VALUES.includes(projectId) &&
    !SKIP_VALUES.includes(privateKey) &&
    !SKIP_VALUES.includes(clientEmail);

  if (hasFirebaseConfig) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        privateKey: privateKey.replace(/\\n/g, '\n'),
        clientEmail,
      }),
    });
    console.log('✅ Firebase Admin initialized');
  } else {
    // Initialize with no credential — Google auth will be unavailable
    // but email/password auth (JWT) will still work fine
    admin.initializeApp({ projectId: 'clarity-placeholder' });
    console.warn('⚠️  Firebase Admin not configured — Google Sign-In disabled (JWT auth still works)');
  }
}

module.exports = admin;
