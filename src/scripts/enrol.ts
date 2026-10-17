// Enrolment on /training: save the application, then open Squad checkout.
//
// The application goes to the Apps Script first (action "signup", the same script and sheet the
// waitlist and contact forms use) so that a payment can be matched to it. Then Squad's inline
// checkout opens on this page with a reference built from it (BAB-...-1, -2 and so on, because
// Squad needs a fresh reference for every attempt). Nothing in the browser proves a payment: Squad
// tells the script itself (its webhook), the script checks every payment with Squad, and only then
// does the row count as paid. What this file reports to the script ("payment") only makes that
// check quicker. A visitor who comes back through Squad's redirect, or refreshes the page, sees
// their reference again from sessionStorage.
//
// The public key is meant to sit in page code. The secret key never comes near this site.
import { send } from './forms';

type Pending = { reference: string; name: string; email: string; whatsapp: string; attempt: number; cohort: string };
type Squad = { setup(): void; open(): void };
declare global {
  interface Window {
    squad?: new (options: Record<string, unknown>) => Squad;
  }
}

const WIDGET = 'https://checkout.squadco.com/widget/squad.min.js';
const SQUAD_REF = /^(BAB-[A-Z0-9]+-[A-Z0-9]{3})-\d{1,3}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const KEYS = { pending: 'practeva-enrol-pending', returned: 'practeva-enrol-returned' };

const read = (key: string, cohort: string): Pending | null => {
  try {
    const v = JSON.parse(sessionStorage.getItem(key) || 'null');
    const ok = v && typeof v.reference === 'string' && /^BAB-/.test(v.reference) && v.cohort === cohort &&
      typeof v.name === 'string' && v.name && typeof v.email === 'string' && EMAIL.test(v.email);
    return ok ? (v as Pending) : null;
  } catch {
    return null;
  }
};
const write = (key: string, value: Pending) => {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be blocked; checkout still works, the visitor just cannot be reminded of the reference
  }
};

let loading: Promise<void> | null = null;
function loadSquad(): Promise<void> {
  if (window.squad) return Promise.resolve();
  loading ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = WIDGET;
    script.async = true;
    script.onload = () => (window.squad ? resolve() : reject(new Error('Secure checkout did not load.')));
    script.onerror = () => {
      loading = null;
      reject(new Error('Secure checkout did not load.'));
    };
    document.head.appendChild(script);
  });
  return loading;
}

const makeReference = () =>
  'BAB-' + Date.now().toString(36).toUpperCase() + '-' +
  Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3).padEnd(3, 'X');

