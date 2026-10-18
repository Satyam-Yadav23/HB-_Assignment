# HB Plus Auth

HB Plus Auth is an Expo app for web, Android, and iOS. It uses Google sign-in and Firebase Authentication. Only verified `@hbplus.fit` accounts can use the workspace.

## Setup

1. Install the project dependencies:

   ```bash
   npm install
   npm --prefix functions install
   ```

2. Copy `.env.example` to `.env` and add the Firebase web app values and Google OAuth client IDs. These values configure the app; never put a MongoDB URI, service account key, or OAuth client secret in this file.
3. In Firebase Console, enable Google under **Authentication → Sign-in method**. Enable Identity Platform for the authentication blocking functions, and add the web app's host to Firebase Authentication's authorized domains.
4. Start the app with `npx expo start`. Press `w` for web, `a` for Android, or `i` for iOS. Native sign-in requires a development build or standalone app configured with the matching OAuth client IDs.
5. In Atlas, create a database user limited to the app database and allow the Cloud Functions runtime to connect to the cluster. Include the database name in the connection URI. Set it as a Firebase secret when prompted:

   ```bash
   npx firebase-tools login
   npx firebase-tools use <firebase-project-id>
   npx firebase-tools functions:secrets:set MONGODB_URI
   npm --prefix functions run build
   npx firebase-tools deploy --only functions,firestore:rules
   ```

   Firebase Authentication blocking functions require Identity Platform. The Firebase project may also need billing enabled.

## Sign-in and access

The web app uses Firebase Google redirect sign-in; the native apps use Google through Expo AuthSession. The client and Firebase blocking functions accept only verified email addresses ending in `@hbplus.fit`. Other addresses are rejected. The app checks access for immediate feedback; the blocking functions enforce the same policy at sign-up and sign-in. The profile callable checks the verified email and Google provider again before writing to MongoDB.

The dashboard waits for Firebase to restore the session before rendering. Unauthenticated users are redirected to sign-in. Firebase manages token refresh; native auth state persists with AsyncStorage.

## Roles

Roles come from the trusted Firebase custom claim `admin`. Accounts with `admin: true` are administrators; everyone else has the user role. The `/admin` route redirects signed-out users to sign-in and other users to the dashboard.

Assign claims only from a trusted server environment with Firebase Admin SDK access:

```ts
await getAuth().setCustomUserClaims(firebaseUid, { admin: true });
```

Users need a refreshed ID token to see a role change. The app does not let users assign their own roles.

## MongoDB profiles

After sign-in, the app calls a Firebase callable function. The function stores one document per Firebase UID in the `users` collection, including the verified email, display name, photo URL, role, provider, and timestamps. MongoDB credentials stay in Firebase Functions secrets, not in the app bundle. The MongoDB client is reused while a function instance remains warm; connection pool values use driver defaults until traffic data supports tuning them.

## Configuration

| Variable | Purpose |
| --- | --- |
| `EXPO_PUBLIC_FIREBASE_API_KEY` | Firebase web app API key |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Authentication domain |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID |
| `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `EXPO_PUBLIC_FIREBASE_APP_ID` | Firebase web app ID |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Google OAuth web client ID |
| `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` | Google OAuth iOS client ID |
| `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` | Google OAuth Android client ID |

Expo public variables are included in the app bundle. They must not contain secrets.
