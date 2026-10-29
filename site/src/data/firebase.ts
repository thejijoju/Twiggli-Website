/** Twiggli's Firebase project — the same one the app uses — for host
 *  accounts (Firestore + email-link sign-in) and the voucher payment
 *  functions (functions/ at the repo root), replacing Supabase.
 *
 *  These are the web app's public settings (Firebase console → Project
 *  settings → General → Your apps → Web app → "SDK setup and
 *  configuration"). They are meant to ship in every page: what protects
 *  the data is firestore.rules, not secrecy. The Stripe secret key never
 *  goes here — it lives in Firebase Secret Manager (functions/README.md).
 *
 *  Project: twiggli-production, the one the app uses — so the website only
 *  ever deploys its own functions codebase and never the app's rules. */
export const firebaseConfig = {
  apiKey: 'AIzaSyCu6S-EbH8VFkQjKWe3teVXqYhyD6RT3VY',
  // Our own domain, so Google's sign-in screen says twiggli.com. Works
  // because the deploy copies Firebase's helper to /__/auth/ (deploy.yml).
  authDomain: 'www.twiggli.com',
  projectId: 'twiggli-production',
  appId: '1:496068250761:web:b6bf4daace44dab40a4a58',
};

/** The host account page opens once sign-in by email link is enabled and
 *  the website's rules are merged into the app's Firestore rules
 *  (functions/README.md). Until then it says accounts are coming soon. */
export const HOST_ACCOUNTS_OPEN = true;

export const firebaseReady = Boolean(firebaseConfig.projectId && firebaseConfig.apiKey) && HOST_ACCOUNTS_OPEN;

/** Where the Cloud Functions answer (functions/index.js, region
 *  europe-west3 / Frankfurt). */
export const FUNCTIONS_REGION = 'europe-west3';
export const functionsBase = firebaseConfig.projectId
  ? `https://${FUNCTIONS_REGION}-${firebaseConfig.projectId}.cloudfunctions.net`
  : '';

/** The checkout calls the voucher functions on Firebase instead of
 *  Supabase: deployed and answering with a live PaymentIntent on 29.10.26. */
export const VOUCHERS_ON_FIREBASE = true;

/** Where every form on the site sends its request (functions/index.js
 *  formRequest): saved in Firestore, then emailed to Jirel. It answers like
 *  FormSubmit did ({ success: 'true' }), which it replaced after FormSubmit
 *  went down on 28.10.26. */
export const formEndpoint = `${functionsBase}/formRequest`;
