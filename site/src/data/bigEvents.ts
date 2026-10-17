import type { Lang } from '../lib/url.ts';

/** The group-bookings page's offer for what no single host covers: a big
 *  event with several of our hosts side by side (candles at one table,
 *  terrariums at the next), and a request for something not listed at all.
 *  Both open the booking form (BookingDialog.astro) as an "event" request,
 *  where the hosts can be picked from a list.
 *
 *  Hosts tell us these requests come to them (a hundred people, several
 *  workshops in one evening) and no platform puts a line-up together; the
 *  big ones staff such events with their own people. */
export type BigEventsCopy = {
  kicker: string;
  title: string;
  copy: string;
  points: string[];
  cta: string;
  /** The occasions a large company event is for, as chips: the words a
   *  company searches with ("Sommerfest", "Kick-off"). */
  occasionsLabel: string;
  occasions: string[];
  /** Two plain questions and answers, shown under the section and given to
   *  search engines as an FAQ. */
  faq: { q: string; a: string }[];
  specialKicker: string;
  specialCopy: string;
  specialCta: string;
  /** The booking form's words for the two requests. */
  dialog: {
    event: string;
    eventLede: string;
    special: string;
    specialLede: string;
    hostsLabel: string;
    hostsHint: string;
    idea: string;
    ideaPh: string;
  };
};

