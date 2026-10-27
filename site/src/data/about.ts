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
    description: 'Twiggli is for people looking for community in Berlin. We bring them together with the city’s makers: potters, candle makers, screen printers, florists. Why we started it, what we do, and where the name comes from.',
    kicker: 'About Twiggli',
    lead: 'Berlin is full of people who can make things.',
    intro: 'Potters, candle makers, screen printers, sculptors, florists: in backyards and small studios all over the city, beautiful things are made every day. At the same time, so many of us spend our evenings in front of a screen, wondering where to actually meet people in this big city. Twiggli is for everyone looking for community.',
    sections: [
      {
        h2: 'Living from what you love',
        body: 'I started Twiggli because I saw how much talent works quietly out of sight here. Many makers put their whole heart into their craft and want to pass it on, but high rents and the noise of the big platforms make it hard. I want a city where you can make a living by sharing what you love. Twiggli is here to give them a stage.',
      },
      {
        h2: 'With our hands, no screen in between',
        body: 'AI is taking more and more screen work off our plates, and that frees up time again: time to spend with each other, to learn someone else’s craft and passion and make it your own. I believe that is exactly why the real thing is becoming more valuable: sitting at one table, feeling clay under your fingers, learning from someone who loves what they do. Not through a screen, but person to person. And the jobs that don’t need a screen are the safest ones. So let’s grow Berlin’s in-person craft economy together.',
      },
      {
        h2: 'What we do',
        body: 'We bring you to the makers, and the makers to you: for an evening with friends, a birthday or hen party, a team event or a Christmas party, in a studio or right in your office. Every booking through Twiggli supports a real person in Berlin, not a corporation.',
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
    description: 'Twiggli ist für alle, die in Berlin Community suchen. Wir bringen Menschen mit den Maker*innen der Stadt zusammen: Töpferinnen, Kerzenmacher, Siebdruckerinnen, Floristinnen. Warum es Twiggli gibt, was wir machen und woher der Name kommt.',
    kicker: 'Über Twiggli',
    lead: 'Berlin ist voller Menschen, die etwas können.',
    intro: 'Töpferinnen, Kerzenmacher, Siebdruckerinnen, Bildhauer, Floristinnen: In Hinterhöfen und kleinen Studios in der ganzen Stadt entstehen jeden Tag wunderschöne Dinge. Und gleichzeitig sitzen so viele von uns abends vor einem Bildschirm und fragen sich, wo man in dieser großen Stadt eigentlich Anschluss findet. Twiggli ist für alle, die Community suchen.',
    sections: [
      {
        h2: 'Von dem leben, was man liebt',
        body: 'Ich habe Twiggli gegründet, weil ich gesehen habe, wie viel Talent hier im Verborgenen arbeitet. Viele Maker*innen stecken ihr ganzes Herz in ihr Handwerk und möchten es weitergeben, aber hohe Mieten und der Lärm der großen Plattformen machen es ihnen schwer. Ich wünsche mir eine Stadt, in der man davon leben kann, das zu teilen, was man liebt. Twiggli soll ihnen dafür eine Bühne geben.',
      },
      {
        h2: 'Mit den Händen, ohne Bildschirm dazwischen',
        body: 'KI nimmt uns immer mehr Bildschirmarbeit ab, und das schenkt uns wieder Zeit: Zeit füreinander, Zeit, das Handwerk und die Leidenschaft eines anderen Menschen kennenzulernen und zu etwas Eigenem zu machen. Ich glaube, genau deshalb wird das Echte wertvoller: zusammen an einem Tisch sitzen, Ton unter den Fingern spüren, von jemandem lernen, der sein Handwerk liebt. Nicht über einen Bildschirm, sondern von Mensch zu Mensch. Und die Berufe, die keinen Bildschirm brauchen, sind die sichersten. Lasst uns gemeinsam das Handwerk vor Ort in Berlin wachsen lassen.',
      },
      {
        h2: 'Was wir machen',
        body: 'Wir bringen euch zu den Maker*innen, und die Maker*innen zu euch: als Abend unter Freund*innen, zum Geburtstag oder JGA, als Teamevent oder Weihnachtsfeier, im Studio oder direkt bei euch im Büro. Jede Buchung über Twiggli unterstützt eine echte Person aus Berlin, keinen Konzern.',
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
