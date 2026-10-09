import type { Lang } from '../lib/url.ts';

/** The booking form's words (BookingDialog.astro). Every Book, Request and
 *  Notify button on the site opens it, with the workshop, host, date and
 *  time already filled in, and it lands as an email to us — the booking is
 *  made through Twiggli, never by sending the visitor to the host's page. */
export const bookingCopy: Record<Lang, {
  book: string; request: string; notify: string;
  lede: string; notifyLede: string; groupLede: string; when: string;
  name: string; email: string; phone: string; people: string; message: string; messagePh: string;
  optional: string; send: string; sending: string;
  sentTitle: string; sentBody: string; error: string; close: string;
}> = {
  en: {
    book: 'Booking request', request: 'Booking request', notify: 'Join the waiting list',
    lede: 'Tell us who’s coming and we’ll confirm your place by email. Nothing to pay yet.',
    notifyLede: 'This date is full. Leave your details and we’ll let you know as soon as a place opens.',
    groupLede: 'Tell us about your group and when suits you, and we’ll come back with dates and a quote. Nothing to pay yet.',
    when: 'Preferred date',
    name: 'Your name', email: 'Email', phone: 'Phone', people: 'People', message: 'Message', messagePh: 'Anything we should know?',
    optional: 'optional', send: 'Send request', sending: 'Sending…',
    sentTitle: 'Thank you!', sentBody: 'We have your request and will be in touch by email shortly.',
    error: 'That didn’t go through. Please try again, or write to us at {email}.', close: 'Close',
  },
  de: {
    book: 'Buchungsanfrage', request: 'Buchungsanfrage', notify: 'Auf die Warteliste',
    lede: 'Sag uns, wer kommt — wir bestätigen deinen Platz per E-Mail. Du zahlst noch nichts.',
    notifyLede: 'Dieser Termin ist voll. Hinterlass deine Daten, und wir melden uns, sobald ein Platz frei wird.',
    groupLede: 'Erzähl uns von deiner Gruppe und wann es euch passt — wir melden uns mit Terminen und einem Angebot. Du zahlst noch nichts.',
    when: 'Wunschtermin',
    name: 'Dein Name', email: 'E-Mail', phone: 'Telefon', people: 'Personen', message: 'Nachricht', messagePh: 'Sollen wir noch etwas wissen?',
    optional: 'optional', send: 'Anfrage senden', sending: 'Wird gesendet…',
    sentTitle: 'Danke!', sentBody: 'Deine Anfrage ist bei uns. Wir melden uns in Kürze per E-Mail.',
    error: 'Das hat nicht geklappt. Versuch es bitte noch einmal oder schreib uns an {email}.', close: 'Schließen',
  },
  fr: {
    book: 'Demande de réservation', request: 'Demande de réservation', notify: 'Liste d’attente',
    lede: 'Dites-nous qui vient : nous confirmons votre place par e-mail. Rien à payer pour l’instant.',
    notifyLede: 'Cette date est complète. Laissez vos coordonnées et nous vous prévenons dès qu’une place se libère.',
    groupLede: 'Parlez-nous de votre groupe et des dates qui vous conviennent : nous revenons vers vous avec des créneaux et un devis. Rien à payer pour l’instant.',
    when: 'Date souhaitée',
    name: 'Votre nom', email: 'E-mail', phone: 'Téléphone', people: 'Personnes', message: 'Message', messagePh: 'Quelque chose à nous dire ?',
    optional: 'facultatif', send: 'Envoyer la demande', sending: 'Envoi…',
    sentTitle: 'Merci !', sentBody: 'Nous avons bien reçu votre demande et revenons vers vous très vite par e-mail.',
    error: 'L’envoi a échoué. Réessayez, ou écrivez-nous à {email}.', close: 'Fermer',
  },
  es: {
    book: 'Solicitud de reserva', request: 'Solicitud de reserva', notify: 'Lista de espera',
    lede: 'Dinos quién viene y te confirmamos la plaza por email. Todavía no pagas nada.',
    notifyLede: 'Esta fecha está completa. Déjanos tus datos y te avisamos en cuanto se libere una plaza.',
    groupLede: 'Cuéntanos sobre tu grupo y cuándo os viene bien, y te enviamos fechas y presupuesto. Todavía no pagas nada.',
    when: 'Fecha preferida',
    name: 'Tu nombre', email: 'Email', phone: 'Teléfono', people: 'Personas', message: 'Mensaje', messagePh: '¿Algo que debamos saber?',
    optional: 'opcional', send: 'Enviar solicitud', sending: 'Enviando…',
    sentTitle: '¡Gracias!', sentBody: 'Hemos recibido tu solicitud y te escribiremos pronto.',
    error: 'No se ha podido enviar. Inténtalo de nuevo o escríbenos a {email}.', close: 'Cerrar',
  },
  it: {
    book: 'Richiesta di prenotazione', request: 'Richiesta di prenotazione', notify: 'Lista d’attesa',
    lede: 'Dicci chi viene: ti confermiamo il posto via email. Per ora non paghi nulla.',
    notifyLede: 'Questa data è al completo. Lasciaci i tuoi dati e ti avvisiamo appena si libera un posto.',
    groupLede: 'Raccontaci del tuo gruppo e di quando vi va bene: ti rispondiamo con date e un preventivo. Per ora non paghi nulla.',
    when: 'Data preferita',
    name: 'Il tuo nome', email: 'Email', phone: 'Telefono', people: 'Persone', message: 'Messaggio', messagePh: 'Qualcosa che dovremmo sapere?',
    optional: 'facoltativo', send: 'Invia richiesta', sending: 'Invio…',
    sentTitle: 'Grazie!', sentBody: 'Abbiamo ricevuto la tua richiesta e ti scriviamo a breve.',
    error: 'Invio non riuscito. Riprova o scrivici a {email}.', close: 'Chiudi',
  },
  nl: {
    book: 'Boekingsaanvraag', request: 'Boekingsaanvraag', notify: 'Op de wachtlijst',
    lede: 'Laat ons weten wie er komt, dan bevestigen we je plek per e-mail. Je betaalt nog niets.',
    notifyLede: 'Deze datum is vol. Laat je gegevens achter en we laten het weten zodra er een plek vrijkomt.',
    groupLede: 'Vertel ons over je groep en wanneer het jullie uitkomt, dan komen we terug met data en een offerte. Je betaalt nog niets.',
    when: 'Voorkeursdatum',
    name: 'Je naam', email: 'E-mail', phone: 'Telefoon', people: 'Personen', message: 'Bericht', messagePh: 'Iets wat we moeten weten?',
    optional: 'optioneel', send: 'Aanvraag versturen', sending: 'Versturen…',
    sentTitle: 'Dank je!', sentBody: 'We hebben je aanvraag en mailen je snel terug.',
    error: 'Dat is niet gelukt. Probeer het opnieuw of mail ons op {email}.', close: 'Sluiten',
  },
  pl: {
    book: 'Prośba o rezerwację', request: 'Prośba o rezerwację', notify: 'Lista oczekujących',
    lede: 'Napisz, kto przyjdzie — potwierdzimy miejsce mailowo. Na razie nic nie płacisz.',
    notifyLede: 'Ten termin jest pełny. Zostaw dane, a damy znać, gdy zwolni się miejsce.',
    groupLede: 'Opowiedz nam o swojej grupie i o tym, kiedy wam pasuje — odpiszemy z terminami i wyceną. Na razie nic nie płacisz.',
    when: 'Preferowany termin',
    name: 'Imię i nazwisko', email: 'E-mail', phone: 'Telefon', people: 'Osoby', message: 'Wiadomość', messagePh: 'Coś, o czym powinniśmy wiedzieć?',
    optional: 'opcjonalnie', send: 'Wyślij zapytanie', sending: 'Wysyłanie…',
    sentTitle: 'Dziękujemy!', sentBody: 'Mamy Twoje zapytanie i wkrótce odpiszemy mailowo.',
    error: 'Nie udało się wysłać. Spróbuj ponownie albo napisz do nas: {email}.', close: 'Zamknij',
  },
  tr: {
    book: 'Rezervasyon talebi', request: 'Rezervasyon talebi', notify: 'Bekleme listesi',
    lede: 'Kimlerin geleceğini yaz, yerini e-postayla onaylayalım. Şimdilik bir şey ödemiyorsun.',
    notifyLede: 'Bu tarih dolu. Bilgilerini bırak, yer açılınca haber verelim.',
    groupLede: 'Grubundan ve size uyan zamandan bahset, tarih seçenekleri ve fiyat teklifiyle dönelim. Şimdilik bir şey ödemiyorsun.',
    when: 'Tercih edilen tarih',
    name: 'Adın', email: 'E-posta', phone: 'Telefon', people: 'Kişi', message: 'Mesaj', messagePh: 'Bilmemiz gereken bir şey var mı?',
    optional: 'isteğe bağlı', send: 'Talebi gönder', sending: 'Gönderiliyor…',
    sentTitle: 'Teşekkürler!', sentBody: 'Talebini aldık, kısa süre içinde e-postayla dönüş yapacağız.',
    error: 'Gönderilemedi. Tekrar dene ya da bize {email} adresinden yaz.', close: 'Kapat',
  },
};
