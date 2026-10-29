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
 *  Until projectId is filled in, the host account page says accounts are
 *  coming soon and vouchers keep using the Supabase functions. */
export const firebaseConfig = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  appId: '',
};

export const firebaseReady = Boolean(firebaseConfig.projectId && firebaseConfig.apiKey);

/** Where the Cloud Functions answer (functions/index.js, region
 *  europe-west3 / Frankfurt). */
export const FUNCTIONS_REGION = 'europe-west3';
export const functionsBase = firebaseConfig.projectId
  ? `https://${FUNCTIONS_REGION}-${firebaseConfig.projectId}.cloudfunctions.net`
  : '';

/** Flip to true once the voucher functions are deployed on Firebase and a
 *  test payment went through: the checkout then calls Firebase instead of
 *  Supabase. */
export const VOUCHERS_ON_FIREBASE = false;
