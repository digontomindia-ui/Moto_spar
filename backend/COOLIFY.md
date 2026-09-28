# Coolify deployment (backend only)

Deploy this repository as a Dockerfile application with **Base Directory** set to `/backend`.
Coolify will then use `backend/Dockerfile` and expose the application on port `8000`.

## Environment variables

Add the values from `.env.example` in Coolify's Environment Variables page. Keep the
managed PostgreSQL password in Coolify only; do not commit it to Git.

For the managed database, retain `DATABASE_SSLMODE=require`. The configured database
hostname is a private Coolify network name, so it resolves only from services in that
Coolify environment. If the database is hosted elsewhere, use its public hostname instead.

Set these values to the deployed API domain before releasing:

- `ALLOWED_HOSTS`
- `CSRF_TRUSTED_ORIGINS`
- `CORS_ORIGIN_WHITELIST`
- `PRODUCT_PAGE_URL_TEMPLATE`

## Persistent storage

Add a Coolify persistent storage mount at `/app/media` if uploaded product, profile, or
review images must survive redeployments. Static files are regenerated automatically on
each deployment.

## Startup behavior

`start.sh` runs migrations, upserts the six chatbot products, and collects static files,
then serves Django with Gunicorn. No local PostgreSQL container or frontend application is
included in this deployment.
