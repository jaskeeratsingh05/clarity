const admin = require('firebase-admin');

// Only initialize if Firebase credentials are configured
if (!admin.apps.length) {
  const hasFirebaseConfig =
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_PROJECT_ID !== 'your_project_id' &&
    process.env.FIREBASE_PRIVATE_KEY &&
    process.env.FIREBASE_CLIENT_EMAIL;

  if (hasFirebaseConfig) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
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
