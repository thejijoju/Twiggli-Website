/** Everything the site knows about signing in, in one place: Firebase
 *  Authentication (email link or Google), the same project as the app and
 *  the host accounts (data/firebase.ts). Signing in lands on the host
 *  account page (HostAccountPage.astro), which finishes an email link and
 *  shows hosts their dashboard. Firebase loads only when someone signs in,
 *  or on pages after they did, so other visitors never download it. */

import { firebaseConfig } from '../data/firebase.ts';

/** Same key the host account page reads when the email link comes back. */
const EMAIL_KEY = 'twiggli-host-signin-email';
/** Set while signed in, so pages only load Firebase for people who are. */
const SIGNED_IN = 'twiggli-signed-in';

const store = {
  get: (k: string) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
};

const authClient = async () => {
  const [{ initializeApp, getApps }, auth] = await Promise.all([import('firebase/app'), import('firebase/auth')]);
  const app = getApps()[0] ?? initializeApp(firebaseConfig);
  return { auth: auth.getAuth(app), mod: auth };
};

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
  /** The host account page in the visitor's language: the email link and
   *  Google both land there. */
  account: string;
}

/** Sends the email sign-in link. Resolves when Firebase sent it, throws
 *  when it did not (the dialog then shows its error with our address). */
export async function startEmailSignIn(email: string, { lang, account }: SignInContext): Promise<void> {
  const { auth, mod } = await authClient();
  auth.languageCode = lang;
  await mod.sendSignInLinkToEmail(auth, email, { url: new URL(account, location.origin).href, handleCodeInApp: true });
  store.set(EMAIL_KEY, email);
}

/** Google sign-in in a pop-up; then on to the host account. */
export async function signInWithGoogle({ account }: SignInContext): Promise<void> {
  const { auth, mod } = await authClient();
  await mod.signInWithPopup(auth, new mod.GoogleAuthProvider());
  store.set(SIGNED_IN, '1');
  location.href = account;
}

/** Marks the visitor as signed in or out (the host account page calls it). */
export const rememberSignedIn = (on: boolean) => {
  try { if (on) localStorage.setItem(SIGNED_IN, '1'); else localStorage.removeItem(SIGNED_IN); } catch { /* private mode */ }
};

/** The visitor who is signed in, or null. Loads Firebase only for
 *  visitors who signed in on this browser before. */
export async function getUser(): Promise<TwiggliUser | null> {
  if (!store.get(SIGNED_IN)) return null;
  const { auth, mod } = await authClient();
  const u = await new Promise<import('firebase/auth').User | null>((resolve) => {
    const stop = mod.onAuthStateChanged(auth, (user) => { stop(); resolve(user); });
  });
  if (!u?.email) { rememberSignedIn(false); return null; }
  return { id: u.uid, email: u.email, name: u.displayName ?? undefined, avatarUrl: u.photoURL ?? undefined };
}

/** The one letter the avatar chip shows when there is no photo. */
export const initialOf = (user: TwiggliUser): string =>
  (user.name || user.email).trim().charAt(0).toUpperCase();
