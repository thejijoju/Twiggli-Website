/** The Twiggli Club waitlist form, shared by the club page (ClubPage.astro)
 *  and the pop-up that invites people to it (ClubPopup.astro). Same route as
 *  the other request forms: FormSubmit to our inbox as "Club waitlist", or
 *  the visitor's mail app with the same message when that is unreachable. */

/** What the pop-up remembers, in this browser only: when it was last shown
 *  (or closed), or that this visitor already joined. */
export const CLUB_POPUP_KEY = 'twiggli-club-popup';

export const markClubJoined = () => {
  try { localStorage.setItem(CLUB_POPUP_KEY, JSON.stringify({ s: 'joined', t: Date.now() })); } catch {}
};

interface FormCopy { sending: string; send: string; error: string; sentBody: string; sentBodyNamed: string }

/** Wires a waitlist form: `source` says where it was sent from ("club page",
 *  "popup"); `sent` is the thank-you block shown in its place. */
export function wireClubForm(form: HTMLFormElement, sent: HTMLElement | null, source: string, onSent?: () => void) {
  const copy = JSON.parse(form.dataset.copy || '{}') as FormCopy;
  const inbox = form.dataset.inbox ?? '';
  const send = form.querySelector<HTMLButtonElement>('[data-club-send]');
  const error = form.querySelector<HTMLElement>('[data-club-error]');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    if (data.get('_honey')) return;
    const get = (k: string) => String(data.get(k) ?? '').trim();
    let cameFrom = '';
    try { cameFrom = sessionStorage.getItem('twiggli-came-from') ?? ''; } catch {}
    const fields: Record<string, string> = {
      Type: 'Club waitlist',
      Source: source,
      Email: get('email'),
      'First name': get('firstName'),
      Language: document.documentElement.lang,
      'Sent from': location.href,
      'Came from': cameFrom,
    };
    const subject = `Club waitlist: ${fields.Email}${fields['First name'] ? ` (${fields['First name']})` : ''}`;
    if (error) error.hidden = true;
    if (send) { send.disabled = true; send.textContent = copy.sending; }
    try {
      const res = await fetch(`https://formsubmit.co/ajax/${inbox}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          ...Object.fromEntries(Object.entries(fields).filter(([k]) => k !== 'Email')),
          email: fields.Email, _subject: subject, _template: 'table', _captcha: 'false',
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      markClubJoined();
      form.hidden = true;
      if (sent) {
        const body = sent.querySelector<HTMLElement>('[data-club-sent-body]');
        if (body && fields['First name']) body.textContent = String(copy.sentBodyNamed).replace('{name}', fields['First name']);
        sent.hidden = false;
      }
      onSent?.();
    } catch {
      if (error) { error.textContent = String(copy.error).replace('{email}', form.dataset.contact ?? ''); error.hidden = false; }
      if (send) { send.disabled = false; send.textContent = copy.send; }
      const body = Object.entries(fields).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join('\n');
      location.href = `mailto:${form.dataset.contact}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
  });
}
