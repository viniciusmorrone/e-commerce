# Admin Panel

The `/admin` area now supports authenticated product create, edit, list, and inactivate flows end to end.

## Details

- Date: 2026-06-03
- Frontend entry point: `frontend/src/app/admin/page.tsx`
- Frontend API helpers: `frontend/src/lib/api.ts`
- Backend listing route: `backend/app/api/routes/admin_produtos.py`
- Backend mutations: `backend/app/api/routes/produtos.py`
- Shared list schema: `backend/app/schemas/produto.py`
- Auth dependency: `backend/app/api/deps.py`
- Current scope: login-gated admin panel that loads categories, lists all products (including inactive), creates products, updates products, and soft-deletes them by toggling `ativo=False`.
- Edit-mode safeguard: admin list responses now include persisted `descricao` and `categoria_id`, and the frontend preloads them before submitting updates so price-only edits do not overwrite saved values.
- Product image scope: `frontend/src/app/admin/page.tsx` now supports one `imagem_principal` URL plus up to three `imagens_secundarias` URLs during create/edit, and edit mode prefills those values from `GET /api/v1/admin/produtos`.
- UX redesign status: `frontend/src/app/admin/page.tsx` now presents a dashboard-style admin view with summary stat cards, a more structured product form, improved feedback states, and more scannable product cards/actions while keeping the same CRUD contract.
- Verification evidence recorded in-session:
  - `npm run build` passed in `frontend/`
  - `python3 -m compileall app` passed in `backend/`
  - API QA exercised login + create + update + delete against `http://127.0.0.1:8000/api/v1`
  - Browser QA exercised `/login` → `/admin` create/edit/inactivate flow on `http://localhost:3000`
  - Focused preservation QA confirmed editing only the price kept the existing description and category intact.
  - Post-redesign browser QA confirmed the new dashboard UI still supports login, create, edit, and inactivate flows successfully.

## Backlinks

- [Frontend App](./frontend-app.md)
- [Backend API](./backend-api.md)
- [Overview](../overview.md)
