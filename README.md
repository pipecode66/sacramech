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
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
ADMIN_BOOKING_SMS_NUMBER=
```

`SUPABASE_SERVICE_ROLE_KEY` is required for the review API and moderation actions.
`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_PHONE_NUMBER` are required for SMS notifications.
`ADMIN_BOOKING_SMS_NUMBER` is the opted-in business number that receives new appointment alerts.
Customer SMS messages require optional consent in the booking form, and mechanic assignment messages require recorded technician consent.

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

Use the SQL scripts in `scripts/` to create or update the Supabase schema.
- Reviews depend on `scripts/005-create-reviews-table.sql` (or the updated `scripts/004-full-setup.sql`).
- Persistent mechanic settings/assignments depend on `scripts/007-create-technicians-table.sql` (or the updated `scripts/004-full-setup.sql`).
- Auditable customer and technician SMS consent depends on `scripts/011-add-sms-consent-records.sql` (or the updated `scripts/004-full-setup.sql`).

