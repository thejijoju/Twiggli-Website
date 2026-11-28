/** /catalog.json — every live workshop on Twiggli as data, for the public
 *  Twiggli connector (functions twiggliMcp) and any assistant that reads
 *  JSON: one entry per class with its host, place, price, length and next
 *  dates, plus classes that run on request. Built with the site, so it is
 *  rebuilt every morning (deploy.yml), like llms-full.txt. No contact
 *  details: booking always goes through the Twiggli page. */
import { getHosts } from '../data/content.ts';
import { berlinTodayMs, type Session } from '../data/sessions.ts';
import { absolute, allWorkshops, onRequestFor, workshopHref, hostHref } from '../data/seo.ts';
import { isVoucherHost } from '../data/vouchers.ts';

const iso = (s: Session) => new Date(berlinTodayMs() + s.dayOffset * 86400000).toISOString().slice(0, 10);

export function GET() {
  const en = allWorkshops('en');
  const dated = en.map((w) => {
    const first = w.sessions[0];
    return {
      id: `${w.host.slug}/${w.key}`,
      title: w.title,
      host: w.host.name,
      studio: w.host.studio ?? '',
      specialty: w.host.specialty,
      category: w.host.activity,
      district: first?.district ?? '',
      price: first?.price ?? '',
      duration: first?.duration ?? w.host.duration ?? '',
      languages: first?.languages ?? w.host.languages ?? '',
      groups: w.host.group ?? '',
      about: w.host.blurb ?? '',
      voucher: isVoucherHost(w.host.slug),
      url: absolute(workshopHref('en', w.host, w.key)),
      url_de: absolute(workshopHref('de', w.host, w.key)),
      dates: w.sessions.slice(0, 30).map((s) => ({
        date: iso(s), time: s.time ?? '', ...(s.spots !== undefined ? { spots: s.spots } : {}), ...(s.price ? { price: s.price } : {}),
        ...(s.soldOut ? { soldOut: true } : {}),
      })),
    };
  });
  const seen = new Set(dated.map((d) => d.id));
  const onRequest = getHosts('en').flatMap((h) => onRequestFor(h.slug, 'en').map((o) => ({
    id: `${h.slug}/${o.key ?? o.id}`,
    title: o.title,
    host: h.name,
    studio: h.studio ?? '',
    specialty: h.specialty,
    category: h.activity,
    district: o.district ?? '',
    price: o.price ?? '',
    duration: o.duration ?? h.duration ?? '',
    languages: h.languages ?? '',
    groups: h.group ?? '',
    about: h.blurb ?? '',
    voucher: isVoucherHost(h.slug),
    url: o.key ? absolute(workshopHref('en', h, o.key)) : absolute(hostHref('en', h)),
    url_de: o.key ? absolute(workshopHref('de', h, o.key)) : absolute(hostHref('de', h)),
    dates: [],
    onRequest: true,
  }))).filter((o) => !seen.has(o.id));
  const body = {
    updated: new Date(berlinTodayMs()).toISOString().slice(0, 10),
    about: 'Twiggli: hands-on creative workshops with independent makers in Berlin. Booking and gift vouchers through twiggli.com.',
    voucherUrl: absolute('/voucher/'),
    groupsUrl: absolute('/corporatebookings/'),
    workshops: [...dated, ...onRequest],
  };
  return new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}
