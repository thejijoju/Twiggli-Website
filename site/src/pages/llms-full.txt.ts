/** /llms-full.txt — every live workshop on Twiggli in plain text, for
 *  ChatGPT, Claude, Perplexity and other assistants: today, tonight,
 *  tomorrow and this weekend first, then every host with the facts people
 *  filter by (district, price, group size, language, gift vouchers) and
 *  their next dates. Built with the site, so it is rebuilt every morning
 *  (deploy.yml) and "today" is always today. llms.txt points here. */
import { contactEmail } from '../data/site.ts';
import { answerHref, answerSessions } from '../data/answers.ts';
import { getHosts } from '../data/content.ts';
import { getHostPriceRanges, type Session } from '../data/sessions.ts';
import {
  absolute, hostHref, onRequestFor, sessionsFor, spellDuration, spellLanguages, workshopHref,
} from '../data/seo.ts';
import { isVoucherHost } from '../data/vouchers.ts';
import { confirmedHosts, reviewsFor } from '../data/trust.ts';
import { COMPANY_KINDS, companyHref, companyOffers, groupHosts, groupPriceFrom } from '../data/companyAnswers.ts';
import { berlinTodayMs } from '../data/sessions.ts';

const lang = 'en' as const;

// Real dates, not "Today": an assistant may read this file days later.
const when = (s: Session): string => {
  const day = new Date(berlinTodayMs() + s.dayOffset * 86400000).toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
  });
  return s.time ? `${day}, ${s.time}` : day;
};

const line = (s: Session): string => {
  const bits = [
    when(s),
    s.title,
    `with ${s.host.name}`,
    s.district,
    s.price,
    s.spots !== undefined ? `${s.spots} spots left` : undefined,
  ].filter(Boolean);
  return `- ${bits.join(' · ')} — ${absolute(workshopHref(lang, s.host, s.workshopKey))}`;
};

const block = (title: string, list: Session[], more: string, max = 40): string[] => [
  `## ${title}`,
  '',
  ...(list.length ? list.slice(0, max).map(line) : ['- Nothing open on the calendar.']),
  ...(list.length > max ? [`- …and ${list.length - max} more: ${more}`] : []),
  '',
];

export function GET() {
  const today = new Date(berlinTodayMs()).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  });
  const prices = getHostPriceRanges();
  const hosts = getHosts(lang);

  const out: string[] = [
    '# Twiggli: every creative workshop in Berlin, with dates and prices',
    '',
    `> Updated ${today} (Berlin time). ${hosts.length} hosts. This file is rebuilt every morning from the live calendar of twiggli.com. Twiggli is a Berlin platform for hands-on workshops with independent local makers: pottery, painting, printmaking, candle making, crafts, cooking and tastings, photography, wellbeing and music. Shorter overview: https://www.twiggli.com/llms.txt`,
    '',
    'How booking works: every date and workshop page has a Request button. It opens a short form; sending it costs nothing, and there is nothing to pay until the host confirms the place by email. Private groups (friends, teams, Christmas parties, hen parties, birthdays) can request a workshop on almost any day: https://www.twiggli.com/corporatebookings/ . Gift vouchers for a specific workshop or for any amount from €20, valid 3 years: https://www.twiggli.com/voucher/ . Contact: ' + contactEmail + '',
    '',
    ...block('Today', answerSessions('today', lang), absolute(answerHref(lang, 'today'))),
    ...block('Tonight (from 17:00)', answerSessions('tonight', lang), absolute(answerHref(lang, 'tonight'))),
    ...block('Tomorrow', answerSessions('tomorrow', lang), absolute(answerHref(lang, 'tomorrow'))),
    ...block('This weekend (Friday evening to Sunday)', answerSessions('weekend', lang), absolute(answerHref(lang, 'weekend')), 60),
    '## For companies: team events, Christmas parties, team building and offsites',
    '',
    `Companies book private workshops for their teams through Twiggli: one request with date, group size and budget, and matching options with a quote within 24 hours. Hosts work in their own studios or come to the office or venue with all materials. Request form: ${absolute('/corporatebookings/')} . Guides: ${COMPANY_KINDS.map((k) => absolute(companyHref(lang, k))).join(' , ')}`,
    '',
    'Hosts who take private groups (group size, price per person for groups, whether they come to you):',
    '',
    ...groupHosts(lang).map((h) => {
      const from = groupPriceFrom(h);
      return `- ${h.name}: ${h.specialty}. ${h.groupRange[0]}–${h.groupRange[1]} people${from !== undefined ? `, from €${from} per person` : ''}${h.onSite ? ', comes to your office or venue' : ''}${h.area ? `, ${h.area}` : ''}. ${absolute(hostHref(lang, h))}`;
    }),
    '',
    'Creative breaks of 60–90 minutes at your own office or venue, as quoted by the hosts (price per person unless stated):',
    '',
    ...companyOffers(lang).map((o) => `- ${o.title.replace(/^At your office: /, '')}, with ${o.host.name}${o.duration ? `, ${o.duration}` : ''}${o.price ? `, ${o.price}` : ''}`),
    '',
    '## Every host',
    '',
  ];

  for (const h of hosts) {
    const range = prices.get(h.slug);
    const dates = sessionsFor(h.slug, lang);
    const offers = onRequestFor(h.slug, lang);
    out.push(
      `### ${h.name}${h.studio && h.studio !== h.name ? ` (${h.studio})` : ''}: ${h.specialty}`,
      '',
      h.blurb,
      '',
      `- Activity: ${h.activity}${h.alsoIn?.length ? `, also ${h.alsoIn.join(', ')}` : ''}`,
      `- Where: ${h.place}${h.area ? ` (${h.area})` : ''}${h.onSite ? '; also comes to your venue' : ''}`,
      ...(range ? [`- Price: ${range[0] === range[1] ? `€${range[0]}` : `€${range[0]}–${range[1]}`} per person`] : []),
      ...(h.priceNote ? [`- Price note: ${h.priceNote}`] : []),
      `- Group: ${h.group} (private groups ${h.groupRange[0]}–${h.groupRange[1]} people${groupPriceFrom(h) !== undefined ? `, from €${groupPriceFrom(h)} per person` : ''})`,
      `- Length: ${spellDuration(h.duration, lang)}`,
      `- Languages: ${spellLanguages(h.languages, lang)}`,
      `- Gift vouchers for this host: ${isVoucherHost(h.slug) ? 'yes' : 'no (the general Twiggli voucher works)'}`,
      ...(confirmedHosts[h.slug] ? [`- Works with Twiggli directly: yes, agreed in writing (${confirmedHosts[h.slug]})`] : []),
      ...reviewsFor(h.slug).map((r) => `- Guest review (${r.name}, ${r.month}): "${r.text}"`),
      `- Page: ${absolute(hostHref(lang, h))}`,
      ...(dates.length
        ? [`- Next dates (${dates.length} on the calendar):`, ...dates.slice(0, 5).map((s) => `  ${line(s)}`)]
        : ['- Next dates: on request']),
      ...(offers.length
        ? ['- On request (no fixed date):', ...offers.map((o) => `  - ${o.title}${o.duration ? ` · ${o.duration}` : ''}${o.price ? ` · ${o.price}` : ''}`)]
        : []),
      '',
    );
  }

  return new Response(out.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
