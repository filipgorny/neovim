import { StudentCourse } from '../../types/student-course'
import { create, patch, deleteRecord, findAverageScoresByChapterWithBookInfo } from './ai-tutor-scores-repository'
import models from '../../models'

const MAX_SCORE_RECORDS = 10

const { knex } = models.bookshelf

export const createAiTutorScore = async (studentCourse: StudentCourse, student_book_chapter_id: string, score: number) => {
  const item = await create({ student_course_id: studentCourse.id, student_book_chapter_id, score })

  // Delete "old" scores
  await knex('ai_tutor_scores')
    .where({ student_book_chapter_id })
    .whereNotIn('id',
      knex('ai_tutor_scores')
        .where({ student_book_chapter_id })
        .orderBy('created_at', 'desc')
        .limit(MAX_SCORE_RECORDS)
        .select('id')
    )
    .delete()

  return item
}

export const patchEntity = async (id: string, dto: {}) => (
  patch(id, dto)
)

export const deleteEntity = async (id: string) => (
  deleteRecord(id)
)

export const fetchChapterProgress = async (studentCourse: StudentCourse) => {
  const averageScores = await findAverageScoresByChapterWithBookInfo(studentCourse.id)

  let totalSum = 0

  for (const chapter of averageScores) {
    totalSum += Number(chapter.average_score || 0)
  }

  const overallAverage = averageScores.length > 0
    ? Math.round(totalSum / averageScores.length)
    : 0

  return {
    chapters: averageScores,
    all: overallAverage,
  }
}
