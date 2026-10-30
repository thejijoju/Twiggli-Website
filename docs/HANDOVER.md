# Handover for the next Claude session (30.10.26)

Read this first. No emails, keys or customer data here: the repo is public.

## Rules from Jirel (always)
- Never send an email. Drafts only, replies inside the existing thread. Jirel clicks send.
- Deploy to the live branch only when Jirel says "push it".
- One step at a time: give one step, wait for "done", then the next.
- Never ask for or accept keys in chat. Secrets go into Firebase Secret Manager or the environment settings.
- Write in the host's language; never state a minimum group size; don't oversell.

## Branches and deploy
- Work branch: `claude/happy-faraday-6bcqh8`. Live branch: `claude/new-session-c5222r` (GitHub Pages + Firebase deploy on push).
- Deploy = cherry-pick work commits onto the live branch and push it.

## Firebase (project twiggli-production, shared with the FlutterFlow app)
- Functions (codebase "website", europe-west3, Node 22) in `functions/index.js`:
  voucherCheckout, voucherPayment (Stripe, secret STRIPE_SECRET_KEY),
  formRequest (every site form: saves to Firestore `formRequests`, emails Jirel via Gmail
  secret GMAIL_APP_PASSWORD, confirms to the guest, catches duplicates within 24 h),
  hostClaim / hostApprove / hostInbox / hostReply / hostInviteLinks (host accounts).
- Known hosts: Jirel's Google Sheet, tab "Hosts & Emails", column D emails, column K page slug.
  The function reads it at sign-in (sheet shared with the compute service account, Sheets API on).
- Firestore rules are pasted by hand in the console (`firestore.rules`), never deployed by CLI.
- Sign-in: email link or Google, authDomain www.twiggli.com (deploy copies the helper to /__/auth/).
- Read-only access for Claude: env var FIREBASE_READONLY_KEY = base64 of the `claude-readonly`
  service account JSON (Datastore Viewer, Logs Viewer, Firebase Viewer). Decode to a temp file in
  the scratchpad and use it as GOOGLE_APPLICATION_CREDENTIALS; never print it.

## Host dashboard (site/src/components/HostAccountPage.astro), /host/account/
- Live: sign-in, claim/approve, invite links (admin tab), Messages (accept / suggest / decline),
  Today, Listings (page text), Calendar (weekly schedule for now). Admin = Jirel's emails.
- Jirel's hidden test page: `test-jirel`.
- Next to build: month calendar with blocked days and seats per date (Diana's main ask),
  workshops/prices, discounts, extra costs, cancellation policy, reporting.
- Open decision: should a host's Accept/Decline email the guest automatically? Until Jirel decides,
  only Jirel is emailed.

## Open items
- Google OAuth branding verification: privacy policy is now complete; Jirel resubmits.
- App to-do list: `APP-TODO.md` (Sign in with Apple, app Firestore rules too open).
- Daily request check runs at 06:51 Berlin (scheduled task "Daily request check (mornings)").
