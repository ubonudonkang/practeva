# 002: The mobile menu drops from the bar instead of popping in

- Status: DONE
- Written at commit: 6a513b4
- Severity: HIGH (category: physicality and origin, browser coverage)
- Files: `src/components/Header.astro`, `CLAUDE.md`

## Problem

Measured in Chromium 141 at 390px: the 487px menu panel goes from opacity 0 to 0.96 in about 100ms with an 8px shift, and its size never changes. A panel that big appearing as a quick fade reads as a pop. It also depends on `@starting-style` and `transition: display … allow-discrete`, so older Safari shows and hides it instantly.

Current CSS (`src/components/Header.astro`):

```css
.mobile-menu {
  background: var(--surface);
  border-block: 1px solid var(--line);
  opacity: 1;
  transform: translateY(0);
  transition:
    opacity var(--duration-ui) var(--ease-out),
    transform var(--duration-ui) var(--ease-out),
    display var(--duration-ui) allow-discrete;
}
.mobile-menu[hidden] {
  display: none;
  opacity: 0;
  transform: translateY(calc(-8px * var(--motion)));
  transition-duration: 150ms;
}
@starting-style {
  .mobile-menu {
    opacity: 0;
    transform: translateY(calc(-8px * var(--motion)));
  }
}
```

Current script:

```ts
const setOpen = (open: boolean) => {
  toggle.setAttribute('aria-expanded', String(open));
  menu.hidden = !open;
};
```

## Target

- The panel is revealed downward from the bar with `clip-path`, so it visibly comes from the button that opened it: `inset(0 0 100% 0)` to `inset(0 0 0 0)`, 280ms (`--duration-panel`), `--ease-out` (`cubic-bezier(0.23, 1, 0.32, 1)`), with opacity 0 to 1 over 200ms (`--duration-ui`).
- The links follow in a short stagger: each item fades in and rises 8px (`calc(8px * var(--motion))`), opacity 200ms and transform 240ms, `--ease-out`, delay `index × 20ms`. The last of 7 items is settled by about 360ms.
- Closing is faster and has no stagger: everything goes out together in 200ms (`--duration-ui`), clip-path and opacity, `--ease-out`.
- JS sequences the states, so it works without `@starting-style`. `hidden` is set only after the close finishes, so screen readers and Tab skip the closed menu. Reopening mid-close reverses from where it is.
- Reduced motion: no clip and no movement; the panel and links just fade (opacity, 200ms).

## Steps

1. In the markup, give each item an index for the stagger. Replace the mobile menu block with:

```astro
  <div class="mobile-menu" id="mobile-menu" data-state="closed" hidden>
    <nav class="container" aria-label="Main, mobile">
      <ul>
        {nav.map((l, i) => (
          <li style={`--i: ${i}`}><a href={l.href} aria-current={isCurrent(l.href) ? 'page' : undefined}>{l.label}</a></li>
        ))}
        <li style={`--i: ${nav.length}`}><a href="/contact" aria-current={isCurrent('/contact') ? 'page' : undefined}>Contact</a></li>
      </ul>
      <a class="btn" style={`--i: ${nav.length + 1}`} href={cta.href}>{cta.label}<Arrow /></a>
    </nav>
  </div>
```

2. Replace the `<script>` block with:

```astro
<script>
  const toggle = document.querySelector<HTMLButtonElement>('.menu-toggle');
  const menu = document.getElementById('mobile-menu');
  if (toggle && menu) {
    let hideTimer = 0;
    const isOpen = () => menu.dataset.state === 'open';

    // Open: unhide, let the closed styles apply for one frame, then switch to open so the
    // transitions run. Close: switch to closed, and hide only once the close has finished.
    const setOpen = (open: boolean) => {
      toggle.setAttribute('aria-expanded', String(open));
      window.clearTimeout(hideTimer);
      if (open) {
        menu.hidden = false;
        menu.getBoundingClientRect();
        menu.dataset.state = 'open';
      } else {
        menu.dataset.state = 'closed';
        hideTimer = window.setTimeout(() => {
          if (!isOpen()) menu.hidden = true;
        }, 220);
      }
    };

    toggle.addEventListener('click', () => setOpen(!isOpen()));
    menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen()) {
        setOpen(false);
        toggle.focus();
      }
    });
  }
</script>
```

   (220ms is the 200ms close plus a frame of slack.)

