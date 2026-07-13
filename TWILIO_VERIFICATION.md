# Twilio Toll-Free Verification readiness

## Implemented in the software

- The booking form has a separate, optional SMS consent checkbox that is unchecked by default.
- Customers can complete a booking without consenting to SMS.
- Customer SMS messages are sent only after consent is stored successfully.
- Consent evidence stores the server timestamp, source, disclosure version, and displayed language.
- Technician assignment SMS messages require recorded technician consent.
- Initial customer and technician messages identify Rapi Mobile Mechanic and include HELP/STOP and rate disclosures.
- Public business information, services, service area, and the Toll-Free contact number are visible on the home page.
- Privacy Policy and Terms of Service links are visible beside the opt-in and in the footer.
- `/api/twilio/inbound` provides the HELP response when configured as the Twilio incoming-message webhook.

## Required before resubmission

1. Run `scripts/011-add-sms-consent-records.sql` in the Supabase SQL Editor.
2. Replace the reserved content in `/privacy-policy` and `/terms-of-service` with the client-approved documents.
   - The Privacy Policy must state that mobile/SMS opt-in data and consent are not shared with third parties or affiliates for marketing or promotional purposes.
   - The Terms must identify the SMS program, message purpose and frequency, possible message/data rates, HELP/STOP instructions, support contact, and carrier-delivery disclaimer.
3. Remove `robots: { index: false, follow: false }` from both legal pages after publishing final documents.
4. Confirm the production domain loads publicly over HTTPS and the business name/contact information matches the Twilio submission.
5. Capture a public screenshot of the complete phone and SMS consent area.
6. Configure the Toll-Free number's incoming-message webhook as `https://YOUR-DOMAIN/api/twilio/inbound` using HTTP POST.

## Suggested Twilio submission details

- Opt-in type: Web Form.
- Opt-in URL: the public home page containing the booking flow.
- Use case: transactional appointment confirmations and service updates; no marketing messages.
- Opt-in description: Customers enter a phone number during appointment scheduling and may independently select an unchecked optional checkbox to receive SMS appointment confirmations and service updates. Booking remains available without SMS consent.
- Estimated volume: use the client's realistic monthly estimate.

## Message samples

Customer appointment confirmation:

> Rapi Mobile Mechanic. Hi [First name], your appointment is booked. Vehicle: [Vehicle]. Service: [Service]. Date: [MM/DD/YYYY and time]. Location: [Address]. We will contact you shortly to confirm details. Message frequency varies. Msg & data rates may apply. Reply HELP for help or STOP to opt out.

Technician assignment:

> Rapi Mobile Mechanic - New assignment. Customer: [Name]. Service: [Service]. Vehicle: [Vehicle]. Date: [MM/DD/YYYY and time]. Address: [Address]. Message frequency varies. Msg & data rates may apply. Reply HELP for help or STOP to opt out.

HELP response:

> Rapi Mobile Mechanic: For appointment help, call +1 (833) 847-6582. Message frequency varies. Msg & data rates may apply. Reply STOP to opt out.

Do not resubmit while either legal page still displays pending content.
