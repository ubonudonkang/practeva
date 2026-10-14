# 001: Accordions open and close smoothly in every browser

- Status: DONE
- Written at commit: 6a513b4
- Severity: HIGH (category: easing and duration, browser coverage)
- Files: `src/scripts/accordion.ts` (new), `src/components/Pillars.astro`, `src/components/Faq.astro`, `CLAUDE.md`

## Problem

The "What we do" bands (`src/components/Pillars.astro`) and the FAQ (`src/components/Faq.astro`) animate height only through `::details-content` plus `interpolate-size: allow-keywords` (set on `:root` in `src/styles/global.css` line 61). Only Chromium supports both. In Safari (every iPhone) and Firefox the bands and answers snap open and shut, and the band below jumps.

Measured in Chromium 141 at 390px: the Training band grows 84px to 422px over about 300ms. Elsewhere it is instant.

Current CSS in `Pillars.astro` (the FAQ has the same shape on `details::details-content`):

```css
.band::details-content {
  block-size: 0;
  opacity: 0;
  overflow: clip;
  transition:
    block-size var(--duration-panel) var(--ease-out),
    opacity var(--duration-ui) var(--ease-out),
    content-visibility var(--duration-panel) allow-discrete;
}
.band[open]::details-content {
  block-size: auto;
  opacity: 1;
}
```

## Target

A small shared script animates the `<details>` element's own height with the Web Animations API, which works in every current browser. Keep the `<details>` markup and the CSS-only path as the no-JS fallback.

Values (from the repo's tokens in `src/styles/global.css`, read at runtime so there is one source of truth):
- Height: `--duration-panel` (280ms) with `--ease-in-out` (`cubic-bezier(0.77, 0, 0.175, 1)`). An accordion growing is an element already on screen changing size, so ease-in-out, not ease-out. The icon's 200ms ease-out rotation already gives instant feedback.
- Content fade: opening 200ms (`--duration-ui`) with `--ease-out`, opacity 0 to 1; closing 160ms (`--duration-press`) with `--ease-out`, opacity 1 to 0.
- Reduced motion: no height animation; opening keeps the 200ms opacity fade, closing is instant.
- Interruptible: a click during an animation starts the new one from the current height.
- Exclusive: opening one item closes the open sibling with the same animation, at the same time.

## Steps

1. Create `src/scripts/accordion.ts` with exactly this content:

```ts
// Smooth open and close for a group of <details>, in every browser. The browser's own
// ::details-content transition only runs in Chromium; this animates the <details> height
// with the Web Animations API instead. Without JS the native <details> still works.

const token = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const ms = (name: string, fallback: number) => parseFloat(token(name)) || fallback;

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
```

2. In `src/components/Pillars.astro`:
   - Give the wrapper a hook: change `<div class="bands">` to `<div class="bands" data-accordion>`.
   - Add after the markup, before `<style>`:

```astro
<script>
  import { smoothAccordion } from '../scripts/accordion';
  document.querySelectorAll<HTMLElement>('.bands[data-accordion]').forEach(smoothAccordion);
</script>
```

   - In the `<style>` block, directly after the `.band[open]::details-content { … }` rule, add:

```css
  /* With the script running it animates the height itself; switch the CSS-only path off so
     the two don't fight */
  .bands[data-smooth] .band::details-content {
    block-size: auto;
    opacity: 1;
    transition: none;
  }
```

3. In `src/components/Faq.astro`:
   - Change `<div class="faq-list">` to `<div class="faq-list" data-accordion>`.
   - Add after the markup, before `<style>`:

```astro
<script>
  import { smoothAccordion } from '../scripts/accordion';
  document.querySelectorAll<HTMLElement>('.faq-list[data-accordion]').forEach(smoothAccordion);
</script>
```

   - In the `<style>` block, directly after the `details[open]::details-content { … }` rule, add:

```css
  /* With the script running it animates the height itself; switch the CSS-only path off */
  .faq-list[data-smooth] details::details-content {
    block-size: auto;
    opacity: 1;
    transition: none;
  }
```

4. In `CLAUDE.md`, section "Motion (keep it rare and quick)", replace the bullet

   `- Animate \`transform\` and \`opacity\` only. The one exception is accordion height, done through \`details::details-content\` with \`interpolate-size: allow-keywords\`.`

   with

   `- Animate \`transform\` and \`opacity\` only. The one exception is accordion height: \`src/scripts/accordion.ts\` animates the \`<details>\` height with the Web Animations API (280ms, \`--ease-in-out\`) in every browser, and the \`details::details-content\` CSS with \`interpolate-size\` stays as the no-JS fallback. Wrap a new accordion in an element with \`data-accordion\` and call \`smoothAccordion\` on it.`

## Scope boundaries

- Do not change the markup inside each `<details>`, the colours, spacing, or the icon rotation.
- Do not touch the `name` attributes in markup; the script removes them at runtime.
- Do not add a dependency.

## Verification

1. `npm run build` passes with no warnings.
2. In Chromium at 390px on `/`, click the Training band and sample `getBoundingClientRect().height` every frame: it rises from 84px to about 422px over about 280ms, and the Advisory band shrinks over the same time. Repeat on the FAQ at `/` and `/training`.
3. Click a band twice quickly (within 100ms): the second click reverses from the current height with no jump.
4. Emulate `prefers-reduced-motion: reduce`: the height changes instantly; opening still fades in.
5. Disable JavaScript: bands and FAQ still open and close (instantly outside Chromium), and only one stays open at a time.
6. Feel check: record the screen in slow motion (or Chrome DevTools > Animations at 10%). The content should never be visibly clipped mid-text on open, and the band below should glide, not jump.
