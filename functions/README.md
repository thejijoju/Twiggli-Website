# Twiggli on Firebase

Replaces Supabase. Everything runs in the Firebase project the Twiggli app already uses.

- `index.js` holds the voucher payment functions: `voucherCheckout` and `voucherPayment`, in region europe-west3 (Frankfurt).
- `../firestore.rules` holds the host-account security rules for the collections `hostMembers`, `hostProfiles` and `hostSlots`.
- `../site/src/data/firebase.ts` holds the public web settings and the switch that moves vouchers over.
- `../.github/workflows/deploy-firebase.yml` deploys only the website's functions (codebase `website`), never the app's functions or rules.

## One-time setup (Firebase console)

1. **Web settings.** Go to Project settings → General → Your apps.
   - If there's no web app yet, add one with "Add app" → Web.
   - Copy `apiKey`, `authDomain`, `projectId` and `appId` into `site/src/data/firebase.ts`. These are public; they ship in the page.
2. **Sign-in.** Go to Authentication → Sign-in method.
   - Enable Email/Password, then tick "Email link (passwordless sign-in)".
   - Under Settings → Authorized domains, add `www.twiggli.com` and `twiggli.com`.
3. **Firestore rules.** The project `twiggli-production` is the app's project, and Firestore has one set of rules per project.
   - Open Firestore Database → Rules, copy what is there today and send it to Claude.
   - Claude merges the website's rules (`../firestore.rules`) into the app's rules so that nothing the app does changes.
   - Paste the merged result back and publish.
   - Never deploy `firestore.rules` from this repo on its own: it would replace the app's rules.
4. **Plan.** Cloud Functions need the Blaze plan, which is pay-as-you-go. At Twiggli's volume it costs cents a month.
5. **Stripe key.** Store the key in Secret Manager, never in the repo or in a chat. On your own computer, run:
   `npx firebase-tools functions:secrets:set STRIPE_SECRET_KEY --project <projectId>`
   Paste the `sk_live_…` key when it asks.
6. **Deploy access for GitHub.**
   - Go to Google Cloud console → IAM → Service accounts → create one.
   - Give it the roles Firebase Admin, Cloud Functions Admin, Service Account User and Secret Manager Secret Accessor.
   - Create a JSON key for it.
   - Add the key as the repository secret `FIREBASE_SERVICE_ACCOUNT` (GitHub → Settings → Secrets and variables → Actions).

## Hosts who may edit their page

In Firestore, add one document per host email to the `hostMembers` collection:

- **Document id:** the email in lower case, e.g. `whittle@posteo.de`.
- **Field:** `slugs` (array), e.g. `["nicole", "whittle"]`.

## Switching vouchers over

1. After the first deploy, check that the function answers. Run this on your own computer, with your projectId in the URL:
   `curl -X POST https://europe-west3-<projectId>.cloudfunctions.net/voucherPayment -H 'Origin: https://www.twiggli.com' -H 'Content-Type: application/json' -d '{"amount":20,"lang":"de"}'`
   It should return a `clientSecret`. That's an unpaid payment, so nothing is charged. You'll see it as "Incomplete" in Stripe.
2. If it works, set `VOUCHERS_ON_FIREBASE = true` in `site/src/data/firebase.ts`.
3. Push, then buy one €20 voucher yourself.
4. After that, the Supabase project can be switched off.
