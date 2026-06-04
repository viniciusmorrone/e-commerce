# Frontend App

Next.js 14 storefront frontend with TypeScript, TailwindCSS, and API consumption via Axios.

## Details

- Date: 2026-06-04
- Primary path: `frontend/`
- Reference docs: `README.md:22-27`, `frontend/README.md:1-100`, `frontend/package.json:1-33`
- Declared runtime: Next.js 14 App Router with React 18.
- Runtime patch level: `frontend/package.json` now pins `next` to `14.2.35` as the low-risk security/stability upgrade from `14.1.0` while keeping React 18.
- Declared product pages: `/`, `/produtos`, `/produtos/[slug]`.
- Declared API integration: product list/detail/WhatsApp/category endpoints.
- Admin panel implementation: `frontend/src/app/admin/page.tsx` now provides authenticated product create/edit/inactivate flows using `frontend/src/lib/api.ts` admin helpers.
- Admin cleanup: `frontend/src/app/admin/page.tsx` now removes a stale drawer-based duplicate admin flow that referenced undefined state/helpers, leaving the inline CRUD dashboard as the validated implementation.
- Product image contract: `frontend/src/lib/api.ts` now carries `imagem_principal` and `imagens_secundarias` in admin product payloads/list items, and `frontend/src/app/admin/page.tsx` exposes one cover-image input plus three secondary-image URL inputs.
- Storefront image behavior: list/navigation surfaces keep rendering `imagem_principal`, while `frontend/src/app/produtos/[slug]/page.tsx` selects the principal image (or first ordered fallback) as the initial gallery image.
- Admin UX uses a branded dark dashboard layout with summary stat cards, grouped form sections, and interactive product cards for faster operator workflows.

## Backlinks

- [Overview](../overview.md)
- [Environment & Local Infra](./environment-and-infra.md)
- [Admin Panel](./admin-panel.md)
