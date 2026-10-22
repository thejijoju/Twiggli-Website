/** The about page (AboutPage.astro): /about/ in English and /de/ueber-uns/
 *  in German. Jirel's own words on why Twiggli exists; light formatting
 *  only, so keep the copy as written. */

export interface AboutCopy {
  title: string; description: string;
  kicker: string; lead: string; intro: string;
  sections: { h2: string; body: string }[];
  signoff: string; name: string; role: string; photoAlt: string;
  ctaWorkshops: string; ctaHost: string;
}

export const aboutCopy: Record<'en' | 'de', AboutCopy> = {
  en: {
    title: 'About Twiggli: hands-on workshops with Berlin makers',
    description: 'Twiggli brings people in Berlin together with the city’s makers: potters, candle makers, screen printers, florists. Why we started it, what we do, and where the name comes from.',
    kicker: 'About Twiggli',
    lead: 'Berlin is full of people who can make things.',
    intro: 'Potters, candle makers, screen printers, sculptors, florists: in backyards and small studios all over the city, beautiful things are made every day. At the same time, so many of us spend our evenings in front of a screen, wondering where to actually meet people in this big city.',
    sections: [
      {
        h2: 'Twiggli brings these two worlds together.',
        body: 'I started Twiggli because I saw how much talent works quietly out of sight here. Many makers pour their hearts into their workshops, but they struggle with high rents and get lost in the noise of the big platforms. They deserve a stage. And all of us deserve places where we can put our phones away, make something with our own hands, and meet people who live just a few streets away.',
      },
      {
        h2: 'What we do',
        body: 'We bring you to the makers, and the makers to you: for an evening with friends, a hen party, a team event or a Christmas party, in a studio or right in your office. Every booking through Twiggli supports a real person in Berlin, not a corporation.',
      },
      {
        h2: 'Why “Twiggli”?',
        body: 'A twig is small, but many twigs make a nest. That’s how we see our community: hosts who share spaces and tips with each other, and guests who arrive as strangers and leave with something they made and a few new connections.',
      },
    ],
    signoff: 'So glad you’re here. 🌿',
    name: 'Jirel',
    role: 'founder',
    photoAlt: 'Jirel, founder of Twiggli',
    ctaWorkshops: 'Discover workshops',
    ctaHost: 'Become a host',
  },
  de: {
    title: 'Über Twiggli: Workshops bei Berliner Maker*innen',
    description: 'Twiggli bringt Menschen in Berlin mit den Maker*innen der Stadt zusammen: Töpferinnen, Kerzenmacher, Siebdruckerinnen, Floristinnen. Warum es Twiggli gibt, was wir machen und woher der Name kommt.',
    kicker: 'Über Twiggli',
    lead: 'Berlin ist voller Menschen, die etwas können.',
    intro: 'Töpferinnen, Kerzenmacher, Siebdruckerinnen, Bildhauer, Floristinnen: In Hinterhöfen und kleinen Studios in der ganzen Stadt entstehen jeden Tag wunderschöne Dinge. Und gleichzeitig sitzen so viele von uns abends vor einem Bildschirm und fragen sich, wo man in dieser großen Stadt eigentlich Anschluss findet.',
    sections: [
      {
        h2: 'Twiggli verbindet diese beiden Welten.',
        body: 'Ich habe Twiggli gegründet, weil ich gesehen habe, wie viel Talent hier im Verborgenen arbeitet. Viele Maker*innen stecken ihr Herz in ihre Workshops, kämpfen aber mit hohen Mieten und gehen im Lärm der großen Plattformen unter. Sie verdienen eine Bühne. Und wir alle verdienen Orte, an denen wir das Handy weglegen, etwas mit den eigenen Händen schaffen und dabei Menschen kennenlernen, die nur ein paar Straßen weiter wohnen.',
      },
      {
        h2: 'Was wir machen',
        body: 'Wir bringen euch zu den Maker*innen, und die Maker*innen zu euch: als Abend unter Freund*innen, als Junggesellinnenabschied, als Teamevent oder Weihnachtsfeier, im Studio oder direkt bei euch im Büro. Jede Buchung über Twiggli unterstützt eine echte Person aus Berlin, keinen Konzern.',
      },
      {
        h2: 'Warum „Twiggli“?',
        body: 'Ein Zweig ist klein, aber aus vielen Zweigen wird ein Nest. So sehen wir unsere Community: Hosts, die sich gegenseitig Räume und Tipps geben, und Teilnehmende, die als Fremde kommen und mit einem selbstgemachten Stück und ein paar neuen Kontakten nach Hause gehen.',
      },
    ],
    signoff: 'Schön, dass du da bist. 🌿',
    name: 'Jirel',
    role: 'Gründerin',
    photoAlt: 'Jirel, Gründerin von Twiggli',
    ctaWorkshops: 'Workshops entdecken',
    ctaHost: 'Gastgeber*in werden',
  },
};
