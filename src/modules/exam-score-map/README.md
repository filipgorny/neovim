# exam-score-map

The MCAT scoring system (held by AAMC) is not known to the public. These scores are announced once a year. ExamKrackers is doing a similar thing - scores are being mapped based on students' correct answers.

The exam score map module is responsible for that. It holds the translation from amount of correct answers in a given exam, to the score that will be given.

Full-length MCAT exams consist of four sections that can score from 118 to 132. The overall exam score is a sum of all sections, hence ranging from 472 to 528.

## Routes

None

## Related DB tables
- `exam_score_map`
- `exam_section_score_map`
