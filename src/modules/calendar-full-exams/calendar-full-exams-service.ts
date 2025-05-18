import * as R from 'ramda'
import { deleteByCourseId, create } from './calendar-full-exams-repository'
import forEachP from '../../../utils/function/foreachp'

export const setOrderForCourse = async (course_id: string, exam_ids: string[]) => {
  await deleteByCourseId(course_id)

  let i = 1
  const results = []

  await forEachP(async (exam_id: string) => {
    const item = {
      course_id,
      exam_id,
      order: i++,
    }

    const result = await create(item)

    results.push(result)
  })(exam_ids)

  return results
}

export const copyCalendarFullExamForNewCourse = (newCourseId: string) => async (calendarFullExam) => {
  const payload = {
    ...calendarFullExam,
    course_id: newCourseId,
  }

  return create(
    R.omit(['id'])(payload)
  )
}
