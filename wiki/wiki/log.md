# Wiki Change Log

- 2026-06-03 — Initialized wiki structure and seeded project overview pages.
- 2026-06-03 — Documented the /admin recovery: admin product list endpoint, frontend CRUD client helpers, and verified create/edit/inactivate flow.
- 2026-06-03 — Extended admin list payload with `descricao` and `categoria_id` so edit mode preserves existing product data during updates.
- 2026-06-04 — Redesigned the `/admin` UI/UX with stat cards, stronger form hierarchy, richer product cards, and re-verified create/edit/inactivate flows in the browser.
- 2026-06-04 — Added backend support for `imagem_principal` + up to 3 `imagens_secundarias`, rewriting `Imagem` rows on product create/update and exposing image URL fields on admin/storefront product responses.
- 2026-06-04 — Extended the admin product form with one main-image URL field plus three secondary-image URL fields, and aligned storefront/detail rendering with the derived main-image contract.
