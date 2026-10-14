import type { Lang } from '../lib/url.ts';

/** The two rows near the end of the home page (HomeSplits.astro): one for
 *  teams, one for makers, each beside a small collage of workshop photos.
 *  `hand` is the half of the title set in handwriting. */
interface Split {
  kicker: string;
  title: string;
  hand: string;
  copy: string;
  ticks: [string, string, string];
  pics: [string, string];
}
export interface HomeSplitsCopy {
  teams: Split & { cta: string; more: string };
  makers: Split & { cta: string };
}

export const homeSplits: Record<Lang, HomeSplitsCopy> = {
  en: {
    teams: {
      kicker: 'For teams', title: 'Team events,', hand: 'made by hand',
      copy: 'Private workshops for your team: pottery, candles, cooking, printing and more, at a host’s studio or your office. Tell us the date and group size and get options and a quote within 24 hours.',
      ticks: ['One request, several hosts to choose from', 'At their studio or your office', 'One invoice for your company'],
      pics: ['kimchi', 'perfume'],
      cta: 'Request a group booking', more: 'See hosts for groups',
    },
    makers: {
      kicker: 'For makers', title: 'Teach your craft.', hand: 'We bring the people.',
      copy: 'List your workshops on Twiggli for free. People and teams across Berlin find you through your video, your dates and our newsletter. You only pay a commission when someone books.',
      ticks: ['Free to list, commission only on bookings', 'Your workshop shown with a short video', 'Team and group requests sent to you'],
      pics: ['tufting', 'on the wheel'],
      cta: 'Become a host',
    },
  },
  de: {
    teams: {
      kicker: 'Für Teams', title: 'Team-Events,', hand: 'mit den Händen gemacht',
      copy: 'Private Workshops für dein Team: Töpfern, Kerzen, Kochen, Drucken und mehr, im Studio der Gastgeber oder bei euch im Büro. Nenn uns Datum und Gruppengröße und du bekommst innerhalb von 24 Stunden Vorschläge und ein Angebot.',
      ticks: ['Eine Anfrage, mehrere Gastgeber zur Auswahl', 'Im Studio oder bei euch im Büro', 'Eine Rechnung für eure Firma'],
      pics: ['Kimchi', 'Parfüm'],
      cta: 'Gruppenbuchung anfragen', more: 'Gastgeber für Gruppen ansehen',
    },
    makers: {
      kicker: 'Für Kreative', title: 'Teile dein Handwerk.', hand: 'Wir bringen die Leute.',
      copy: 'Stell deine Workshops kostenlos auf Twiggli. Menschen und Teams in ganz Berlin finden dich über dein Video, deine Termine und unseren Newsletter. Du zahlst nur eine Provision, wenn jemand bucht.',
      ticks: ['Kostenlos gelistet, Provision nur bei Buchungen', 'Dein Workshop mit einem kurzen Video', 'Team- und Gruppenanfragen direkt an dich'],
      pics: ['Tufting', 'an der Scheibe'],
      cta: 'Gastgeber werden',
    },
  },
  fr: {
    teams: {
      kicker: 'Pour les équipes', title: 'Des événements d’équipe,', hand: 'faits main',
      copy: 'Des ateliers privés pour votre équipe : poterie, bougies, cuisine, impression et plus, dans l’atelier d’un hôte ou dans vos bureaux. Indiquez la date et la taille du groupe et recevez des propositions et un devis sous 24 heures.',
      ticks: ['Une demande, plusieurs hôtes au choix', 'Dans leur atelier ou dans vos bureaux', 'Une seule facture pour votre entreprise'],
      pics: ['kimchi', 'parfum'],
      cta: 'Demander une réservation de groupe', more: 'Voir les hôtes pour groupes',
    },
    makers: {
      kicker: 'Pour les créateurs', title: 'Transmettez votre savoir-faire.', hand: 'On amène les gens.',
      copy: 'Publiez vos ateliers sur Twiggli gratuitement. Particuliers et équipes de tout Berlin vous découvrent grâce à votre vidéo, vos dates et notre newsletter. Vous ne payez une commission que lorsque quelqu’un réserve.',
      ticks: ['Publication gratuite, commission seulement sur les réservations', 'Votre atelier présenté en courte vidéo', 'Les demandes d’équipes et de groupes vous parviennent'],
      pics: ['tufting', 'au tour'],
      cta: 'Devenir hôte',
    },
  },
  es: {
    teams: {
      kicker: 'Para equipos', title: 'Eventos de equipo,', hand: 'hechos a mano',
      copy: 'Talleres privados para tu equipo: cerámica, velas, cocina, estampación y más, en el estudio de un anfitrión o en vuestra oficina. Dinos la fecha y el tamaño del grupo y recibe opciones y un presupuesto en 24 horas.',
      ticks: ['Una solicitud, varios anfitriones para elegir', 'En su estudio o en vuestra oficina', 'Una sola factura para tu empresa'],
      pics: ['kimchi', 'perfume'],
      cta: 'Solicitar reserva de grupo', more: 'Ver anfitriones para grupos',
    },
    makers: {
      kicker: 'Para creadores', title: 'Enseña tu oficio.', hand: 'Nosotros traemos a la gente.',
      copy: 'Publica tus talleres en Twiggli gratis. Personas y equipos de todo Berlín te encuentran por tu vídeo, tus fechas y nuestra newsletter. Solo pagas una comisión cuando alguien reserva.',
      ticks: ['Publicar es gratis, comisión solo por reserva', 'Tu taller presentado con un vídeo corto', 'Te llegan solicitudes de equipos y grupos'],
      pics: ['tufting', 'en el torno'],
      cta: 'Ser anfitrión',
    },
  },
  it: {
    teams: {
      kicker: 'Per i team', title: 'Eventi di team,', hand: 'fatti a mano',
      copy: 'Workshop privati per il tuo team: ceramica, candele, cucina, stampa e altro, nello studio di un host o nel vostro ufficio. Indicaci data e numero di persone e ricevi proposte e un preventivo entro 24 ore.',
      ticks: ['Una richiesta, più host tra cui scegliere', 'Nel loro studio o nel vostro ufficio', 'Un’unica fattura per la tua azienda'],
      pics: ['kimchi', 'profumo'],
      cta: 'Richiedi una prenotazione di gruppo', more: 'Vedi gli host per gruppi',
    },
    makers: {
      kicker: 'Per i creativi', title: 'Insegna il tuo mestiere.', hand: 'Le persone le portiamo noi.',
      copy: 'Pubblica i tuoi workshop su Twiggli gratis. Persone e team di tutta Berlino ti trovano grazie al tuo video, alle tue date e alla nostra newsletter. Paghi una commissione solo quando qualcuno prenota.',
      ticks: ['Pubblicazione gratuita, commissione solo sulle prenotazioni', 'Il tuo workshop presentato con un breve video', 'Ricevi le richieste di team e gruppi'],
      pics: ['tufting', 'al tornio'],
      cta: 'Diventa host',
    },
  },
  nl: {
    teams: {
      kicker: 'Voor teams', title: 'Teamuitjes,', hand: 'met de hand gemaakt',
      copy: 'Privéworkshops voor je team: keramiek, kaarsen, koken, drukken en meer, in de studio van een host of op jullie kantoor. Geef de datum en groepsgrootte door en krijg binnen 24 uur opties en een offerte.',
      ticks: ['Eén aanvraag, meerdere hosts om uit te kiezen', 'In hun studio of op jullie kantoor', 'Eén factuur voor je bedrijf'],
      pics: ['kimchi', 'parfum'],
      cta: 'Groepsboeking aanvragen', more: 'Bekijk hosts voor groepen',
    },
    makers: {
      kicker: 'Voor makers', title: 'Deel je ambacht.', hand: 'Wij brengen de mensen.',
      copy: 'Zet je workshops gratis op Twiggli. Mensen en teams in heel Berlijn vinden je via je video, je data en onze nieuwsbrief. Je betaalt alleen commissie als iemand boekt.',
      ticks: ['Gratis vermelding, commissie alleen bij boekingen', 'Je workshop getoond met een korte video', 'Team- en groepsaanvragen naar jou gestuurd'],
      pics: ['tuften', 'aan de draaischijf'],
      cta: 'Host worden',
    },
  },
  pl: {
    teams: {
      kicker: 'Dla zespołów', title: 'Wydarzenia firmowe,', hand: 'robione ręcznie',
      copy: 'Prywatne warsztaty dla twojego zespołu: ceramika, świece, gotowanie, druk i więcej, w pracowni prowadzącego albo w waszym biurze. Podaj datę i liczbę osób, a w ciągu 24 godzin dostaniesz propozycje i wycenę.',
      ticks: ['Jedno zapytanie, kilku prowadzących do wyboru', 'W ich pracowni albo w waszym biurze', 'Jedna faktura dla twojej firmy'],
      pics: ['kimchi', 'perfumy'],
      cta: 'Zapytaj o rezerwację grupową', more: 'Zobacz prowadzących dla grup',
    },
    makers: {
      kicker: 'Dla twórców', title: 'Ucz swojego rzemiosła.', hand: 'Ludzi przyprowadzimy my.',
      copy: 'Dodaj swoje warsztaty do Twiggli za darmo. Ludzie i zespoły z całego Berlina znajdą cię dzięki twojemu wideo, terminom i naszemu newsletterowi. Prowizję płacisz tylko wtedy, gdy ktoś zarezerwuje.',
      ticks: ['Darmowe ogłoszenie, prowizja tylko od rezerwacji', 'Twój warsztat pokazany w krótkim wideo', 'Zapytania od zespołów i grup trafiają do ciebie'],
      pics: ['tufting', 'na kole'],
      cta: 'Zostań prowadzącym',
    },
  },
  tr: {
    teams: {
      kicker: 'Ekipler için', title: 'Ekip etkinlikleri,', hand: 'el yapımı',
      copy: 'Ekibin için özel atölyeler: seramik, mum, yemek, baskı ve daha fazlası, eğitmenin stüdyosunda ya da ofisinizde. Tarihi ve grup büyüklüğünü yaz, 24 saat içinde seçenekler ve fiyat teklifi al.',
      ticks: ['Tek talep, seçebileceğin birkaç eğitmen', 'Onların stüdyosunda ya da ofisinizde', 'Şirketin için tek fatura'],
      pics: ['kimchi', 'parfüm'],
      cta: 'Grup rezervasyonu iste', more: 'Gruplar için eğitmenleri gör',
    },
    makers: {
      kicker: 'Üretenler için', title: 'Zanaatını öğret.', hand: 'İnsanları biz getiririz.',
      copy: 'Atölyelerini Twiggli’de ücretsiz yayınla. Berlin’in her yerinden insanlar ve ekipler seni videon, tarihlerin ve bültenimiz sayesinde bulur. Yalnızca biri rezervasyon yaptığında komisyon ödersin.',
      ticks: ['Yayınlamak ücretsiz, komisyon yalnızca rezervasyonda', 'Atölyen kısa bir videoyla tanıtılır', 'Ekip ve grup talepleri sana iletilir'],
      pics: ['tufting', 'çarkta'],
      cta: 'Eğitmen ol',
    },
  },
};
