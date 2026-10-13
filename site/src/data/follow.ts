import type { Lang } from '../lib/url.ts';

/** The Follow button on a host page (HostPage.astro). For now a follow
 *  reaches our inbox through FormSubmit, like a booking request; the
 *  visitor's email is remembered on their device so the next follow is one
 *  tap. Emails about a host's new dates come later, through Brevo. */
export interface FollowCopy {
  follow: string;
  following: string;
  done: (name: string) => string;
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
    done: (n) => `You’re following ${n}. We’ll email you when there are new dates.`,
    prompt: (n) => `Get an email when ${n} adds new dates.`,
    placeholder: 'Your email', send: 'Follow', sending: 'Sending…',
    note: 'No spam, unfollow anytime.', error: 'That didn’t go through. Please try again.',
  },
  de: {
    follow: 'Folgen', following: 'Du folgst',
    done: (n) => `Du folgst ${n}. Wir schreiben dir, sobald es neue Termine gibt.`,
    prompt: (n) => `Erhalte eine E-Mail, wenn ${n} neue Termine einstellt.`,
    placeholder: 'Deine E-Mail', send: 'Folgen', sending: 'Wird gesendet…',
    note: 'Kein Spam, jederzeit abbestellbar.', error: 'Das hat nicht geklappt. Bitte versuch es noch einmal.',
  },
  fr: {
    follow: 'Suivre', following: 'Suivi',
    done: (n) => `Vous suivez ${n}. Nous vous écrirons dès qu’il y a de nouvelles dates.`,
    prompt: (n) => `Recevez un e-mail quand ${n} ajoute de nouvelles dates.`,
    placeholder: 'Votre e-mail', send: 'Suivre', sending: 'Envoi…',
    note: 'Pas de spam, désabonnement à tout moment.', error: 'Cela n’a pas fonctionné. Veuillez réessayer.',
  },
  es: {
    follow: 'Seguir', following: 'Siguiendo',
    done: (n) => `Sigues a ${n}. Te escribiremos cuando haya nuevas fechas.`,
    prompt: (n) => `Recibe un e-mail cuando ${n} publique nuevas fechas.`,
    placeholder: 'Tu e-mail', send: 'Seguir', sending: 'Enviando…',
    note: 'Sin spam, deja de seguir cuando quieras.', error: 'No se ha podido enviar. Inténtalo de nuevo.',
  },
  it: {
    follow: 'Segui', following: 'Segui già',
    done: (n) => `Segui ${n}. Ti scriveremo quando ci saranno nuove date.`,
    prompt: (n) => `Ricevi un’e-mail quando ${n} aggiunge nuove date.`,
    placeholder: 'La tua e-mail', send: 'Segui', sending: 'Invio…',
    note: 'Niente spam, smetti di seguire quando vuoi.', error: 'Non è andato a buon fine. Riprova.',
  },
  nl: {
    follow: 'Volgen', following: 'Je volgt',
    done: (n) => `Je volgt ${n}. We mailen je zodra er nieuwe data zijn.`,
    prompt: (n) => `Krijg een e-mail als ${n} nieuwe data toevoegt.`,
    placeholder: 'Je e-mailadres', send: 'Volgen', sending: 'Versturen…',
    note: 'Geen spam, altijd te stoppen.', error: 'Dat is niet gelukt. Probeer het opnieuw.',
  },
  pl: {
    follow: 'Obserwuj', following: 'Obserwujesz',
    done: (n) => `Obserwujesz: ${n}. Napiszemy, gdy pojawią się nowe terminy.`,
    prompt: (n) => `Dostaniesz e-mail, gdy ${n} doda nowe terminy.`,
    placeholder: 'Twój e-mail', send: 'Obserwuj', sending: 'Wysyłanie…',
    note: 'Bez spamu, możesz przestać w każdej chwili.', error: 'Nie udało się. Spróbuj ponownie.',
  },
  tr: {
    follow: 'Takip et', following: 'Takip ediliyor',
    done: (n) => `${n} takip ediliyor. Yeni tarihler olduğunda sana yazacağız.`,
    prompt: (n) => `${n} yeni tarih eklediğinde e-posta al.`,
    placeholder: 'E-posta adresin', send: 'Takip et', sending: 'Gönderiliyor…',
    note: 'Spam yok, istediğin zaman bırak.', error: 'Gönderilemedi. Lütfen tekrar dene.',
  },
};
