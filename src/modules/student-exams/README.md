# student-exams

Core module for managing student exams. See `exam-sections/README.md`

## Routes

`GET /student-exams`

Get student exams.

`GET /student-exams/free-trial-exams`

Get only free trial exams.

`GET /student-exams/free-trial-exams-full`

Get only free trial exams from all sources (e.g. free trial stand-alone exam, chapter exam from book available in free trial).

`GET /student-exams/:id`

Get single exam.

`GET /student-exams/:exam_type_id/target-score`

**DEPRECATED**

Get the "target score" for a given exam type.

`GET /student-exams/:id/reset`

**DEPRECATED**

Reset the exam (e.g. target score).

`GET /student-exams/:id/passages`

Get the exam passages.

`GET /student-exams/:id/logs`

Fetch exam logs (as admin).

`GET /student-exams/:id/section-score-table/:section_id`

Get section score table.

`GET /student-exams/score-projection-data/:exam_type_id`

**DEPRECATED**

Get the score projection data.

`GET /student-exams/:id/retakes`

Get info about retake amount available for given exam.

`POST /student-exams/purchase`

Purchase an exam. Currently the client is leaning towards removing this feature at all - the exams should be bought only via courses.

`PATCH /student-exams/:id/save`

Pause the exam and save it's state.

`PATCH /student-exams/:id/exam-seconds-left`

Mark how many seconds are left in the exam (triggered by the front-end).

`PATCH /student-exams/:id/change-html`

Update the HTML markup for the exam.

`PATCH /student-exams/:id/start`

Start the exam.

`PATCH /student-exams/:id/resume`

Resume a paused exam.

`PATCH /student-exams/:id/finish`

Finish an exam.

`PATCH /student-exams/:id/timers`

Update exam timers.

`PATCH /student-exams/:id/toggle-pts-exclusion`

**DEPRECATED**

Toggle if the exam is excluded from the "projected target score" calculations.

`PATCH /student-exams/:id/finish-section/:section_id`

Finish an exam section.

`PATCH /student-exams/:id/change-access-period`

Change the access period for the exam.

`PATCH /student-exams/:id/max-completions`

Set the allowed number of completions (retakes) for given exam (done by admin).

`DELETE /student-exams/:id`

Remove a student exam.

## Related DB tables
- `student_exams`
