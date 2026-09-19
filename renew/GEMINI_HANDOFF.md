# Renew API handoff

The public UI and customer journey are complete. `api-config.js` is the integration switch. Keep API keys and privileged operations off the client.

## Required server endpoint

Implement `POST /api/leads` and place its URL in `endpoints.leadSubmission`. It receives the versioned object produced by `submissionPayload()` in `app.js` and returns:

```json
{"leadId":"opaque-id","status":"submitted"}
```

Implement `POST /api/lead-photos` and place its URL in `endpoints.photoUpload`. The front end sends `multipart/form-data` containing `leadId` and repeated `photos` fields. The server should authenticate its own service credentials, validate all fields and file types, rate-limit submissions, scan and upload photo binaries, and write only protected storage references into Firestore.

## Build order

1. Firebase Authentication for Mark and any staff; never expose the dashboard’s live query without a role check.
2. Firestore collections: `customers`, `properties`, `leads`, `projects`, `photos`, `walkthroughs`, `consents`, `followUps`, `estimates`, and `projectEvents`.
3. Firebase Storage for project photos with customer/project scoped rules. The browser should upload with short-lived authorization; never make the bucket public.
4. Google Places Autocomplete on `#address-input`, followed by server-side Address Validation. Save both entered and normalized addresses plus validation outcome.
5. Gemini server call after the lead is stored. Return structured JSON: `projectType`, `summary`, `missingInformation[]`, `suggestedNextAction`, and `safetyFlags[]`. AI output advises Mark; it does not approve, price, or promise work.
6. Google Calendar free/busy and event creation. The UI currently collects preferences and explicitly does not claim a confirmed appointment.
7. Transactional email confirmation.
8. SMS only when `consent.sms` is true. Preserve consent text, timestamp, source, phone, and opt-out history.
9. Stripe later. Store processor IDs and payment status only—never raw card data.

## Gemini prompt contract

Use the three internal questions:

- What is true? Extract only what the homeowner actually supplied.
- What is Renew’s to do? Classify the service and identify what needs human review.
- Who will it serve? Prepare Mark for a useful walkthrough.

Require JSON output matching:

```json
{
  "projectType":"string",
  "summary":"string",
  "missingInformation":["string"],
  "suggestedNextAction":"string",
  "safetyFlags":["string"]
}
```

Do not infer protected traits, creditworthiness, home ownership, income, or willingness to pay. Do not generate a binding estimate from photos or text.

## Final connection

When the backend passes tests, set `mode` to `connected` and enable each feature flag only after its own service is working. The existing email path remains a fallback until then.
