# dashboard

The dashboard is the main view the student sees after selecting a course.

## Routes

`GET /dashboard/graphs/book-progress`

Get the overall book progress.

`GET /dashboard/graphs/content-question-progress`

Get the content questions progress.

`GET /dashboard/graphs/study-time`

Get the study time (time spent on studying the books).

`GET /dashboard/graphs/salty-bucks/:mode`

Get the Salty Bucks earnings.

`GET /dashboard/graphs/mcat`

Get the most recent MCAT scores.

`GET /dashboard/graphs/flashcard-proficiency`

Get the flashcard stats.

`GET /dashboard/graphs/checklist-heatmap`

Get the topic checklist heatmap.

`GET /dashboard/graphs/video-progress`

Get the video progress.

`GET /dashboard/completion-meter`

**DEPRECATED**

Get the completion meter data. Currently unused.

`GET /dashboard/completion-meter/:student_course_id/debug`

**DEPRECATED**

Get the completion meter data in debug mode. Currently unused.

`GET /dashboard/games/ranks`

Get the ranks in different games.

## Related DB tables
N/A
