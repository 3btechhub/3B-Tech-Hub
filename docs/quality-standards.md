# 3B TECH HUB — Quality Standards

These are mandatory acceptance criteria for all public pages, admin screens, APIs and future features.

## Product principles
- Clean, fast, dynamic, lightweight, secure, responsive, accessible, SEO-friendly, reliable, scalable and maintainable.
- Minimal monochrome black/white/neutral-gray visual language.
- Keep homepage content exactly as owner requested: the title “Three Brothers Technology Hub” only; preserve the site's header and footer.
- Login remains simple: email/password inputs with placeholders and a plain login button. No Google login or decorative authentication cards.
- Reuse the canonical design tokens and shared components in src/app/globals.css. Do not duplicate common styles or introduce inline styling without a genuine dynamic need.
- Keep existing navigation/header/footer behavior unless an approved requirement changes it.

## Performance
- Minimize client components and browser JavaScript; prefer Server Components.
- Avoid unnecessary dependencies, requests, polling, animations and hydration.
- Optimize images (responsive dimensions, modern formats, lazy-load below the fold); preload only critical assets.
- Use caching only for public, non-personalized data. Never cache auth/session/admin responses in a shared cache.
- Optimize SQL queries and add indexes only for demonstrated access patterns.
- Prevent layout shifts; reserve media dimensions and use stable loading states.

## Responsive and accessibility
- Mobile-first layouts for phone, tablet and desktop.
- Semantic HTML, keyboard navigation, visible focus, accessible names, contrast, reduced-motion support and usable touch targets.
- No horizontal overflow, clipped content or text truncation that hides important information.
- Test light/dark themes and narrow/wide viewports.

## Security
- Deny by default; validate and normalize every input server-side.
- RLS enabled on every exposed Supabase table and least-privilege policies.
- Never trust client roles or user-editable user_metadata for authorization.
- Never expose secret/service-role keys in NEXT_PUBLIC variables or browser bundles.
- Protect admin routes and every privileged server operation independently.
- Rate-limit login, recovery and public forms; validate upload size, MIME and file signatures.
- Use secure headers, safe redirects, audit logs and dependency auditing.

## SEO and reliability
- Unique metadata, canonical URLs, sitemap, robots rules and appropriate structured data.
- Admin/private pages must not be indexed.
- Helpful error states, timeouts, retry boundaries and structured server logs without secrets or personal data.
- Database migrations are versioned and reversible where practical; backup and restore procedures are documented.

## Measurable targets
- Lighthouse Performance: >= 90 on representative production pages.
- Accessibility, Best Practices and SEO: >= 95 where applicable.
- Core Web Vitals: LCP <= 2.5s, INP <= 200ms, CLS <= 0.1 at the 75th percentile when real-user data is available.
- These are acceptance targets, not claims of current measured performance.

## Required checks for each change
- npm run typecheck
- npm run lint
- npm run test
- npm run test:e2e when UI/flow changes
- npm run build
- Supabase security/performance advisors after schema or policy changes
- Browser verification across mobile/desktop and light/dark themes before claiming visual completion
