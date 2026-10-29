import type { Lang } from '../lib/url.ts';

/** The sign-in pill in the dark strip (SocialBar.astro) and the dialog it
 *  opens (SignInDialog.astro). Accounts are not live yet: the dialog takes
 *  an email and tells the visitor we will write once they can sign in (see
 *  lib/auth.ts). When Firebase's email link goes in, only `sentTitle` and
 *  `sentBody` need new words ("Check your inbox"). */
export interface AuthCopy {
  /** The pill's label. */
  signIn: string;
  /** What a screen reader hears on the pill, and the dialog's name. */
  signInAria: string;
  /** The "Get app" pill beside it in the dark strip, and what a screen
   *  reader hears on it (on a phone it is a round phone icon). */
  getApp: string;
  getAppAria: string;
  title: string;
  lede: string;
  email: string;
  emailPh: string;
  submit: string;
  sending: string;
  hint: string;
  /** The line under the form for hosts, and its link text. */
  hostQ: string;
  hostLink: string;
  sentTitle: string;
  sentBody: string;
  close: string;
  /** {email} is the contact address. */
  error: string;
}

export const authCopy: Record<Lang, AuthCopy> = {
  en: {
    signIn: 'Sign in',
    signInAria: 'Sign in to Twiggli',
    getApp: 'Get app',
    getAppAria: 'Get the Twiggli app',
    title: 'Welcome to Twiggli',
    lede: 'Sign in or create an account with your email.',
    email: 'Email',
    emailPh: 'you@example.com',
    submit: 'Continue with email',
    sending: 'Sending…',
    hint: 'We’ll send you a sign-in link, no password needed.',
    hostQ: 'Are you a host?',
    hostLink: 'This way for hosts',
    sentTitle: 'Thank you!',
    sentBody: 'Accounts are launching soon, we’ll email you as soon as you can sign in. 💛',
    close: 'Close',
    error: 'That didn’t go through. Please try again, or write to us at {email}.',
  },
  de: {
    signIn: 'Anmelden',
    signInAria: 'Bei Twiggli anmelden',
    getApp: 'App holen',
    getAppAria: 'Twiggli-App holen',
    title: 'Willkommen bei Twiggli',
    lede: 'Melde dich mit deiner E-Mail an oder erstelle ein Konto.',
    email: 'E-Mail',
    emailPh: 'du@beispiel.de',
    submit: 'Weiter mit E-Mail',
    sending: 'Wird gesendet…',
    hint: 'Wir schicken dir einen Anmeldelink, kein Passwort nötig.',
    hostQ: 'Du bist Gastgeber*in?',
    hostLink: 'Hier für Hosts',
    sentTitle: 'Danke!',
    sentBody: 'Konten starten in Kürze, wir schicken dir eine E-Mail, sobald du dich anmelden kannst. 💛',
    close: 'Schließen',
    error: 'Das hat nicht geklappt. Versuch es bitte noch einmal oder schreib uns an {email}.',
  },
  fr: {
    signIn: 'Connexion',
    signInAria: 'Se connecter à Twiggli',
    getApp: 'Obtenir l’app',
    getAppAria: 'Obtenir l’app Twiggli',
    title: 'Bienvenue sur Twiggli',
    lede: 'Connecte-toi ou crée un compte avec ton e-mail.',
    email: 'E-mail',
    emailPh: 'toi@exemple.fr',
    submit: 'Continuer avec l’e-mail',
    sending: 'Envoi…',
    hint: 'On t’envoie un lien de connexion, pas besoin de mot de passe.',
    hostQ: 'Tu es hôte ?',
    hostLink: 'Par ici pour les hôtes',
    sentTitle: 'Merci !',
    sentBody: 'Les comptes arrivent bientôt, on t’écrit dès que tu peux te connecter. 💛',
    close: 'Fermer',
    error: 'Ça n’a pas marché. Réessaie, ou écris-nous à {email}.',
  },
  es: {
    signIn: 'Iniciar sesión',
    signInAria: 'Iniciar sesión en Twiggli',
    getApp: 'Descargar app',
    getAppAria: 'Descargar la app de Twiggli',
    title: 'Bienvenido a Twiggli',
    lede: 'Inicia sesión o crea una cuenta con tu email.',
    email: 'Email',
    emailPh: 'tu@ejemplo.com',
    submit: 'Continuar con email',
    sending: 'Enviando…',
    hint: 'Te enviamos un enlace de acceso, sin contraseña.',
    hostQ: '¿Eres anfitrión?',
    hostLink: 'Por aquí para anfitriones',
    sentTitle: '¡Gracias!',
    sentBody: 'Las cuentas llegan pronto, te escribiremos en cuanto puedas iniciar sesión. 💛',
    close: 'Cerrar',
    error: 'No se ha enviado. Inténtalo de nuevo o escríbenos a {email}.',
  },
  it: {
    signIn: 'Accedi',
    signInAria: 'Accedi a Twiggli',
    getApp: 'Scarica l’app',
    getAppAria: 'Scarica l’app di Twiggli',
    title: 'Benvenuto su Twiggli',
    lede: 'Accedi o crea un account con la tua email.',
    email: 'Email',
    emailPh: 'tu@esempio.it',
    submit: 'Continua con l’email',
    sending: 'Invio…',
    hint: 'Ti mandiamo un link di accesso, nessuna password.',
    hostQ: 'Sei un host?',
    hostLink: 'Di qua per gli host',
    sentTitle: 'Grazie!',
    sentBody: 'Gli account arrivano presto, ti scriviamo appena potrai accedere. 💛',
    close: 'Chiudi',
    error: 'Non è andato a buon fine. Riprova o scrivici a {email}.',
  },
  nl: {
    signIn: 'Inloggen',
    signInAria: 'Inloggen bij Twiggli',
    getApp: 'App downloaden',
    getAppAria: 'De Twiggli-app downloaden',
    title: 'Welkom bij Twiggli',
    lede: 'Log in of maak een account aan met je e-mail.',
    email: 'E-mail',
    emailPh: 'jij@voorbeeld.nl',
    submit: 'Doorgaan met e-mail',
    sending: 'Versturen…',
    hint: 'We sturen je een inloglink, geen wachtwoord nodig.',
    hostQ: 'Ben je host?',
    hostLink: 'Hierheen voor hosts',
    sentTitle: 'Dankjewel!',
    sentBody: 'Accounts komen binnenkort, we mailen je zodra je kunt inloggen. 💛',
    close: 'Sluiten',
    error: 'Dat lukte niet. Probeer het opnieuw of mail ons op {email}.',
  },
  pl: {
    signIn: 'Zaloguj się',
    signInAria: 'Zaloguj się do Twiggli',
    getApp: 'Pobierz apkę',
    getAppAria: 'Pobierz aplikację Twiggli',
    title: 'Witaj w Twiggli',
    lede: 'Zaloguj się lub załóż konto przez e-mail.',
    email: 'E-mail',
    emailPh: 'ty@przyklad.pl',
    submit: 'Dalej z e-mailem',
    sending: 'Wysyłanie…',
    hint: 'Wyślemy ci link do logowania, bez hasła.',
    hostQ: 'Jesteś gospodarzem?',
    hostLink: 'Tędy dla gospodarzy',
    sentTitle: 'Dziękujemy!',
    sentBody: 'Konta ruszają wkrótce, napiszemy, gdy tylko będzie można się zalogować. 💛',
    close: 'Zamknij',
    error: 'Nie udało się. Spróbuj ponownie lub napisz do nas na {email}.',
  },
  tr: {
    signIn: 'Giriş yap',
    signInAria: 'Twiggli’ye giriş yap',
    getApp: 'Uygulamayı al',
    getAppAria: 'Twiggli uygulamasını al',
    title: 'Twiggli’ye hoş geldin',
    lede: 'E-postanla giriş yap ya da hesap oluştur.',
    email: 'E-posta',
    emailPh: 'sen@ornek.com',
    submit: 'E-posta ile devam et',
    sending: 'Gönderiliyor…',
    hint: 'Sana bir giriş bağlantısı göndereceğiz, şifre gerekmez.',
    hostQ: 'Ev sahibi misin?',
    hostLink: 'Ev sahipleri için buradan',
    sentTitle: 'Teşekkürler!',
    sentBody: 'Hesaplar çok yakında, giriş yapabildiğin anda sana e-posta göndereceğiz. 💛',
    close: 'Kapat',
    error: 'Gönderilemedi. Lütfen tekrar dene ya da {email} adresine yaz.',
  },
};
