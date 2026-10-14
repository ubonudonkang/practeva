# 003: No grey tap flash, and no sticky hover on phones

- Status: TODO
- Written at commit: 6a513b4
- Severity: LOW (category: accessibility and touch polish)
- Files: `src/styles/global.css`, `src/components/OfferCards.astro`, `src/components/Footer.astro`

## Problem

1. No element sets `-webkit-tap-highlight-color`, so on Android Chrome and iOS Safari every tap on a "What we do" band, FAQ question, button or the Menu toggle flashes a translucent grey or blue rectangle over it. On the full-width coloured bands it lands on top of the open animation. These controls already give their own feedback (the icon rotates, buttons scale to 0.97 on press).
2. Two hover styles sit outside `@media (hover: hover) and (pointer: fine)`, which CLAUDE.md requires, so a tap leaves them stuck on phones:
   - `src/components/OfferCards.astro`: `.offer-link:hover { text-decoration-thickness: 2.5px; }`
   - `src/components/Footer.astro`: `.footer-cols a:hover { text-decoration: underline; text-underline-offset: 4px; }`

## Steps

1. In `src/styles/global.css`, directly after the `.btn:active, .press:active { … }` rule, add:

```css
/* Controls with their own press or open feedback don't need the browser's tap flash on phones */
.btn,
.press,
summary {
  -webkit-tap-highlight-color: transparent;
}
```

2. In `src/components/OfferCards.astro`, replace

```css
  .offer-link:hover {
    text-decoration-thickness: 2.5px;
  }
```

   with

```css
  @media (hover: hover) and (pointer: fine) {
    .offer-link:hover {
      text-decoration-thickness: 2.5px;
    }
  }
```

3. In `src/components/Footer.astro`, replace

```css
  .footer-cols a:hover {
    text-decoration: underline;
    text-underline-offset: 4px;
  }
```

   with

```css
  @media (hover: hover) and (pointer: fine) {
    .footer-cols a:hover {
      text-decoration: underline;
      text-underline-offset: 4px;
    }
  }
```

## Scope boundaries

- Do not remove the tap highlight from plain text links (they have no other press feedback).
- Do not change focus styles.

## Verification

1. `npm run build` passes with no warnings.
2. On a phone, tap a band, an FAQ question, the Menu button and a pill: no grey or blue rectangle flashes.
3. On a phone, tap a footer link and go back: it is not left underlined.
4. On a desktop with a mouse, hovering a footer link still underlines it, and hovering "Ask about this" still thickens its underline.
