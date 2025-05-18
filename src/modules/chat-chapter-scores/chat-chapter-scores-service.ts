import { findOne as findChapterScore, create, patch } from './chat-chapter-scores-repository'

export const upsertChatChapterScore = async (student_id: string, student_book_chapter_id: string, score: number) => {
  const chapterScore = await findChapterScore({ student_id, student_book_chapter_id })

  if (chapterScore) {
    const chapter_score_sum = chapterScore.chapter_score_sum + score
    const chapter_score_amount = chapterScore.chapter_score_amount + 1
    const chapter_avg_score = Math.round(chapter_score_sum / chapter_score_amount)

    return patch(chapterScore.id, { chapter_score_sum, chapter_score_amount, chapter_avg_score })
  }

  return create({ student_id, student_book_chapter_id, chapter_avg_score: score, chapter_score_sum: score, chapter_score_amount: 1 })
}