export const bigEventsCopy: Record<Lang, BigEventsCopy> = {
  en: {
    kicker: 'Large corporate events in Berlin',
    title: 'Up to 1,000 people: many hosts, one event',
    copy: 'Planning for 100, 500 or even 1,000 people? We bring together as many of our hosts as you need, from very different crafts: candles at one table, terrariums at the next, pottery, screen printing, cooking and more around the room. Your guests choose or rotate between stations, and you have one contact, one quote and one invoice.',
    points: [
      'From 30 up to 1,000 people, at your venue, your office or across several studios',
      'Pick any hosts from this page, or let us put the line-up together',
      'One quote within 24 hours, one invoice for everything',
    ],
    cta: 'Plan an event with several hosts',
    occasionsLabel: 'Perfect for',
    occasions: ['Christmas parties', 'Summer parties', 'Company days', 'Kick-offs & all-hands', 'Conferences & offsites', 'Client events'],
    faq: [
      { q: 'Can you organise a team event for 500 or 1,000 people in Berlin?', a: 'Yes. For large groups we set up several workshop stations with different hosts at your venue, for example candles, terrariums, pottery and printing. Guests rotate or pick their favourite, and you get one contact, one quote and one invoice.' },
      { q: 'What kinds of workshops work for large company events?', a: 'Short, hands-on formats where everyone takes something home work best: mini terrariums, candle making, pottery, linocut and screen printing, cooking and tastings. We mix crafts so there is something for everyone.' },
    ],
    specialKicker: 'Not found what you’re looking for?',
    specialCopy: 'Tell us what you have in mind, even if it isn’t listed here: a theme, a format, a craft you’d love to try. We ask our network of Berlin makers and come back with options.',
    specialCta: 'Send a special request',
    dialog: {
      event: 'Event with several hosts',
      eventLede: 'Tell us about your event: how many people, when and where. Pick the hosts you like, or leave it to us. Nothing to pay yet.',
      special: 'Special request',
      specialLede: 'Describe what you’re looking for and we come back with ideas and a quote. Nothing to pay yet.',
      hostsLabel: 'Hosts you’d like',
      hostsHint: 'Pick as many as you like, or none and we suggest a line-up.',
      idea: 'What do you have in mind?',
      ideaPh: 'Occasion, format, crafts you’d like, budget, anything special',
    },
  },
  de: {
    kicker: 'Große Firmenevents in Berlin',
    title: 'Bis zu 1.000 Personen: viele Hosts, ein Event',
    copy: 'Ihr plant für 100, 500 oder sogar 1.000 Personen? Wir bringen so viele unserer Hosts zusammen, wie ihr braucht, aus ganz unterschiedlichen Handwerken: Kerzen an einem Tisch, Terrarien am nächsten, dazu Töpfern, Siebdruck, Kochen und mehr im ganzen Raum. Eure Gäste wählen oder wechseln zwischen den Stationen, und ihr habt eine Ansprechperson, ein Angebot und eine Rechnung.',
    points: [
      'Von 30 bis zu 1.000 Personen, in eurer Location, im Büro oder verteilt auf mehrere Studios',
      'Wählt beliebige Hosts von dieser Seite, oder wir stellen das Programm zusammen',
      'Ein Angebot innerhalb von 24 Stunden, eine Rechnung für alles',
    ],
    cta: 'Event mit mehreren Hosts planen',
    occasionsLabel: 'Ideal für',
    occasions: ['Weihnachtsfeiern', 'Sommerfeste', 'Mitarbeitertage', 'Kick-offs & All-Hands', 'Konferenzen & Offsites', 'Kundenevents'],
    faq: [
      { q: 'Könnt ihr ein Teamevent für 500 oder 1.000 Personen in Berlin organisieren?', a: 'Ja. Für große Gruppen bauen wir mehrere Workshop-Stationen mit verschiedenen Hosts in eurer Location auf, zum Beispiel Kerzen, Terrarien, Töpfern und Druck. Die Gäste wechseln durch oder wählen ihren Favoriten, und ihr habt eine Ansprechperson, ein Angebot und eine Rechnung.' },
      { q: 'Welche Workshops eignen sich für große Firmenevents?', a: 'Am besten kurze Mitmach-Formate, bei denen alle etwas mitnehmen: Mini-Terrarien, Kerzen gießen, Töpfern, Linol- und Siebdruck, Kochen und Tastings. Wir mischen die Handwerke, damit für alle etwas dabei ist.' },
    ],
    specialKicker: 'Nicht das Richtige gefunden?',
    specialCopy: 'Erzählt uns, was ihr euch vorstellt, auch wenn es hier nicht steht: ein Thema, ein Format, ein Handwerk, das ihr ausprobieren wollt. Wir fragen in unserem Netzwerk Berliner Kreativer nach und melden uns mit Vorschlägen.',
    specialCta: 'Sonderanfrage senden',
    dialog: {
      event: 'Event mit mehreren Hosts',
      eventLede: 'Erzählt uns von eurem Event: wie viele Personen, wann und wo. Wählt die Hosts, die euch gefallen, oder überlasst es uns. Ihr zahlt noch nichts.',
      special: 'Sonderanfrage',
      specialLede: 'Beschreibt, was ihr sucht, und wir melden uns mit Ideen und einem Angebot. Ihr zahlt noch nichts.',
      hostsLabel: 'Wunsch-Hosts',
      hostsHint: 'Wählt so viele ihr wollt, oder keinen, dann schlagen wir ein Programm vor.',
      idea: 'Was stellt ihr euch vor?',
      ideaPh: 'Anlass, Format, gewünschte Workshops, Budget, besondere Wünsche',
    },
  },
  fr: {
    kicker: 'Grands événements d’entreprise à Berlin',
    title: 'Jusqu’à 1 000 personnes : plusieurs hôtes, un seul événement',
    copy: 'Vous prévoyez 100, 500 ou même 1 000 personnes ? Nous réunissons autant de nos hôtes qu’il le faut, dans des artisanats très différents : des bougies à une table, des terrariums à la suivante, de la poterie, de la sérigraphie, de la cuisine et plus encore dans toute la salle. Vos invités choisissent ou passent d’un atelier à l’autre, et vous n’avez qu’un contact, un devis et une facture.',
    points: [
      'De 30 à 1 000 personnes, dans votre lieu, vos bureaux ou réparties entre plusieurs ateliers',
      'Choisissez les hôtes de cette page, ou laissez-nous composer le programme',
      'Un devis sous 24 heures, une seule facture pour tout',
    ],
    cta: 'Organiser un événement avec plusieurs hôtes',
    occasionsLabel: 'Idéal pour',
    occasions: ['Fêtes de Noël', 'Fêtes d’été', 'Journées d’entreprise', 'Kick-offs & all-hands', 'Conférences & séminaires', 'Événements clients'],
    faq: [
      { q: 'Pouvez-vous organiser un événement d’équipe pour 500 ou 1 000 personnes à Berlin ?', a: 'Oui. Pour les grands groupes, nous installons plusieurs ateliers avec différents hôtes dans votre lieu : bougies, terrariums, poterie, impression… Les invités tournent ou choisissent leur favori, et vous avez un seul contact, un devis et une facture.' },
      { q: 'Quels ateliers conviennent aux grands événements d’entreprise ?', a: 'Les formats courts et manuels où chacun repart avec quelque chose : mini-terrariums, bougies, poterie, linogravure et sérigraphie, cuisine et dégustations. Nous mélangeons les artisanats pour que chacun trouve son bonheur.' },
    ],
    specialKicker: 'Vous n’avez pas trouvé votre bonheur ?',
    specialCopy: 'Dites-nous ce que vous imaginez, même si ce n’est pas sur cette page : un thème, un format, un artisanat que vous aimeriez essayer. Nous interrogeons notre réseau de créateurs berlinois et revenons vers vous avec des propositions.',
    specialCta: 'Envoyer une demande spéciale',
    dialog: {
      event: 'Événement avec plusieurs hôtes',
      eventLede: 'Parlez-nous de votre événement : combien de personnes, quand et où. Choisissez les hôtes qui vous plaisent, ou laissez-nous faire. Rien à payer pour l’instant.',
      special: 'Demande spéciale',
      specialLede: 'Décrivez ce que vous cherchez, nous revenons vers vous avec des idées et un devis. Rien à payer pour l’instant.',
      hostsLabel: 'Hôtes souhaités',
      hostsHint: 'Choisissez-en autant que vous voulez, ou aucun et nous proposons un programme.',
      idea: 'Qu’avez-vous en tête ?',
      ideaPh: 'Occasion, format, ateliers souhaités, budget, demandes particulières',
    },
  },
  es: {
    kicker: 'Grandes eventos de empresa en Berlín',
    title: 'Hasta 1.000 personas: muchos anfitriones, un evento',
    copy: '¿Planeáis algo para 100, 500 o incluso 1.000 personas? Reunimos a tantos anfitriones como necesitéis, de oficios muy distintos: velas en una mesa, terrarios en la siguiente, cerámica, serigrafía, cocina y más por toda la sala. Los invitados eligen o van rotando entre estaciones, y vosotros tenéis un solo contacto, un presupuesto y una factura.',
    points: [
      'De 30 hasta 1.000 personas, en vuestro espacio, vuestra oficina o repartidos en varios estudios',
      'Elegid a cualquier anfitrión de esta página, o dejad que armemos el programa',
      'Un presupuesto en 24 horas, una sola factura para todo',
    ],
    cta: 'Planear un evento con varios anfitriones',
    occasionsLabel: 'Ideal para',
    occasions: ['Cenas de Navidad', 'Fiestas de verano', 'Jornadas de empresa', 'Kick-offs y all-hands', 'Conferencias y offsites', 'Eventos con clientes'],
    faq: [
      { q: '¿Podéis organizar un evento de equipo para 500 o 1.000 personas en Berlín?', a: 'Sí. Para grupos grandes montamos varias estaciones de taller con distintos anfitriones en vuestro espacio: velas, terrarios, cerámica, impresión… Los invitados rotan o eligen su favorita, y tenéis un solo contacto, un presupuesto y una factura.' },
      { q: '¿Qué talleres funcionan para grandes eventos de empresa?', a: 'Formatos cortos y prácticos en los que todos se llevan algo: mini terrarios, velas, cerámica, linograbado y serigrafía, cocina y catas. Mezclamos oficios para que haya algo para todos.' },
    ],
    specialKicker: '¿No encontráis lo que buscáis?',
    specialCopy: 'Contadnos qué tenéis en mente, aunque no esté en esta página: un tema, un formato, una artesanía que os apetezca probar. Preguntamos en nuestra red de creadores de Berlín y volvemos con propuestas.',
    specialCta: 'Enviar una solicitud especial',
    dialog: {
      event: 'Evento con varios anfitriones',
      eventLede: 'Contadnos sobre vuestro evento: cuántas personas, cuándo y dónde. Elegid los anfitriones que os gusten o dejadlo en nuestras manos. Nada que pagar todavía.',
      special: 'Solicitud especial',
      specialLede: 'Describid lo que buscáis y volvemos con ideas y un presupuesto. Nada que pagar todavía.',
      hostsLabel: 'Anfitriones que os gustan',
      hostsHint: 'Elegid tantos como queráis, o ninguno y os proponemos un programa.',
      idea: '¿Qué tenéis en mente?',
      ideaPh: 'Ocasión, formato, talleres deseados, presupuesto, peticiones especiales',
    },
  },
  it: {
    kicker: 'Grandi eventi aziendali a Berlino',
    title: 'Fino a 1.000 persone: tanti host, un solo evento',
    copy: 'Organizzate per 100, 500 o addirittura 1.000 persone? Riuniamo tutti gli host che servono, da mestieri molto diversi: candele a un tavolo, terrari a quello accanto, ceramica, serigrafia, cucina e altro in tutta la sala. Gli ospiti scelgono o ruotano tra le postazioni, e voi avete un solo contatto, un preventivo e una fattura.',
    points: [
      'Da 30 fino a 1.000 persone, nella vostra location, in ufficio o in più studi',
      'Scegliete qualsiasi host di questa pagina, oppure il programma lo componiamo noi',
      'Un preventivo entro 24 ore, una sola fattura per tutto',
    ],
    cta: 'Organizza un evento con più host',
    occasionsLabel: 'Ideale per',
    occasions: ['Feste di Natale', 'Feste d’estate', 'Giornate aziendali', 'Kick-off e all-hands', 'Conferenze e offsite', 'Eventi con i clienti'],
    faq: [
      { q: 'Potete organizzare un evento di team per 500 o 1.000 persone a Berlino?', a: 'Sì. Per i grandi gruppi allestiamo più postazioni con host diversi nella vostra location: candele, terrari, ceramica, stampa… Gli ospiti ruotano o scelgono la preferita, e voi avete un solo contatto, un preventivo e una fattura.' },
      { q: 'Quali workshop funzionano per i grandi eventi aziendali?', a: 'Formati brevi e pratici in cui tutti portano a casa qualcosa: mini terrari, candele, ceramica, linoleografia e serigrafia, cucina e degustazioni. Mescoliamo i mestieri perché ci sia qualcosa per tutti.' },
    ],
    specialKicker: 'Non avete trovato quello che cercate?',
    specialCopy: 'Raccontateci cosa avete in mente, anche se non è in questa pagina: un tema, un formato, un mestiere che vorreste provare. Chiediamo alla nostra rete di creativi berlinesi e torniamo con delle proposte.',
    specialCta: 'Invia una richiesta speciale',
    dialog: {
      event: 'Evento con più host',
      eventLede: 'Raccontateci il vostro evento: quante persone, quando e dove. Scegliete gli host che vi piacciono o lasciate fare a noi. Niente da pagare per ora.',
      special: 'Richiesta speciale',
      specialLede: 'Descrivete cosa cercate e torniamo con idee e un preventivo. Niente da pagare per ora.',
      hostsLabel: 'Host desiderati',
      hostsHint: 'Sceglietene quanti volete, oppure nessuno e vi proponiamo un programma.',
      idea: 'Cosa avete in mente?',
      ideaPh: 'Occasione, formato, workshop desiderati, budget, richieste particolari',
    },
  },
  nl: {
    kicker: 'Grote bedrijfsevents in Berlijn',
    title: 'Tot 1.000 mensen: veel hosts, één event',
    copy: 'Plannen jullie iets voor 100, 500 of zelfs 1.000 mensen? Wij brengen zoveel hosts samen als nodig, uit heel verschillende ambachten: kaarsen aan de ene tafel, terrariums aan de volgende, keramiek, zeefdruk, koken en meer door de hele ruimte. Jullie gasten kiezen of rouleren tussen de stations, en jullie hebben één contactpersoon, één offerte en één factuur.',
    points: [
      'Van 30 tot 1.000 mensen, op jullie locatie, op kantoor of verspreid over meerdere studio’s',
      'Kies hosts van deze pagina, of laat ons het programma samenstellen',
      'Eén offerte binnen 24 uur, één factuur voor alles',
    ],
    cta: 'Event met meerdere hosts plannen',
    occasionsLabel: 'Ideaal voor',
    occasions: ['Kerstborrels', 'Zomerfeesten', 'Bedrijfsdagen', 'Kick-offs & all-hands', 'Conferenties & offsites', 'Klantevents'],
    faq: [
      { q: 'Kunnen jullie een teamevent voor 500 of 1.000 mensen in Berlijn organiseren?', a: 'Ja. Voor grote groepen zetten we meerdere workshopstations met verschillende hosts op jullie locatie neer: kaarsen, terrariums, keramiek, drukwerk… Gasten rouleren of kiezen hun favoriet, en jullie hebben één contactpersoon, één offerte en één factuur.' },
      { q: 'Welke workshops werken voor grote bedrijfsevents?', a: 'Korte, praktische formats waarbij iedereen iets mee naar huis neemt: mini-terrariums, kaarsen, keramiek, linosnede en zeefdruk, koken en proeverijen. We mixen ambachten zodat er voor iedereen iets is.' },
    ],
    specialKicker: 'Niet gevonden wat je zoekt?',
    specialCopy: 'Vertel ons wat jullie voor ogen hebben, ook als het hier niet staat: een thema, een formaat, een ambacht dat jullie willen proberen. Wij vragen het na in ons netwerk van Berlijnse makers en komen terug met voorstellen.',
    specialCta: 'Speciale aanvraag sturen',
    dialog: {
      event: 'Event met meerdere hosts',
      eventLede: 'Vertel ons over jullie event: hoeveel mensen, wanneer en waar. Kies de hosts die jullie leuk vinden, of laat het aan ons over. Nog niets te betalen.',
      special: 'Speciale aanvraag',
      specialLede: 'Beschrijf wat jullie zoeken, dan komen wij terug met ideeën en een offerte. Nog niets te betalen.',
      hostsLabel: 'Gewenste hosts',
      hostsHint: 'Kies er zoveel als je wilt, of geen, dan stellen wij een programma voor.',
      idea: 'Wat hebben jullie in gedachten?',
      ideaPh: 'Gelegenheid, formaat, gewenste workshops, budget, bijzondere wensen',
    },
  },
  pl: {
    kicker: 'Duże eventy firmowe w Berlinie',
    title: 'Do 1000 osób: wielu gospodarzy, jedno wydarzenie',
    copy: 'Planujecie coś dla 100, 500 czy nawet 1000 osób? Zbieramy tylu gospodarzy, ilu potrzeba, z bardzo różnych rzemiosł: świece przy jednym stole, terraria przy następnym, ceramika, sitodruk, gotowanie i więcej w całej sali. Goście wybierają lub krążą między stanowiskami, a wy macie jeden kontakt, jedną ofertę i jedną fakturę.',
    points: [
      'Od 30 do 1000 osób, w waszym miejscu, biurze lub w kilku pracowniach',
      'Wybierzcie dowolnych gospodarzy z tej strony albo zostawcie program nam',
      'Jedna oferta w ciągu 24 godzin, jedna faktura za wszystko',
    ],
    cta: 'Zaplanuj wydarzenie z kilkoma gospodarzami',
    occasionsLabel: 'Idealne na',
    occasions: ['Wigilie firmowe', 'Imprezy letnie', 'Dni firmowe', 'Kick-offy i all-hands', 'Konferencje i wyjazdy', 'Eventy dla klientów'],
    faq: [
      { q: 'Czy zorganizujecie event dla 500 lub 1000 osób w Berlinie?', a: 'Tak. Dla dużych grup ustawiamy kilka stanowisk warsztatowych z różnymi gospodarzami w waszym miejscu: świece, terraria, ceramika, druk… Goście krążą lub wybierają ulubione, a wy macie jeden kontakt, jedną ofertę i jedną fakturę.' },
      { q: 'Jakie warsztaty sprawdzają się na dużych eventach firmowych?', a: 'Krótkie, praktyczne formy, z których każdy coś zabiera: mini terraria, świece, ceramika, linoryt i sitodruk, gotowanie i degustacje. Łączymy rzemiosła, żeby każdy znalazł coś dla siebie.' },
    ],
    specialKicker: 'Nie znaleźliście tego, czego szukacie?',
    specialCopy: 'Opowiedzcie nam, co macie na myśli, nawet jeśli tego tu nie ma: temat, format, rzemiosło, które chcecie wypróbować. Pytamy w naszej sieci berlińskich twórców i wracamy z propozycjami.',
    specialCta: 'Wyślij zapytanie specjalne',
    dialog: {
      event: 'Wydarzenie z kilkoma gospodarzami',
      eventLede: 'Opowiedzcie o wydarzeniu: ile osób, kiedy i gdzie. Wybierzcie gospodarzy, którzy wam się podobają, albo zostawcie to nam. Na razie nic nie płacicie.',
      special: 'Zapytanie specjalne',
      specialLede: 'Opiszcie, czego szukacie, a wrócimy z pomysłami i ofertą. Na razie nic nie płacicie.',
      hostsLabel: 'Wybrani gospodarze',
      hostsHint: 'Wybierzcie dowolnie wielu albo żadnego, a zaproponujemy program.',
      idea: 'Co macie na myśli?',
      ideaPh: 'Okazja, format, wymarzone warsztaty, budżet, szczególne życzenia',
    },
  },
  tr: {
    kicker: 'Berlin’de büyük şirket etkinlikleri',
    title: '1.000 kişiye kadar: çok sayıda ev sahibi, tek etkinlik',
    copy: '100, 500 hatta 1.000 kişi için mi plan yapıyorsunuz? Çok farklı zanaatlardan, ihtiyacınız kadar ev sahibini bir araya getiriyoruz: bir masada mum, yanındakinde teraryum, salonun dört bir yanında seramik, serigrafi, yemek ve daha fazlası. Konuklarınız istasyonlar arasında seçer ya da dolaşır; sizin ise tek muhatabınız, tek teklifiniz ve tek faturanız olur.',
    points: [
      '30’dan 1.000 kişiye kadar, mekânınızda, ofisinizde ya da birkaç atölyeye yayılarak',
      'Bu sayfadan istediğiniz ev sahiplerini seçin ya da programı biz kuralım',
      '24 saat içinde tek teklif, her şey için tek fatura',
    ],
    cta: 'Birkaç ev sahibiyle etkinlik planla',
    occasionsLabel: 'Şunlar için ideal',
    occasions: ['Yılbaşı partileri', 'Yaz partileri', 'Şirket günleri', 'Kick-off ve all-hands', 'Konferans ve offsite', 'Müşteri etkinlikleri'],
    faq: [
      { q: 'Berlin’de 500 ya da 1.000 kişilik bir ekip etkinliği düzenleyebilir misiniz?', a: 'Evet. Büyük gruplar için mekânınızda farklı ev sahipleriyle birkaç atölye istasyonu kuruyoruz: mum, teraryum, seramik, baskı… Konuklar dolaşır ya da favorisini seçer; sizin tek muhatabınız, tek teklifiniz ve tek faturanız olur.' },
      { q: 'Büyük şirket etkinlikleri için hangi atölyeler uygun?', a: 'Herkesin elinde bir şeyle döndüğü kısa, uygulamalı formatlar: mini teraryum, mum, seramik, linol ve serigrafi baskı, yemek ve tadımlar. Herkese bir şey olsun diye zanaatları karıştırıyoruz.' },
    ],
    specialKicker: 'Aradığınızı bulamadınız mı?',
    specialCopy: 'Burada yer almasa bile aklınızdakini anlatın: bir tema, bir format, denemek istediğiniz bir zanaat. Berlinli üreticilerden oluşan ağımıza sorar, size önerilerle döneriz.',
    specialCta: 'Özel talep gönder',
    dialog: {
      event: 'Birkaç ev sahibiyle etkinlik',
      eventLede: 'Etkinliğinizi anlatın: kaç kişi, ne zaman ve nerede. Beğendiğiniz ev sahiplerini seçin ya da bize bırakın. Şimdilik ödeme yok.',
      special: 'Özel talep',
      specialLede: 'Ne aradığınızı anlatın, size fikirler ve bir teklifle dönelim. Şimdilik ödeme yok.',
      hostsLabel: 'İstediğiniz ev sahipleri',
      hostsHint: 'İstediğiniz kadar seçin ya da hiç seçmeyin, biz bir program önerelim.',
      idea: 'Aklınızda ne var?',
      ideaPh: 'Vesile, format, istediğiniz atölyeler, bütçe, özel istekler',
    },
  },
};
