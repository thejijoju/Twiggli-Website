/** Everything the site knows about signing in, in one place.
 *
 *  Accounts are not live yet. The sign-in dialog (SignInDialog.astro) calls
 *  startEmailSignIn(), which for now posts the address to our inbox through
 *  FormSubmit as "Login interest", the same route the booking and voucher
 *  forms take. When Firebase Authentication goes in (email link, the same
 *  project as the app and the host accounts in data/firebase.ts), only
 *  the bodies below change: the dialog and the header pill already call
 *  these two functions and nothing else. */

/** A signed-in visitor, as much as the header needs to show their avatar
 *  or initial (Luma shows the initial in a round chip). */
export interface TwiggliUser {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
}

export interface SignInContext {
  /** The page language, so the reply and later the magic-link email can be
   *  in it. */
  lang: string;
  /** Where the dialog was opened. Defaults to the current URL. */
  page?: string;
  /** Where the FormSubmit post goes (data/site.ts requestEmail, handed in
   *  by the dialog: that module reads the file system and cannot ship to
   *  the browser). Drops out with Firebase. */
  inbox: string;
}

/** Starts an email sign-in. Resolves when the request went through, throws
 *  when it did not (the dialog then shows its error with our address).
 *
 *  Today: a FormSubmit post to our inbox, so we know who is waiting.
 *  Later: replace the body with Firebase's email link (as on the host
 *  account page, HostAccountPage.astro), e.g.
 *
 *    auth.languageCode = lang;
 *    await sendSignInLinkToEmail(auth, email, { url: `${location.origin}/auth/callback`, handleCodeInApp: true });
 *    localStorage.setItem('twiggli-signin-email', email);
 */
export async function startEmailSignIn(email: string, { lang, page, inbox }: SignInContext): Promise<void> {
  // ── Firebase: sendSignInLinkToEmail goes here (see above) ──
  let cameFrom = 'unknown';
  try { cameFrom = sessionStorage.getItem('twiggli-came-from') || 'unknown'; } catch { /* blocked */ }
  const res = await fetch(`https://formsubmit.co/ajax/${inbox}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    // "email" (lower case) is the field FormSubmit replies to.
    body: JSON.stringify({
      Type: 'Login interest',
      Language: lang,
      'Sent from': page ?? location.href,
      'Came from': cameFrom,
      email,
      _subject: `Login interest: ${email}`,
      _template: 'table',
      _captcha: 'false',
    }),
  });
  if (!res.ok) throw new Error(String(res.status));
}

/** The visitor who is signed in, or null. Always null until accounts are
 *  live; then this reads the Firebase session, e.g.
 *
 *    const u = auth.currentUser;
 *    return u ? { id: u.uid, email: u.email!, name: u.displayName ?? undefined, avatarUrl: u.photoURL ?? undefined } : null;
 */
export async function getUser(): Promise<TwiggliUser | null> {
  return null;
}

/** The one letter the avatar chip shows when there is no photo. */
export const initialOf = (user: TwiggliUser): string =>
  (user.name || user.email).trim().charAt(0).toUpperCase();
