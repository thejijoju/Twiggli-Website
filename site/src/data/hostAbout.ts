import type { Lang } from '../lib/url.ts';

/** A host's own words for their page, where they have sent us some. It
 *  replaces the short blurb on the host page (the cards keep the blurb):
 *  paragraphs, then the list of what they run, then a closing line. English
 *  is as the host wrote it; the other languages are our translations. */
export interface HostAbout {
  paras: string[];
  listTitle: string;
  list: string[];
  closing: string;
}

export const hostAbout: Record<string, Record<Lang, HostAbout>> = {
  // Evelyn, 13 Oct 2026, in her own words.
  evelyn: {
    en: {
      paras: [
        'I’m Evelyn, a visual artist and printmaker from Transylvania, living in Berlin. I started TUKA Creative Club as a safe space for adults who want to be kids again.',
        'Remember when making things was just fun? At TUKA, we slow down, sit together and make something with our hands. No experience needed, and no pressure to be “good at art.”',
        'Each workshop focuses on one craft, so the whole group learns together step by step. You go home with something you made yourself, and usually a few new friends.',
      ],
      listTitle: 'Workshops I run:',
      list: [
        'Folklore-inspired embroidery',
        'Tote bag printing & painting',
        'Kumihimo: Japanese-style braided keychains',
        'Glass painting',
        'Watercolour painting',
        'Collage vision board making',
      ],
      closing: 'All materials provided, tea and snacks included.',
    },
    de: {
      paras: [
        'Ich bin Evelyn, bildende Künstlerin und Druckgrafikerin aus Siebenbürgen und lebe in Berlin. Den TUKA Creative Club habe ich als geschützten Raum für Erwachsene gegründet, die wieder Kind sein wollen.',
        'Weißt du noch, wie es war, als Basteln einfach Spaß gemacht hat? Bei TUKA nehmen wir uns Zeit, sitzen zusammen und machen etwas mit unseren Händen. Keine Vorkenntnisse nötig und kein Druck, „gut in Kunst“ zu sein.',
        'Jeder Workshop dreht sich um ein Handwerk, so lernt die ganze Gruppe Schritt für Schritt gemeinsam. Du gehst mit etwas nach Hause, das du selbst gemacht hast, und meistens mit ein paar neuen Freundinnen und Freunden.',
      ],
      listTitle: 'Meine Workshops:',
      list: [
        'Folklore-inspirierte Stickerei',
        'Stoffbeutel bedrucken & bemalen',
        'Kumihimo: geflochtene Schlüsselanhänger nach japanischer Art',
        'Glasmalerei',
        'Aquarellmalerei',
        'Vision Boards als Collage gestalten',
      ],
      closing: 'Alle Materialien gestellt, Tee und Snacks inklusive.',
    },
    fr: {
      paras: [
        'Je suis Evelyn, artiste visuelle et graveuse originaire de Transylvanie, installée à Berlin. J’ai créé le TUKA Creative Club comme un espace bienveillant pour les adultes qui veulent redevenir des enfants.',
        'Vous vous souvenez quand créer des choses était simplement amusant ? Chez TUKA, on ralentit, on s’assoit ensemble et on fabrique quelque chose de nos mains. Aucune expérience requise, et aucune pression pour être « doué en art ».',
        'Chaque atelier se concentre sur un savoir-faire, pour que tout le groupe apprenne ensemble, pas à pas. Vous repartez avec quelque chose que vous avez fait vous-même, et souvent quelques nouveaux amis.',
      ],
      listTitle: 'Mes ateliers :',
      list: [
        'Broderie inspirée du folklore',
        'Impression et peinture sur tote bag',
        'Kumihimo : porte-clés tressés à la japonaise',
        'Peinture sur verre',
        'Aquarelle',
        'Vision board en collage',
      ],
      closing: 'Tout le matériel est fourni, thé et en-cas compris.',
    },
    es: {
      paras: [
        'Soy Evelyn, artista visual y grabadora de Transilvania, y vivo en Berlín. Creé TUKA Creative Club como un espacio seguro para adultos que quieren volver a ser niños.',
        '¿Te acuerdas de cuando hacer cosas era simplemente divertido? En TUKA bajamos el ritmo, nos sentamos juntos y hacemos algo con las manos. No hace falta experiencia ni hay presión por ser «bueno en arte».',
        'Cada taller se centra en una técnica, así todo el grupo aprende junto paso a paso. Te vas a casa con algo hecho por ti y, normalmente, con algunos amigos nuevos.',
      ],
      listTitle: 'Mis talleres:',
      list: [
        'Bordado de inspiración folclórica',
        'Estampación y pintura de bolsas de tela',
        'Kumihimo: llaveros trenzados al estilo japonés',
        'Pintura sobre vidrio',
        'Acuarela',
        'Vision board en collage',
      ],
      closing: 'Todos los materiales incluidos, con té y algo para picar.',
    },
    it: {
      paras: [
        'Sono Evelyn, artista visiva e incisora della Transilvania, e vivo a Berlino. Ho fondato il TUKA Creative Club come uno spazio sicuro per gli adulti che vogliono tornare bambini.',
        'Ti ricordi quando creare era semplicemente divertente? Da TUKA rallentiamo, ci sediamo insieme e realizziamo qualcosa con le mani. Non serve esperienza e non c’è nessuna pressione a essere «bravi in arte».',
        'Ogni workshop è dedicato a una sola tecnica, così tutto il gruppo impara insieme passo dopo passo. Torni a casa con qualcosa fatto da te, e di solito con qualche nuovo amico.',
      ],
      listTitle: 'I miei workshop:',
      list: [
        'Ricamo ispirato al folklore',
        'Stampa e pittura su tote bag',
        'Kumihimo: portachiavi intrecciati in stile giapponese',
        'Pittura su vetro',
        'Acquerello',
        'Vision board in collage',
      ],
      closing: 'Tutti i materiali sono forniti, tè e snack inclusi.',
    },
    nl: {
      paras: [
        'Ik ben Evelyn, beeldend kunstenaar en grafisch kunstenaar uit Transsylvanië, en ik woon in Berlijn. Ik ben TUKA Creative Club begonnen als een veilige plek voor volwassenen die weer even kind willen zijn.',
        'Weet je nog dat dingen maken gewoon leuk was? Bij TUKA doen we het rustig aan, zitten we samen en maken we iets met onze handen. Geen ervaring nodig en geen druk om „goed in kunst” te zijn.',
        'Elke workshop draait om één ambacht, zodat de hele groep stap voor stap samen leert. Je gaat naar huis met iets dat je zelf hebt gemaakt, en meestal met een paar nieuwe vrienden.',
      ],
      listTitle: 'Mijn workshops:',
      list: [
        'Borduren geïnspireerd op folklore',
        'Totebags bedrukken en beschilderen',
        'Kumihimo: gevlochten sleutelhangers in Japanse stijl',
        'Glasschilderen',
        'Aquarelleren',
        'Een visionboard als collage maken',
      ],
      closing: 'Alle materialen inbegrepen, net als thee en snacks.',
    },
    pl: {
      paras: [
        'Jestem Evelyn, artystką wizualną i graficzką z Transylwanii, mieszkam w Berlinie. Założyłam TUKA Creative Club jako bezpieczną przestrzeń dla dorosłych, którzy chcą znów być dziećmi.',
        'Pamiętasz, kiedy tworzenie było po prostu zabawą? W TUKA zwalniamy, siadamy razem i robimy coś własnymi rękami. Nie potrzeba doświadczenia ani presji, żeby być „dobrym w sztuce”.',
        'Każdy warsztat skupia się na jednej technice, więc cała grupa uczy się razem krok po kroku. Wracasz do domu z czymś, co zrobiłeś sam, i zwykle z kilkoma nowymi znajomymi.',
      ],
      listTitle: 'Moje warsztaty:',
      list: [
        'Haft inspirowany folklorem',
        'Nadruki i malowanie na torbach',
        'Kumihimo: plecione breloczki w japońskim stylu',
        'Malowanie na szkle',
        'Akwarela',
        'Tablica marzeń w formie kolażu',
      ],
      closing: 'Wszystkie materiały zapewnione, herbata i przekąski w cenie.',
    },
    tr: {
      paras: [
        'Ben Evelyn, Transilvanyalı bir görsel sanatçı ve baskı sanatçısıyım, Berlin’de yaşıyorum. TUKA Creative Club’ı yeniden çocuk olmak isteyen yetişkinler için güvenli bir alan olarak kurdum.',
        'Bir şeyler yapmanın sadece eğlenceli olduğu zamanları hatırlıyor musun? TUKA’da yavaşlıyor, birlikte oturuyor ve ellerimizle bir şey yapıyoruz. Deneyim gerekmez, “sanatta iyi olma” baskısı da yok.',
        'Her atölye tek bir zanaata odaklanır, böylece tüm grup adım adım birlikte öğrenir. Eve kendi yaptığın bir şeyle ve genellikle birkaç yeni arkadaşla dönersin.',
      ],
      listTitle: 'Atölyelerim:',
      list: [
        'Folklordan ilham alan nakış',
        'Bez çanta baskısı ve boyama',
        'Kumihimo: Japon tarzı örgü anahtarlıklar',
        'Cam boyama',
        'Suluboya',
        'Kolaj vizyon panosu hazırlama',
      ],
      closing: 'Tüm malzemeler, çay ve atıştırmalıklar dahil.',
    },
  },
};

/** A host's logo, shown on their page beside their words. */
export const hostLogos: Record<string, string> = {
  evelyn: '/img/hosts/evelyn-tuka-logo.png',
};
