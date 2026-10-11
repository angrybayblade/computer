# me

Personal site built with Next.js. Metadata is stored in PostgreSQL, using the schema in `lib/db/client.ts`.

## Local development

Start the database server:

```bash
docker compose up -d db
```

Set the application connection and run Next.js:

```bash
export DATABASE_URL=postgresql://me:me@127.0.0.1:5432/me
npm run dev
```

The checked-in `.env.example` contains this local connection string; copy it to `.env.local` if you prefer not to export it in each shell. The default credentials are intended only for local development and can be overridden with `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `DATABASE_URL`.

`SITE_URL` defaults to `https://viraj.computer` and can be overridden for another deployment. It is used for canonical metadata, structured data, `robots.txt`, and `sitemap.xml`.

Set `EDIT_SESSION_SECRET` to a stable random value of at least 32 characters. It signs admin sessions and encrypts the authenticator seed stored in PostgreSQL. Changing it invalidates all sessions and requires rotating the authenticator setup.

## Admin authenticator login

Enroll an authenticator after the database is running:

```bash
DATABASE_URL=postgresql://me:me@127.0.0.1:5432/me EDIT_SESSION_SECRET='your-stable-random-secret' npm run admin:setup-2fa
```

Scan the terminal QR code with an RFC 6238-compatible authenticator. The admin panel accepts six-digit codes, prevents reuse of a code, and locks verification for five minutes after five failures.

To intentionally replace a lost or compromised authenticator entry:

```bash
DATABASE_URL=postgresql://me:me@127.0.0.1:5432/me EDIT_SESSION_SECRET='your-stable-random-secret' npm run admin:rotate-2fa
```

## Migrate the existing SQLite file

With the target PostgreSQL server running and `DATABASE_URL` set:

```bash
npm run migrate:sqlite
```

The command copies every row from `.data/app.sqlite`, replacing the target contents table-by-table in transactions. Pass a different source path after `--` when needed:

```bash
npm run migrate:sqlite -- /path/to/app.sqlite
```

Keep the source file until the migrated application has been verified.

## Seed data

```bash
npm run seed
npm run seed:force
```

The application also seeds an empty database from `scripts/data` on first use. `seed:force` replaces all server data with those checked-in defaults.

## Deploy

```bash
npm run deploy
```

Docker Compose runs the web application and PostgreSQL. Database files live in the named `me_postgres-data` volume, independently of web container rebuilds. Set `DATABASE_URL` to override the bundled server with another PostgreSQL instance.
