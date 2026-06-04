# Backend API

FastAPI backend for admin authentication, catalog management, and supporting e-commerce services.

## Details

- Date: 2026-06-03
- Primary path: `backend/`
- Reference docs: `README.md:13-20`, `README.md:89-98`, `backend/README.md:1-61`
- Declared stack: FastAPI, SQLAlchemy, PostgreSQL, Redis, Alembic, JWT, Cloudinary.
- Declared admin login endpoint: `POST /api/v1/admin/auth/login` per `backend/README.md:52-57`.
- Admin product management now includes `GET /api/v1/admin/produtos` in `backend/app/api/routes/admin_produtos.py` for authenticated listing including inactive products, while create/update/delete remain in `backend/app/api/routes/produtos.py`.
- Product create/update payloads in `backend/app/schemas/produto.py` now accept `imagem_principal` plus up to 3 `imagens_secundarias`, normalizing blank/duplicate URLs before persistence.
- Product ORM responses derive `imagem_principal` and `imagens_secundarias` from the existing `imagens` relation in `backend/app/models/produto.py`, preserving legacy `imagens` reads while exposing edit-friendly URL fields on list/detail responses.
- `backend/app/api/routes/produtos.py` now rewrites related `Imagem` rows on create/update to keep one principal image and up to three secondary images with stable `ordem` values; `backend/app/api/routes/admin_produtos.py` includes the derived secondary URLs in admin listings for edit prefill.

## Backlinks

- [Overview](../overview.md)
- [Environment & Local Infra](./environment-and-infra.md)
- [Admin Panel](./admin-panel.md)
