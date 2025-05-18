# ai-tutor-scores

When a student interacts with the AI Tutor and answers his questions, his anwers are graded and recorded in the database.

## Routes
`POST /ai-tutor-scores`

Record student's answer to a given question.

`GET /ai-tutor-scores`

Fetch scores for the logged in student.

`GET /ai-tutor-scores/average`

Get the average score.

`GET /ai-tutor-scores/chapter-progress`

Get the chapter progress for all books in a course.

## Related DB tables
- `ai_tutor_scores`
