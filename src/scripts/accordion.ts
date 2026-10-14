// Smooth open and close for a group of <details>, in every browser. The browser's own
// ::details-content transition only runs in Chromium; this animates the <details> height
// with the Web Animations API instead. Without JS the native <details> still works.

const token = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
// Token durations in ms. The build's CSS minifier writes them in seconds (280ms becomes .28s).
const ms = (name: string, fallback: number) => {
  const value = token(name);
  return parseFloat(value) * (/\ds$/.test(value) ? 1000 : 1) || fallback;
};

export function smoothAccordion(root: HTMLElement) {
  const items = [...root.querySelectorAll<HTMLDetailsElement>(':scope details')];
  if (!items.length || !('animate' in HTMLElement.prototype)) return;

  // The shared name makes the browser close siblings instantly; take over that job so the
  // closing item can animate too.
  const exclusive = items.some((d) => d.hasAttribute('name'));
  items.forEach((d) => d.removeAttribute('name'));
  root.dataset.smooth = '';

  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const running = new WeakMap<HTMLDetailsElement, Animation[]>();
  const closing = new WeakSet<HTMLDetailsElement>();

  const parts = (d: HTMLDetailsElement) => {
    const summary = d.querySelector<HTMLElement>(':scope > summary')!;
    const body = summary.nextElementSibling as HTMLElement;
    return { summary, body };
  };

  // Height of the item with only its summary showing: summary plus the item's own borders and padding
  const closedHeight = (d: HTMLDetailsElement) => {
    const cs = getComputedStyle(d);
    const chrome =
      parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth) + parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    return parts(d).summary.getBoundingClientRect().height + chrome;
  };

  const settle = (d: HTMLDetailsElement) => {
    running.get(d)?.forEach((a) => a.cancel());
    running.delete(d);
    d.style.overflow = '';
  };

  const toggle = (d: HTMLDetailsElement, open: boolean) => {
    const { body } = parts(d);
    const from = d.getBoundingClientRect().height;
    // Mid-animation, carry on from the content's current opacity instead of flashing
    const fadeFrom = running.has(d) ? parseFloat(getComputedStyle(body).opacity) : open ? 0 : 1;
    settle(d);

    if (open) {
      closing.delete(d);
      d.open = true;
    } else {
      closing.add(d);
    }

    const easeOut = token('--ease-out');
    if (reduce.matches) {
      if (open) body.animate({ opacity: [fadeFrom, 1] }, { duration: ms('--duration-ui', 200), easing: easeOut });
      else {
        closing.delete(d);
        d.open = false;
      }
      return;
    }

    const to = open ? closedHeight(d) + body.getBoundingClientRect().height : closedHeight(d);
    d.style.overflow = 'clip';
    const height = d.animate(
      { height: [`${from}px`, `${to}px`] },
      { duration: ms('--duration-panel', 280), easing: token('--ease-in-out') },
    );
    const fade = open
      ? body.animate({ opacity: [fadeFrom, 1] }, { duration: ms('--duration-ui', 200), easing: easeOut })
      : body.animate({ opacity: [fadeFrom, 0] }, { duration: ms('--duration-press', 160), easing: easeOut, fill: 'forwards' });
    running.set(d, [height, fade]);

    height.onfinish = () => {
      if (!open) {
        closing.delete(d);
        d.open = false;
      }
      settle(d);
    };
  };

  for (const d of items) {
    parts(d).summary.addEventListener('click', (e) => {
      e.preventDefault();
      const opening = !d.open || closing.has(d);
      if (opening && exclusive) {
        items.filter((o) => o !== d && o.open && !closing.has(o)).forEach((o) => toggle(o, false));
      }
      toggle(d, opening);
    });
  }
}
