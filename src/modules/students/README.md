# students

Core module for managing students.

## Routes

`POST /students`

Create a student account.

`POST /students/sync-student`

Authorize a student using JWT token from request headers.

`POST /students/refresh-token`

Refresh auth token.

`POST /students/export-csv`

Export a CSV file with student data.

`POST /students/bulk/products`

**DEPRECATED**

Add several products to students.

`POST /students/:id/products`

**DEPRECATED**

Add several products to a single student.

`POST /students/bulk/attach-products`

Add several products to students.

`POST /students/:id/attach-products`

Add several products to a single student.

`POST /students/purchase-products`

Purchase products.

`POST /students/attach-products`

Attach products to a student.

`POST /students/create-account`

Create a student account with external ID.

`POST /students/wallet/cash-out`

**DEPRECATED**

Cash out the wallet to Salty Bucks balance.

`POST /students/transfer-products/from/:from_student_id/to/:to_student_id`

**DEPRECATED**

Move products from one student to another.

`GET /students`

Fetch a list of students.

`GET /students/v2`

Fetch a list of students (different approach).

`GET /students/v3`

Fetch a list of students (yet a different approach).

`GET /students/exams`

Fetch student's exams.

`GET /students/profile`

Get student profile.

`GET /students/exams/nav`

Get the navigarion for exams.

`GET /students/:id/salty-bucks-logs`

Fetch the Salty Bucks logs.

`GET /students/salty-bucks-logs`

Fetch the Salty Bucks logs (as a student).

`GET /students/:id/profile`

Get profile details.

`GET /students/:id/courses`

Fetch student courses.

`GET /students/:id/exams`

Get student exams.

`GET /students/:id/books`

Get student books.

`GET /students/:id/classes`

Get classes student is assigned to.

`GET /students/:id/salty-bucks/:mode`

Fetch data to display Salty Bucks graph.

`GET /students/email-exists`

Validate if email already exists.

`GET /students/has-products`

Check if the student has products attached.

`GET /students/standalone-exams`

Fetch student's stand-alone exams.

`PATCH /students/change-target-score/:exam_type_id`

**DEPRECATED**

Change the target score.

`PATCH /students/change-section-target-score/:exam_type_id/:section_order`

**DEPRECATED**

Change the target score for a section.

`PATCH /students/reset-target-score/:exam_id`

**DEPRECATED**

Reset target score.

`PATCH /students/bulk/is-active`

Toggle several student accounts activity.

`PATCH /students/:id/is-active`

Toggle single account activity.

`PATCH /students/:id/salty-bucks-balance`

Set the Salty Bucks balance.

`PATCH /students/bump-site-activity`

Send a signal that the student is active in the application (is actively using it).

`PATCH /students/flashcard-study-mode/:mode`

Set the flashcard study mode.

`PATCH /students/delete`

Remove student accounts.

`PATCH /students/username`

Set student username.

`PATCH /students/external-id`

Set the external ID.

`PATCH /students/upsert-with-external-id`

Upsert a student account with external ID.

`PATCH /students/support-tab-seen`

Mark the support tab as seen.

`PATCH /students/timezone`

Set the student's timezone.

`PATCH /students/:id/timezone`

Set the student's timezone (as admin).

`PATCH /students/use-default-timezone`

Set default timezone.

`PATCH /students/:id/use-default-timezone`

Set default timezone (as admin).

`PATCH /students/dont-use-default-timezone`

Mark the account to not use the default timezone.

`PATCH /students/:id/dont-use-default-timezone`

Mark the account to not use the default timezone (as admin).

`PATCH /students/set-video-bg-music`

Toggle video background music.

`PATCH /students/set-cq-animations`

Toggle content question animations (reactions).

`PATCH /students/set-theme`

Set the light or dark colour theme.

`PATCH /students/onboarding-seen`

**DEPRECATED**

Mark the onboarding as seen.

`PATCH /students/:id/external-id`

Update the external ID.

`PATCH /students/:id/profile`

Update student profile.

`PATCH /students/getting-started-completed`

Set "is getting started" as complete.

`PATCH /students/getting-started-incomplete`

Set "is getting started" as incomplete.

`PATCH /students/:id/freeze`

Freeze an account. This prevents inactive (i.e. did not log in for a long period of time) accounts from auto-removal.

`PATCH /students/:id/unfreeze`

Unfreeze an account.

`PATCH /students/:id/admin-note`

Create a note visible only to admins.

## Related DB tables
- `students`
