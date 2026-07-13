-- Add auditable SMS consent records for customers and technicians.
-- Existing records remain opted out by default.

ALTER TABLE appointments ADD COLUMN IF NOT EXISTS sms_consent BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS sms_consent_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS sms_consent_source TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS sms_consent_version TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS sms_consent_locale TEXT;

ALTER TABLE technicians ADD COLUMN IF NOT EXISTS sms_consent BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE technicians ADD COLUMN IF NOT EXISTS sms_consent_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE technicians ADD COLUMN IF NOT EXISTS sms_consent_source TEXT;
ALTER TABLE technicians ADD COLUMN IF NOT EXISTS sms_consent_version TEXT;

COMMENT ON COLUMN appointments.sms_consent IS 'Optional customer consent to receive appointment SMS messages.';
COMMENT ON COLUMN appointments.sms_consent_at IS 'Server timestamp when customer SMS consent was recorded.';
COMMENT ON COLUMN appointments.sms_consent_source IS 'Source of customer SMS consent, such as booking_web_form.';
COMMENT ON COLUMN appointments.sms_consent_version IS 'Version of the SMS disclosure accepted by the customer.';
COMMENT ON COLUMN appointments.sms_consent_locale IS 'Language used when displaying the SMS disclosure.';

COMMENT ON COLUMN technicians.sms_consent IS 'Whether technician consent for assignment SMS messages is recorded.';
COMMENT ON COLUMN technicians.sms_consent_at IS 'Timestamp when technician SMS consent was recorded.';
COMMENT ON COLUMN technicians.sms_consent_source IS 'Source used to record technician SMS consent.';
COMMENT ON COLUMN technicians.sms_consent_version IS 'Version of the technician SMS disclosure.';
