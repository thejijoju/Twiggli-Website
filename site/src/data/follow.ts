import type { Lang } from '../lib/url.ts';

/** The Follow button on a host page (HostPage.astro). For now a follow
 *  reaches our inbox through FormSubmit, like a booking request; the
 *  visitor's email is remembered on their device so the next follow is one
 *  tap. Emails about a host's new dates come later, through Brevo. */
export interface FollowCopy {
  follow: string;
  following: string;
  prompt: (name: string) => string;
  placeholder: string;
  send: string;
  sending: string;
  note: string;
  error: string;
}

export const followCopy: Record<Lang, FollowCopy> = {
  en: {
    follow: 'Follow', following: 'Following',
    prompt: (n) => `Get an email when ${n} adds new dates.`,
    placeholder: 'you@email.com', send: 'Follow', sending: 'Sending…',
    note: 'No spam, unfollow anytime.', error: 'That didn’t go through. Please try again.',
  },
  de: {
    follow: 'Folgen', following: 'Du folgst',
    prompt: (n) => `Erhalte eine E-Mail, wenn ${n} neue Termine einstellt.`,
    placeholder: 'du@email.com', send: 'Folgen', sending: 'Wird gesendet…',
    note: 'Kein Spam, jederzeit abbestellbar.', error: 'Das hat nicht geklappt. Bitte versuch es noch einmal.',
  },
  fr: {
    follow: 'Suivre', following: 'Suivi',
    prompt: (n) => `Recevez un e-mail quand ${n} ajoute de nouvelles dates.`,
    placeholder: 'vous@email.com', send: 'Suivre', sending: 'Envoi…',
    note: 'Pas de spam, désabonnement à tout moment.', error: 'Cela n’a pas fonctionné. Veuillez réessayer.',
  },
  es: {
    follow: 'Seguir', following: 'Siguiendo',
    prompt: (n) => `Recibe un e-mail cuando ${n} publique nuevas fechas.`,
    placeholder: 'tu@email.com', send: 'Seguir', sending: 'Enviando…',
    note: 'Sin spam, deja de seguir cuando quieras.', error: 'No se ha podido enviar. Inténtalo de nuevo.',
  },
  it: {
    follow: 'Segui', following: 'Segui già',
    prompt: (n) => `Ricevi un’e-mail quando ${n} aggiunge nuove date.`,
    placeholder: 'tu@email.com', send: 'Segui', sending: 'Invio…',
    note: 'Niente spam, smetti di seguire quando vuoi.', error: 'Non è andato a buon fine. Riprova.',
  },
  nl: {
    follow: 'Volgen', following: 'Je volgt',
    prompt: (n) => `Krijg een e-mail als ${n} nieuwe data toevoegt.`,
    placeholder: 'jij@email.com', send: 'Volgen', sending: 'Versturen…',
    note: 'Geen spam, altijd te stoppen.', error: 'Dat is niet gelukt. Probeer het opnieuw.',
  },
  pl: {
    follow: 'Obserwuj', following: 'Obserwujesz',
    prompt: (n) => `Dostaniesz e-mail, gdy ${n} doda nowe terminy.`,
    placeholder: 'ty@email.com', send: 'Obserwuj', sending: 'Wysyłanie…',
    note: 'Bez spamu, możesz przestać w każdej chwili.', error: 'Nie udało się. Spróbuj ponownie.',
  },
  tr: {
    follow: 'Takip et', following: 'Takip ediliyor',
    prompt: (n) => `${n} yeni tarih eklediğinde e-posta al.`,
    placeholder: 'sen@email.com', send: 'Takip et', sending: 'Gönderiliyor…',
    note: 'Spam yok, istediğin zaman bırak.', error: 'Gönderilemedi. Lütfen tekrar dene.',
  },
};
