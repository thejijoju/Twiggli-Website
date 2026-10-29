import type { Lang } from '../lib/url.ts';

/** The sign-in pill in the dark strip (SocialBar.astro) and the dialog it
 *  opens (SignInDialog.astro): Firebase sign-in by email link or Google
 *  (lib/auth.ts), which lands on the host account. */
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
  /** "Sign in with Google", under the email form. */
  google: string;
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
    sentTitle: 'Check your inbox',
    sentBody: 'We’ve sent you a sign-in link. Open it on this device and you’re in.',
    google: 'Sign in with Google',
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
    sentTitle: 'Schau in dein Postfach',
    sentBody: 'Wir haben dir einen Anmeldelink geschickt. Öffne ihn auf diesem Gerät, dann bist du drin.',
    google: 'Mit Google anmelden',
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
    sentTitle: 'Regarde ta boîte mail',
    sentBody: 'On t’a envoyé un lien de connexion. Ouvre-le sur cet appareil et c’est fait.',
    google: 'Se connecter avec Google',
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
    sentTitle: 'Revisa tu correo',
    sentBody: 'Te hemos enviado un enlace para iniciar sesión. Ábrelo en este dispositivo y listo.',
    google: 'Iniciar sesión con Google',
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
    sentTitle: 'Controlla la tua email',
    sentBody: 'Ti abbiamo inviato un link di accesso. Aprilo su questo dispositivo e sei dentro.',
    google: 'Accedi con Google',
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
    sentTitle: 'Kijk in je inbox',
    sentBody: 'We hebben je een inloglink gestuurd. Open hem op dit apparaat en je bent binnen.',
    google: 'Inloggen met Google',
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
    sentTitle: 'Sprawdź skrzynkę',
    sentBody: 'Wysłaliśmy ci link do logowania. Otwórz go na tym urządzeniu i gotowe.',
    google: 'Zaloguj się przez Google',
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
    sentTitle: 'Gelen kutunu kontrol et',
    sentBody: 'Sana bir giriş bağlantısı gönderdik. Bu cihazda aç, hemen giriş yap.',
    google: 'Google ile giriş yap',
    close: 'Kapat',
    error: 'Gönderilemedi. Lütfen tekrar dene ya da {email} adresine yaz.',
  },
};