3. In `<style>`, replace everything from the comment `/* The panel drops from the bar that opened it…` through the `@starting-style { .mobile-menu { … } }` block (keep the reduced-motion block for `.menu-icon` that follows) with:

```css
  /* The panel is revealed downward from the bar that opened it, and its links follow in a
     short stagger. Closing is quicker and all at once. The script sets data-state, so this
     works without @starting-style. */
  .mobile-menu {
    background: var(--surface);
    border-block: 1px solid var(--line);
    clip-path: inset(0 0 100% 0);
    opacity: 0;
    transition:
      clip-path var(--duration-ui) var(--ease-out),
      opacity var(--duration-ui) var(--ease-out);
  }

  .mobile-menu[data-state='open'] {
    clip-path: inset(0 0 0 0);
    opacity: 1;
    transition:
      clip-path var(--duration-panel) var(--ease-out),
      opacity var(--duration-ui) var(--ease-out);
  }

  .mobile-menu li,
  .mobile-menu .btn {
    opacity: 0;
    transform: translateY(calc(8px * var(--motion)));
    transition:
      opacity var(--duration-ui) var(--ease-out),
      transform var(--duration-ui) var(--ease-out);
  }

  .mobile-menu[data-state='open'] li,
  .mobile-menu[data-state='open'] .btn {
    opacity: 1;
    transform: translateY(0);
    transition:
      opacity var(--duration-ui) var(--ease-out),
      transform 240ms var(--ease-out);
    transition-delay: calc(var(--i, 0) * 20ms);
  }
```

4. Extend the existing reduced-motion block in `Header.astro` so it reads:

```css
  @media (prefers-reduced-motion: reduce) {
    .menu-icon,
    .menu-icon::before {
      transition: none;
    }

    /* Fades stay; the reveal and the rise go */
    .mobile-menu,
    .mobile-menu[data-state='open'] {
      clip-path: none;
      transition: opacity var(--duration-ui) var(--ease-out);
    }
  }
```

   (`transform` already multiplies by `--motion`, which is 0 under reduced motion.)

5. `.btn` in `src/styles/global.css` has its own `transition: transform var(--duration-press) …` for the press. Inside the menu, the rules above override it, which is fine for the menu button; check that pressing it still scales to 0.97. If the press feels slow (240ms), leave it: the menu is closing on tap anyway.

6. In `CLAUDE.md`, section "Motion (keep it rare and quick)", in the bullet "What moves today", replace `the mobile menu panel` with `the mobile menu (revealed down from the bar with clip-path, links staggered 20ms, quicker close)`.

## Scope boundaries

- Do not change the menu's colours, spacing, breakpoints, link list or the hamburger icon animation.
- Do not add scroll locking or a backdrop.
- Keep `aria-expanded`, `aria-controls`, Escape-to-close with focus back on the toggle, and close-on-link-click.

## Verification

1. `npm run build` passes with no warnings.
2. At 390px in Chromium, click Menu and sample the panel each frame: the visible part grows down from the bar (check `getComputedStyle(menu).clipPath` moves from `inset(0px 0px 100% 0px)` toward `inset(0px)`) over about 280ms; the last item settles by about 360ms.
3. Click Menu again: it closes in about 200ms and then has the `hidden` attribute (Tab skips it).
4. Click Menu twice within 100ms: the panel reverses from where it was, without flashing fully open or closed.
5. Escape closes it and focus returns to the Menu button.
6. Emulate `prefers-reduced-motion: reduce`: only fades, no clip or rise.
7. Feel check on a real phone: the panel should feel like it unrolls from the bar, and the links should arrive just behind it, not after a noticeable wait.
