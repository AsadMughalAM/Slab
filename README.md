# SLAB® — Neo-brutalist studio landing page

An experimental landing page for a fictional independent design & code studio. Next.js 15, TypeScript, Tailwind v4, GSAP ScrollTrigger, React Three Fiber.

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build (deploys to Vercel as-is)
```

**Make it yours:** all copy, links, email, city and projects live in [`lib/content.ts`](lib/content.ts). The email and social links are placeholders.

## Ideas the page is built on

- **Typography as architecture.** Archivo's width axis (62–125) does structural work: lines are condensed or expanded to fit their columns, and hero lines are measured and fitted to exact widths (`lib/useFitText.ts`).
- **The cursor erodes the type.** `ProximityText` thins and narrows letters near the pointer (weight and width axes), then lets them recover. It reads all letter positions before writing any styles, so each frame costs one layout.
- **One shadow language.** Every touchable object is a `.slab`: a 2px ink border with a hard offset shadow. Hover lifts it toward you and grows the shadow; pressing pushes it flat into the page. The 3D sculpture casts the same flat, screen-space offset shadow.
- **3D sculpture as print.** An orthographic, axonometric architectural model in toon shading with ink outlines (`components/Sculpture.tsx`). The cursor turns it, scrolling pulls it apart, and hovering a piece tints it and shows its spec.
- **Scroll storytelling (GSAP).** Masked line reveals, ATTENTION filling from outline to solid, a lime highlight wiping behind TAKES, a pinned horizontal work track with posters unmasked as they arrive, and lines that shear apart in the closing statement. Marquee strips speed up with scroll velocity.

## Sections

| # | Section | Component |
| --- | --- | --- |
| 00 | Hero: BREAK / THE / ORDINARY. + sculpture | `Hero.tsx`, `Sculpture.tsx` |
| 01 | Manifesto | `Manifesto.tsx` |
| 02 | Studio bento: statement, counter, services, pixel field, type specimen, availability, modules, recognition | `Bento.tsx` |
| 03 | Selected work: pinned track, generative posters with cursor lens | `Showcase.tsx`, `Poster.tsx` |
| 04 | Belief: MAKE SOMETHING THAT MATTERS. + crossing marquees | `Statement.tsx` |
| 05 | Contact (lime) with magnetic CTA and copy-email | `FinalCta.tsx` |
| — | Footer with live local time and giant wordmark | `Footer.tsx` |

Also: `Nav.tsx` (hide on scroll down, scroll progress, mobile menu), `Cursor.tsx` (difference-mode cursor with contextual labels), `Magnetic.tsx`.

## Accessibility & performance

- Respects `prefers-reduced-motion`: scroll scrubs, pins, marquees and the cursor effects switch off, and content shows in its final state.
- Semantic landmarks, real headings, a skip link, visible focus rings, an Escape-closable mobile menu, and `aria-label`s on split-letter text.
- The 3D canvas loads lazily, renders only while the hero is on screen, and caps DPR on small devices. Cursor and type effects only run on fine pointers.
