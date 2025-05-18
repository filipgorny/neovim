import * as R from 'ramda'
import { deleteByCourseId, create } from './calendar-chapter-exams-repository'
import forEachP from '../../../utils/function/foreachp'

export const setOrderForCourse = async (course_id: string, exam_ids: string[]) => {
  await deleteByCourseId(course_id)

  const results = []

  await forEachP(async (exam_id: string) => {
    const item = {
      course_id,
      exam_id,
    }

    const result = await create(item)

    results.push(result)
  })(exam_ids)

  return results
}

export const copyCalendarChapterExamForNewCourse = (newCourseId: string) => async (calendarChapterExam) => {
  const payload = {
    exam_id: calendarChapterExam.exam_id,
    course_id: newCourseId,
  }

  return create(
    R.omit(['id'])(payload)
  )
}