export function wireEnrol(form: HTMLFormElement | null) {
  if (!form) return;
  const { endpoint = '', amount = '0', cohort = '', key = '', email: supportEmail = '' } = form.dataset;
  const status = form.querySelector<HTMLElement>('.form-status')!;
  const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
  const submitLabel = submit.querySelector<HTMLElement>('.btn-label')!;
  const retry = form.querySelector<HTMLButtonElement>('#pay-retry')!;
  const done = document.getElementById('enrol-done')!;
  const doneRef = document.getElementById('done-ref')!;

  const say = (text: string, tone: 'ok' | 'error' | '' = '') => {
    status.textContent = '';
    if (tone) status.dataset.tone = tone;
    else delete status.dataset.tone;
    if (text) requestAnimationFrame(() => (status.textContent = text));
  };

  /* "Other" boxes appear only when needed */
  const toggleOther = (target: HTMLInputElement | null, wrap: HTMLElement | null, active: boolean) => {
    if (!target || !wrap) return;
    wrap.hidden = !active;
    target.required = active;
    if (!active) target.value = '';
  };
  form.querySelectorAll<HTMLSelectElement>('select[data-other]').forEach((select) => {
    const input = form.querySelector<HTMLInputElement>(`#${select.dataset.other}`);
    const wrap = form.querySelector<HTMLElement>(`#${select.dataset.other}-wrap`);
    select.addEventListener('change', () => toggleOther(input, wrap, select.value === 'Other'));
  });

  /* Choose 1 to 3: the boxes that would make a fourth are switched off */
  const group = form.querySelector<HTMLElement>('[data-max]');
  if (group) {
    const max = Number(group.dataset.max);
    const boxes = [...group.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')];
    const otherBox = boxes.find((b) => b.dataset.other);
    group.addEventListener('change', () => {
      const n = boxes.filter((b) => b.checked).length;
      boxes.forEach((b) => (b.disabled = !b.checked && n >= max));
      if (otherBox) {
        const input = form.querySelector<HTMLInputElement>(`#${otherBox.dataset.other}`);
        toggleOther(input, form.querySelector<HTMLElement>(`#${otherBox.dataset.other}-wrap`), otherBox.checked);
      }
    });
  }

  const showDone = (customer: Pending) => {
    doneRef.textContent = customer.reference;
    form.hidden = true;
    done.hidden = false;
    done.focus({ preventScroll: true });
    done.scrollIntoView({ block: 'center' });
  };

  // Squad also tells the script itself; this only makes its check quicker
  const report = (squadRef: string) => send(endpoint, { action: 'payment', squad_ref: squadRef }).catch(() => {});
  const belongsTo = (pending: Pending, squadRef: string) => !squadRef || squadRef.startsWith(pending.reference + '-');

  function pay(pending: Pending) {
    const next: Pending = { ...pending, attempt: (pending.attempt || 0) + 1 };
    write(KEYS.pending, next);
    const ref = `${next.reference}-${next.attempt}`;
    retry.hidden = true;
    say('Opening secure checkout...', 'ok');

    loadSquad()
      .then(() => {
        let paid = false;
        const checkout = new window.squad!({
          key,
          email: next.email,
          amount: Math.round(Number(amount) * 100), // Squad wants kobo
          currency_code: 'NGN',
          transaction_ref: ref,
          customer_name: next.name,
          metadata: { product: 'BA Bridge Cohort', reference: next.reference, cohort, whatsapp: next.whatsapp, site: 'practevahq.com' },
          pass_charge: false,
          onLoad: () => say(''),
          onSuccess: () => {
            paid = true;
            write(KEYS.returned, next);
            say('');
            showDone(next);
            report(ref);
          },
          onClose: () => {
            if (paid) return;
            say("Payment wasn't completed. Your details are saved, so you can pay now.", 'error');
            retry.hidden = false;
            retry.focus();
          },
        });
        checkout.setup();
        checkout.open();
      })
      .catch((err: Error) => {
        say(`${err.message} Please try again shortly.`, 'error');
        retry.hidden = false;
      });
  }
  retry.addEventListener('click', () => {
    const pending = read(KEYS.pending, cohort);
    if (pending) pay(pending);
    else say('We could not restore your saved enrolment. Please fill in the form again.', 'error');
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    say('');

    const required = form.querySelectorAll<HTMLInputElement | HTMLSelectElement>('[required]');
    for (const field of required) {
      const empty = field instanceof HTMLInputElement && field.type === 'checkbox' ? !field.checked : !field.value.trim();
      if (empty || !field.validity.valid) {
        say(field.dataset.error ?? 'Fill in this field.', 'error');
        field.focus();
        return;
      }
    }
    const answers = new FormData(form);
    const wants = answers.getAll('wants').map(String);
    if (!wants.length) {
      say('Choose at least one thing you want from the cohort.', 'error');
      group?.querySelector<HTMLInputElement>('input')?.focus();
      return;
    }

    // Fold any "Other" text into its answer, so the sheet keeps one column per question
    const text = (name: string) => String(answers.get(name) ?? '').trim();
    const withOther = (value: string, extra: string) => (extra && /\bOther\b/.test(value) ? value.replace(/\bOther\b/, `Other: ${extra}`) : value);
    const reference = makeReference();
    const data = {
      action: 'signup',
      site: 'practevahq.com',
      reference,
      name: text('name'),
      email: text('email'),
      whatsapp: text('whatsapp'),
      location: text('location'),
      background: withOther(text('background'), text('background_other')),
      experience: text('experience'),
      stage: text('stage'),
      wants: withOther(wants.join(', '), text('wants_other')),
      availability: text('availability'),
      source: withOther(text('source'), text('source_other')),
      consent: 'Yes',
      _gotcha: text('_gotcha'),
    };

    submit.disabled = true;
    submitLabel.textContent = 'Saving...';
    try {
      await send(endpoint, data);
    } catch {
      submit.disabled = false;
      submitLabel.textContent = 'Continue to payment';
      say(`That didn't go through. Try again, or email ${supportEmail}.`, 'error');
      return;
    }
    const pending: Pending = { reference, name: data.name, email: data.email, whatsapp: data.whatsapp, attempt: 0, cohort };
    write(KEYS.pending, pending);
    submit.hidden = true;
    pay(pending);
  });

  /* Coming back: through Squad's redirect (?reference=BAB-...-N), or after a refresh */
  const back = new URLSearchParams(location.search).get('reference')?.trim() ?? '';
  const squadRef = SQUAD_REF.test(back) ? back : '';
  const pending = read(KEYS.pending, cohort);
  if (squadRef) {
    history.replaceState({}, '', location.pathname + location.hash);
    report(squadRef);
    if (pending && belongsTo(pending, squadRef)) {
      write(KEYS.returned, pending);
      showDone(pending);
    } else {
      say('If you have paid, Squad confirms it to us automatically. If you do not hear from us soon, email us with your payment receipt.', 'ok');
    }
    return;
  }
  const returned = read(KEYS.returned, cohort);
  if (returned) {
    showDone(returned);
  } else if (pending) {
    submit.hidden = true;
    say('Your enrolment is saved. Continue to secure payment when you are ready.', 'ok');
    retry.hidden = false;
  }
}
