# admins

The application is managed by admins. There are to main roles - Master Admin and Employee. Employees may have specific roles / permissions assigned. For example, one admin is responsible for videos, the other one for exams.

## Routes
`POST /admins/login`

Authenticate the admin user. If the process is succesful, a JWT token will be issued.

`POST /admins`

Create a new admin account.

`POST /admins/reset-password-init`

This initiates the password reset routine.

`POST /admins/reset-password-validate`

Second step of the password reset routine.

`POST /admins/reset-password-finish`

Final step of the password reset routine. On success, the admin will be able to log in using new credentials.

`POST /admins/impersonate/:id`

Admins are able to impersonate a student. They will be logged in into the application as the student (but with limited privileges, e.g. they can't finish an exam). This is a mechanism to allow the admin to experience the application from the student's perspective, used often to debug the application and verify issues.

`POST /admins/book-chapter/:id/attach`

**DEPRECATED**

Used to assign multiple admins to manage a single chapter in a book.

`POST /admins/:id/book-chapters/attach`

**DEPRECATED**

Used to assign a single admin to manage a single chapter in a book.

`GET /admins/profile`

Fetch admin's profile details (logged in admin).

`GET /admins`

Returns a list of admins.

`GET /admins/:id`

Returns details for a given admin.

`GET /api/admins/verify`

**DEPRECATED**

Route meant to be used with an abandoned feature.

`PATCH /admins/bulk`

Delete admin accounts in bulk.

`PATCH /admins/:id`

Update admin account.

`PATCH /admins/book-chapter/:id/detach`

**DEPRECATED**

Used to detach multiple admins from managing a single chapter in a book.

`PATCH /admins/:id/book-chapters/detach`

**DEPRECATED**

Used to detach a single admin from managing a single chapter in a book.

`PATCH /admins/:id/permission`

Managa admin permissions.

`DELETE /admins/:id`

Remove an admin account.

## Related DB tables
- `admins`
