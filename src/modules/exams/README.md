# exams

Exams are one of the core features of the ExamKrackers platform. When a student buys an exam (via a course) he gets a copy (student-exam) of the original exam.

## Routes

`POST /exams/create-from-xlsx`

Create the exam from the uploaded XLSX file.

`POST /exams/export-csv`

Export exams in CSV format. Score / statistic data will be included in the file.

`POST /exams/:id/preview`

Preview the exam as an admin, to see how it will be received by the students.

`POST /exams/:id/reupload`

Reupload (replace) an existing exam, without changing the metrics.

`POST /exams/:id/set-all-scores`

Set all scores for a given exam.

`POST /exams/:id/initialize-exam-score-stats`

Initialize exam score stats for a given exam.

`PATCH /exams/bulk`

Delete many exams at once.

`PATCH /exams/:id`

Update an exam.

`PATCH /exams/:id/external-id`

Set the external ID for the exam. This is connected with the WP site (https://examkrackers.com)

`PATCH /exams/:id/access-period`

Change exams' access period.

`PATCH /exams/:id/google-form`

Set the Google Form URL for the exam (student survey).

`PATCH /exams/:id/toggle-score-calculation-method`

Set the score calculation method for an exam.

When an exam is long-lived and taken by several students, the calculated percentile ranks are sensible and close to reality. But when an exam is "fresh", the percentile ranks will be off for several students until it will eventually make sense. That's why the client might want to set the manual score calculation so the students will get a more reliable percentile rank.

`PATCH /exams/:id/title`

Change the exam title.

`PATCH /exams/:id/periodic-table`

Toggle if the periodic table should be accessible during the exam.

`PATCH /exams/:id/review-video`

Attach a video review to the exam.

`PATCH /exams/:id/custom-title`

Set the custom title of the exam (not visible to students).

`PATCH /exams/:id/max-completions`

Set the max completions (retakes) for the exam.

`GET /exams`

Fetch a list of exams.

`GET /exams/:type`

Fetch exams by type.

`GET /exams/:id/details`

Get a single exam.

`GET /exams/:id/logs`

Fetch exam logs.

`GET /exams/:id/scores`

Get the scores for a single exam.

`GET /exams/mock-diagram/get-data`

**DEPRECATED**

Legacy route used by developers.

`GET /exams/:id/diagram`

Get the diagram for the exam.

`GET /exams/:id/diagram/calc-percentile-rank`

Get the diagram for the exam (different variant).

`GET /exams/:id/download-scores`

Download exam scores for a given exam.

`DELETE /exams/:id`

Remove a single exam.

## Related DB tables
- `exams`
