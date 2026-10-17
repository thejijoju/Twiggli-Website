import type { Lang } from '../lib/url.ts';

/** The host community banner (HostCommunity.astro), on the home page under
 *  the makers row and on the become-a-host page under the form: the same
 *  shape as the home page's "come on your own" card, with a cluster of small
 *  round photos, one per craft, then a plus and an empty circle for the
 *  reader. `crafts` names those photos in order. */
export interface HostCommunityCopy {
  kicker: string;
  title: string;
  copy: string;
  join: string;
  become: string;
  /** The empty circle at the end of the row: the reader, next to join. */
  you: string;
  crafts: [string, string, string, string, string, string, string];
}

export const hostCommunityCopy: Record<Lang, HostCommunityCopy> = {
  en: {
    kicker: 'Host community',
    title: 'Host on your own, grow with others',
    copy: 'Every Twiggli host joins our host community. Over 30 Berlin makers already swap good practices, find studio space and meet up.',
    join: 'Join the community', become: 'Become a host',
    you: 'You?',
    crafts: ['Ceramics', 'Candles', 'Sushi', 'Cyanotype', 'Forging', 'Fermenting', 'Painting'],
  },
  de: {
    kicker: 'Host-Community',
    title: 'Allein unterrichten, gemeinsam wachsen',
    copy: 'Alle Gastgeber auf Twiggli gehören zu unserer Host-Community. Über 30 Berliner Kreative tauschen sich schon über gute Praxis aus, finden Studioräume und treffen sich.',
    join: 'Mach mit', become: 'Gastgeber werden',
    you: 'Du?',
    crafts: ['Keramik', 'Kerzen', 'Sushi', 'Cyanotypie', 'Schmieden', 'Fermentieren', 'Malen'],
  },
  fr: {
    kicker: 'Communauté des hôtes',
    title: 'Animez seul, grandissez ensemble',
    copy: 'Chaque hôte Twiggli rejoint notre communauté. Plus de 30 créateurs berlinois y partagent déjà leurs bonnes pratiques, trouvent un atelier et se retrouvent.',
    join: 'Rejoindre la communauté', become: 'Devenir hôte',
    you: 'Vous ?',
    crafts: ['Céramique', 'Bougies', 'Sushi', 'Cyanotype', 'Forge', 'Fermentation', 'Peinture'],
  },
  es: {
    kicker: 'Comunidad de anfitriones',
    title: 'Enseña por tu cuenta, crece con otros',
    copy: 'Cada anfitrión de Twiggli entra en nuestra comunidad. Más de 30 creadores de Berlín ya comparten buenas prácticas, encuentran espacio de estudio y se reúnen.',
    join: 'Únete a la comunidad', become: 'Hazte anfitrión',
    you: '¿Tú?',
    crafts: ['Cerámica', 'Velas', 'Sushi', 'Cianotipia', 'Forja', 'Fermentación', 'Pintura'],
  },
  it: {
    kicker: 'Community degli host',
    title: 'Insegna da solo, cresci con gli altri',
    copy: 'Ogni host di Twiggli entra nella nostra community. Più di 30 creativi di Berlino si scambiano già buone pratiche, trovano spazi studio e si incontrano.',
    join: 'Entra nella community', become: 'Diventa host',
    you: 'Tu?',
    crafts: ['Ceramica', 'Candele', 'Sushi', 'Cianotipia', 'Forgiatura', 'Fermentazione', 'Pittura'],
  },
  nl: {
    kicker: 'Host-community',
    title: 'Zelf lesgeven, samen groeien',
    copy: 'Elke Twiggli-host wordt lid van onze host-community. Meer dan 30 Berlijnse makers wisselen al tips uit, vinden studioruimte en ontmoeten elkaar.',
    join: 'Word lid', become: 'Word host',
    you: 'Jij?',
    crafts: ['Keramiek', 'Kaarsen', 'Sushi', 'Cyanotypie', 'Smeden', 'Fermenteren', 'Schilderen'],
  },
  pl: {
    kicker: 'Społeczność gospodarzy',
    title: 'Prowadź sam, rozwijaj się z innymi',
    copy: 'Każdy gospodarz Twiggli dołącza do naszej społeczności. Ponad 30 twórców z Berlina wymienia się już dobrymi praktykami, znajduje pracownie i spotyka się.',
    join: 'Dołącz do społeczności', become: 'Zostań gospodarzem',
    you: 'Ty?',
    crafts: ['Ceramika', 'Świece', 'Sushi', 'Cyjanotypia', 'Kowalstwo', 'Fermentacja', 'Malarstwo'],
  },
  tr: {
    kicker: 'Ev sahibi topluluğu',
    title: 'Tek başına öğret, birlikte büyü',
    copy: 'Her Twiggli ev sahibi topluluğumuza katılır. 30’dan fazla Berlinli zanaatkâr şimdiden iyi uygulamaları paylaşıyor, atölye alanı buluyor ve buluşuyor.',
    join: 'Topluluğa katıl', become: 'Ev sahibi ol',
    you: 'Sen?',
    crafts: ['Seramik', 'Mum', 'Suşi', 'Siyanotip', 'Demircilik', 'Fermantasyon', 'Resim'],
  },
};
