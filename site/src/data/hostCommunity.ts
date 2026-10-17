import type { Lang } from '../lib/url.ts';

/** The host community banner (HostCommunity.astro), on the home page under
 *  the makers row and on the become-a-host page under the form: the same
 *  shape as the home page's "come on your own" card, with a row of small
 *  round photos, one per craft. `crafts` labels those photos in order. */
export interface HostCommunityCopy {
  kicker: string;
  title: string;
  copy: string;
  join: string;
  become: string;
  crafts: [string, string, string, string, string, string, string];
}

export const hostCommunityCopy: Record<Lang, HostCommunityCopy> = {
  en: {
    kicker: 'Host community',
    title: 'Host on your own, grow with others',
    copy: 'Every Twiggli host joins our host community. Over 30 Berlin makers already swap good practices, find studio space and meet up.',
    join: 'Join the community', become: 'Become a host',
    crafts: ['Tufting', 'Ceramics', 'Fermenting', 'Printing', 'Perfume', 'Forging', 'Weaving'],
  },
  de: {
    kicker: 'Host-Community',
    title: 'Allein unterrichten, gemeinsam wachsen',
    copy: 'Alle Gastgeber auf Twiggli gehören zu unserer Host-Community. Über 30 Berliner Kreative tauschen sich schon über gute Praxis aus, finden Studioräume und treffen sich.',
    join: 'Mach mit', become: 'Gastgeber werden',
    crafts: ['Tufting', 'Keramik', 'Fermentieren', 'Drucken', 'Parfüm', 'Schmieden', 'Weben'],
  },
  fr: {
    kicker: 'Communauté des hôtes',
    title: 'Animez seul, grandissez ensemble',
    copy: 'Chaque hôte Twiggli rejoint notre communauté. Plus de 30 créateurs berlinois y partagent déjà leurs bonnes pratiques, trouvent un atelier et se retrouvent.',
    join: 'Rejoindre la communauté', become: 'Devenir hôte',
    crafts: ['Tufting', 'Céramique', 'Fermentation', 'Impression', 'Parfum', 'Forge', 'Tissage'],
  },
  es: {
    kicker: 'Comunidad de anfitriones',
    title: 'Enseña por tu cuenta, crece con otros',
    copy: 'Cada anfitrión de Twiggli entra en nuestra comunidad. Más de 30 creadores de Berlín ya comparten buenas prácticas, encuentran espacio de estudio y se reúnen.',
    join: 'Únete a la comunidad', become: 'Hazte anfitrión',
    crafts: ['Tufting', 'Cerámica', 'Fermentación', 'Grabado', 'Perfume', 'Forja', 'Tejido'],
  },
  it: {
    kicker: 'Community degli host',
    title: 'Insegna da solo, cresci con gli altri',
    copy: 'Ogni host di Twiggli entra nella nostra community. Più di 30 creativi di Berlino si scambiano già buone pratiche, trovano spazi studio e si incontrano.',
    join: 'Entra nella community', become: 'Diventa host',
    crafts: ['Tufting', 'Ceramica', 'Fermentazione', 'Stampa', 'Profumo', 'Forgiatura', 'Tessitura'],
  },
  nl: {
    kicker: 'Host-community',
    title: 'Zelf lesgeven, samen groeien',
    copy: 'Elke Twiggli-host wordt lid van onze host-community. Meer dan 30 Berlijnse makers wisselen al tips uit, vinden studioruimte en ontmoeten elkaar.',
    join: 'Word lid', become: 'Word host',
    crafts: ['Tuften', 'Keramiek', 'Fermenteren', 'Drukken', 'Parfum', 'Smeden', 'Weven'],
  },
  pl: {
    kicker: 'Społeczność gospodarzy',
    title: 'Prowadź sam, rozwijaj się z innymi',
    copy: 'Każdy gospodarz Twiggli dołącza do naszej społeczności. Ponad 30 twórców z Berlina wymienia się już dobrymi praktykami, znajduje pracownie i spotyka się.',
    join: 'Dołącz do społeczności', become: 'Zostań gospodarzem',
    crafts: ['Tufting', 'Ceramika', 'Fermentacja', 'Druk', 'Perfumy', 'Kowalstwo', 'Tkactwo'],
  },
  tr: {
    kicker: 'Ev sahibi topluluğu',
    title: 'Tek başına öğret, birlikte büyü',
    copy: 'Her Twiggli ev sahibi topluluğumuza katılır. 30’dan fazla Berlinli zanaatkâr şimdiden iyi uygulamaları paylaşıyor, atölye alanı buluyor ve buluşuyor.',
    join: 'Topluluğa katıl', become: 'Ev sahibi ol',
    crafts: ['Tufting', 'Seramik', 'Fermantasyon', 'Baskı', 'Parfüm', 'Demircilik', 'Dokuma'],
  },
};
