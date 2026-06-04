# Project Overview

_Last updated: 2026-06-04_

JehFashion is a private fashion e-commerce project with a FastAPI backend and a Next.js 14 frontend. The backend exposes admin authentication and catalog APIs over PostgreSQL/Redis-backed services, while the frontend provides the storefront UI and API integration points for product browsing and purchase intent flows.

## Top-level modules

- [Backend API](./pages/backend-api.md) — `backend/` contains the FastAPI application, database models, schemas, services, migrations, and scripts for admin/bootstrap workflows.
- [Frontend App](./pages/frontend-app.md) — `frontend/` contains the Next.js 14 application using TypeScript, TailwindCSS, and Axios/Zustand for the customer-facing UI.
- [Environment & Local Infra](./pages/environment-and-infra.md) — `docker-compose.yml` and root-level setup docs coordinate local PostgreSQL/Redis-backed development.
