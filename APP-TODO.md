# Twiggli app (FlutterFlow): to-do

- **Know who signs in with Apple.** Sign in with Apple stays on: switching it off locks out everyone who signed up with it, and the App Store requires it next to Google login. "Hide My Email" users get a relay address (…@privaterelay.appleid.com) that still forwards mail. After any sign-in, ask for name plus phone number or a real email before someone can book. (29.10.26)
- **Tighten the Firestore rules.** Some collections (payments, transactions, Users, stripeaccounts) can be written by any signed-in user. Rules are in `firestore.rules`, published by hand in the Firebase console. (29.10.26)
