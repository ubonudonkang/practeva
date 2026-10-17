// Shared behaviour for the site's forms: plain validation messages, a pending state and a
// polite status line. Both forms post to the Apps Script web app in src/data/site.ts, the same
// one ubonudonkang.com uses (its scripts/site_forms.gs), which answers {"result":"ok"} once the
// row is saved.
//
// Form attributes:
//   data-endpoint   where to POST; empty means the form is not connected
//   data-email      the address to fall back to
//   data-success    what to say once it has gone
//   data-pending    the button label while sending
//   data-offline    what to say while the endpoint is empty
// Field attributes:
//   data-error      what to say when a required field is empty or invalid
// A form can reshape what it sends with a prepare function (the contact form does).

type Tone = 'ok' | 'error';
export type Params = Record<string, string>;

// As in ubonudonkang.com's js/forms.js: read the JSON answer when the browser allows it, so a
// rejected save is reported. Apps Script's redirect can lack CORS headers; the answer is then
// unreadable, so the request is sent again blind (no-cors). Every post carries a unique
// submission id, or an email and cohort, which the script dedupes on, so the resend cannot add
// a second row. A blind send is not proof of a save.
export async function send(endpoint: string, params: Params) {
  const body = new URLSearchParams(params);
  let answer: { result?: string } | null;
  try {
    answer = await (await fetch(endpoint, { method: 'POST', body })).json();
  } catch {
    await fetch(endpoint, { method: 'POST', mode: 'no-cors', body });
    return;
  }
  if (!answer || answer.result !== 'ok') throw new Error('rejected');
}

function collect(form: HTMLFormElement): Params {
  const out: Params = {};
  new FormData(form).forEach((value, key) => {
    if (typeof value === 'string') out[key] = value.trim();
  });
  return out;
}

export const uniqueId = () =>
  window.crypto?.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);

export function wireForm(form: HTMLFormElement | null, prepare?: (params: Params, form: HTMLFormElement) => Params) {
  if (!form) return;
  const status = form.querySelector<HTMLElement>('.form-status')!;
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
  const label = button.querySelector<HTMLElement>('.btn-label')!;
  const idleLabel = label.textContent ?? '';
  let sending = false;

  // Clearing first means a repeated message still animates in and is announced again
  const say = (text: string, tone: Tone) => {
    status.textContent = '';
    status.dataset.tone = tone;
    requestAnimationFrame(() => {
      status.textContent = text;
    });
  };

  const setPending = (pending: boolean) => {
    sending = pending;
    button.disabled = pending;
    form.setAttribute('aria-busy', String(pending));
    label.textContent = pending ? form.dataset.pending ?? 'Sending…' : idleLabel;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (sending) return;

    const required = form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('[required]');
    for (const field of required) {
      if (!field.value.trim() || !field.validity.valid) {
        say(field.dataset.error ?? 'Fill in this field.', 'error');
        field.focus();
        return;
      }
    }

    const endpoint = form.dataset.endpoint;
    if (!endpoint) {
      say(form.dataset.offline ?? `This form is not connected yet. Email ${form.dataset.email}.`, 'error');
      return;
    }

    const params = prepare ? prepare(collect(form), form) : collect(form);
    setPending(true);
    try {
      await send(endpoint, params);
      form.reset();
      say(form.dataset.success ?? 'Thanks, it has gone through.', 'ok');
    } catch {
      say(`That didn't go through just now. Try again, or email ${form.dataset.email}.`, 'error');
    } finally {
      setPending(false);
    }
  });
}
