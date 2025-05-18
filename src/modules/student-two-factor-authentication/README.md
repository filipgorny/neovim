# student-two-factor-authentication

Two factor authentication (2FA) implementation. Uses a 3rd-party service (Plivo) to dispatch SMS messages with a verification code.

## Routes

`POST /student-two-factor-authentication/verify-student`

Verify if a student with given phone number and email exists.

`POST /student-two-factor-authentication/send-code`

Dispatch an SMS with the verification code.

`POST /student-two-factor-authentication/verify-code`

Check the verification code.

`POST /student-two-factor-authentication/enable`

Enable 2FA in the application.

`POST /student-two-factor-authentication/disable`

Disable 2FA in the application.

`POST /student-two-factor-authentication/:id/resend`

Resend the verification code.

`POST /student-two-factor-authentication/toggle-email-resend`

Toggle if an email code resend will be available.

`GET /student-two-factor-authentication/is-enabled`

Returns info if 2FA is enabled.

## Related DB tables

N/A
