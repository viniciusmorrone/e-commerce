# Wiki Change Log

- 2026-06-03 — Initialized wiki structure and seeded project overview pages.
- 2026-06-03 — Documented the /admin recovery: admin product list endpoint, frontend CRUD client helpers, and verified create/edit/inactivate flow.
- 2026-06-03 — Extended admin list payload with `descricao` and `categoria_id` so edit mode preserves existing product data during updates.
- 2026-06-04 — Redesigned the `/admin` UI/UX with stat cards, stronger form hierarchy, richer product cards, and re-verified create/edit/inactivate flows in the browser.
- 2026-06-04 — Added backend support for `imagem_principal` + up to 3 `imagens_secundarias`, rewriting `Imagem` rows on product create/update and exposing image URL fields on admin/storefront product responses.
- 2026-06-04 — Extended the admin product form with one main-image URL field plus three secondary-image URL fields, and aligned storefront/detail rendering with the derived main-image contract.
- 2026-06-04 — Fixed the `/admin` Vercel build failure by removing a duplicate stale drawer-based admin flow from `frontend/src/app/admin/page.tsx`, relying on the shared `Categoria` API type, and upgrading `frontend` from Next.js `14.1.0` to `14.2.35`; verified with `npx tsc --noEmit -p tsconfig.json` and `npm run build`.
