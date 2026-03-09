# sacramech

Sacramech is a Next.js application for a mobile mechanic booking flow and an internal admin dashboard.

## Features

- Multi-step customer booking flow with address validation and slot selection
- Admin dashboard for appointment management and mechanic assignment
- Review submission flow with manual moderation
- English and Spanish UI support

## Requirements

- Node.js 20+
- pnpm 10+
- Supabase project with the required tables

## Environment variables

Create a local `.env` file with:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
VEHICLE_REGISTRATION_API_USERNAME=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

`SUPABASE_SERVICE_ROLE_KEY` is required for the review API and moderation actions.
`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_PHONE_NUMBER` are required to send mechanic assignment SMS notifications.
`VEHICLE_REGISTRATION_API_USERNAME` enables automatic plate lookups for California license plates.

## Development

Install dependencies:

```bash
pnpm install
```

Run the app:

```bash
pnpm dev
```

Build for production:

```bash
pnpm build
```

## Database

Use the SQL scripts in `scripts/` to create or update the Supabase schema. The reviews module depends on `scripts/005-create-reviews-table.sql` or the updated `scripts/004-full-setup.sql`.

