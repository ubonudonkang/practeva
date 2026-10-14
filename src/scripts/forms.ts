// Shared behaviour for the site's forms: plain validation messages, a pending state and a
// polite status line. Each form says where it posts in data-endpoint (from src/data/site.ts).
//
// Form attributes:
//   data-endpoint   where to POST the FormData; any 2xx counts as success
//   data-email      the address to fall back to
//   data-success    what to say once it has gone
//   data-pending    the button label while sending
//   data-offline    what to say while the endpoint is empty
//   data-mailto     when present and the endpoint is empty, open the visitor's email app
//                   with the message filled in instead
// Field attributes:
//   data-error      what to say when a required field is empty or invalid

type Tone = 'ok' | 'error';

function valueOf(form: HTMLFormElement, name: string): string {
  const field = form.elements.namedItem(name);
  if (field instanceof HTMLSelectElement) {
    return field.value ? field.selectedOptions[0]?.textContent?.trim() ?? '' : '';
  }
  return field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement ? field.value.trim() : '';
}

function mailtoFor(form: HTMLFormElement): string {
  const topic = valueOf(form, 'topic');
  const phone = valueOf(form, 'phone');
  const organisation = valueOf(form, 'organisation');
  const lines = [`Name: ${valueOf(form, 'name')}`, `Email: ${valueOf(form, 'email')}`];
  if (phone) lines.push(`Phone: ${phone}`);
  if (organisation) lines.push(`Organisation: ${organisation}`);
  lines.push('', valueOf(form, 'message'));
  const subject = topic ? `Website enquiry: ${topic}` : 'Website enquiry';
  return `mailto:${form.dataset.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
}

export function wireForm(form: HTMLFormElement | null) {
  if (!form) return;
  const status = form.querySelector<HTMLElement>('.form-status')!;
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
  const label = button.querySelector<HTMLElement>('.btn-label')!;
  const idleLabel = label.textContent ?? '';

  // Clearing first means a repeated message still animates in and is announced again
  const say = (text: string, tone: Tone) => {
    status.textContent = '';
    status.dataset.tone = tone;
    requestAnimationFrame(() => {
      status.textContent = text;
    });
  };

  const setPending = (pending: boolean) => {
    button.disabled = pending;
    form.setAttribute('aria-busy', String(pending));
    label.textContent = pending ? form.dataset.pending ?? 'Sending…' : idleLabel;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

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
      if (form.dataset.mailto !== undefined) {
        window.location.href = mailtoFor(form);
        say(`Your email app should open with your message ready to send. If it doesn't, email ${form.dataset.email}.`, 'ok');
      } else {
        say(form.dataset.offline ?? `This form is not connected yet. Email ${form.dataset.email}.`, 'error');
      }
      return;
    }

    setPending(true);
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form),
      });
      if (!res.ok) throw new Error(String(res.status));
      form.reset();
      say(form.dataset.success ?? 'Thanks, it has gone through.', 'ok');
    } catch {
      say(`That didn't go through just now. Try again, or email ${form.dataset.email}.`, 'error');
    } finally {
      setPending(false);
    }
  });
}
