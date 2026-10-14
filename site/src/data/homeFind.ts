import type { Lang } from '../lib/url.ts';

/** The home page's way into the activities (ActivityLinks.astro): a row of
 *  round reels, quick links by time and company, and a word for anyone
 *  thinking of coming on their own. */
export interface HomeFindCopy {
  title: string;
  hand: string;
  today: string;
  team: string;
  solo: string;
  soloTitle: string;
  soloCopy: string;
  soloCta: string;
}

export const homeFindCopy: Record<Lang, HomeFindCopy> = {
  en: {
    title: 'What do you want to', hand: 'make?', today: 'Today', team: 'With your team', solo: 'Going alone',
    soloTitle: 'Come on your own, leave with new friends',
    soloCopy: 'Lots of people come on their own. Small groups around one table, everyone’s a beginner and your hands are busy, so talking comes easily. The relaxed way to meet people in Berlin.',
    soloCta: 'See what’s on this week',
  },
  de: {
    title: 'Was möchtest du', hand: 'machen?', today: 'Heute', team: 'Mit dem Team', solo: 'Allein hingehen',
    soloTitle: 'Komm allein, geh mit neuen Freunden',
    soloCopy: 'Viele kommen allein. Kleine Gruppen an einem Tisch, alle sind Anfänger und die Hände sind beschäftigt, so kommt man ganz leicht ins Gespräch. Die entspannte Art, in Berlin Leute kennenzulernen.',
    soloCta: 'Was diese Woche läuft',
  },
  fr: {
    title: 'Qu’avez-vous envie de', hand: 'créer ?', today: 'Aujourd’hui', team: 'En équipe', solo: 'En solo',
    soloTitle: 'Venez seul, repartez avec de nouveaux amis',
    soloCopy: 'Beaucoup viennent seuls. Petits groupes autour d’une table, tout le monde débute et les mains sont occupées : la conversation vient toute seule. La façon détendue de rencontrer du monde à Berlin.',
    soloCta: 'Voir le programme de la semaine',
  },
  es: {
    title: '¿Qué te apetece', hand: 'crear?', today: 'Hoy', team: 'Con tu equipo', solo: 'Ir solo',
    soloTitle: 'Ven solo, vete con nuevos amigos',
    soloCopy: 'Mucha gente viene sola. Grupos pequeños alrededor de una mesa, todos son principiantes y las manos están ocupadas, así que la conversación surge sola. La forma relajada de conocer gente en Berlín.',
    soloCta: 'Ver lo que hay esta semana',
  },
  it: {
    title: 'Cosa ti va di', hand: 'creare?', today: 'Oggi', team: 'Con il tuo team', solo: 'Da solo',
    soloTitle: 'Vieni da solo, riparti con nuovi amici',
    soloCopy: 'Tanti vengono da soli. Piccoli gruppi attorno a un tavolo, tutti principianti e le mani occupate: la conversazione viene da sé. Il modo rilassato per conoscere gente a Berlino.',
    soloCta: 'Cosa c’è questa settimana',
  },
  nl: {
    title: 'Wat wil je', hand: 'maken?', today: 'Vandaag', team: 'Met je team', solo: 'Alleen gaan',
    soloTitle: 'Kom alleen, ga naar huis met nieuwe vrienden',
    soloCopy: 'Veel mensen komen alleen. Kleine groepen aan één tafel, iedereen is beginner en je handen zijn bezig, dus praten gaat vanzelf. De ontspannen manier om mensen te leren kennen in Berlijn.',
    soloCta: 'Bekijk wat er deze week is',
  },
  pl: {
    title: 'Co chcesz', hand: 'stworzyć?', today: 'Dzisiaj', team: 'Z zespołem', solo: 'W pojedynkę',
    soloTitle: 'Przyjdź sam, wyjdź z nowymi znajomymi',
    soloCopy: 'Wiele osób przychodzi samemu. Małe grupy przy jednym stole, wszyscy są początkujący, a ręce zajęte, więc rozmowa przychodzi sama. Luźny sposób, by poznać ludzi w Berlinie.',
    soloCta: 'Zobacz, co się dzieje w tym tygodniu',
  },
  tr: {
    title: 'Ne', hand: 'yapmak istersin?', today: 'Bugün', team: 'Ekibinle', solo: 'Tek başına',
    soloTitle: 'Tek başına gel, yeni arkadaşlarla ayrıl',
    soloCopy: 'Pek çok kişi tek başına gelir. Tek masa etrafında küçük gruplar, herkes yeni başlıyor ve eller meşgul, sohbet kendiliğinden açılır. Berlin’de insanlarla tanışmanın rahat yolu.',
    soloCta: 'Bu hafta neler var',
  },
};
