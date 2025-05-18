import { StudentCourse } from '../../../types/student-course'
import { fetchChapterProgress } from '../ai-tutor-scores-service'

export default async (studentCourse: StudentCourse) => {
  const averageChapterProgress = await fetchChapterProgress(studentCourse)

  const { chapters } = averageChapterProgress

  const chaptersWithScores = chapters.filter(chapter => chapter.average_score !== null)

  const strongest = chaptersWithScores.reduce((max, chapter) => chapter.average_score > max.average_score ? chapter : max, chaptersWithScores[0])
  const weakest = chaptersWithScores.reduce((min, chapter) => chapter.average_score < min.average_score ? chapter : min, chaptersWithScores[0])

  return {
    all: averageChapterProgress.all,
    strongest: strongest || null,
    weakest: weakest || null,
  }
}
