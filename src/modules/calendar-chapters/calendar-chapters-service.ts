import * as R from 'ramda'
import { deleteByCourseId, create } from './calendar-chapters-repository'
import forEachP from '../../../utils/function/foreachp'

export const setOrderForCourse = async (course_id: string, chapter_ids: string[]) => {
  await deleteByCourseId(course_id)

  let i = 1
  const results = []

  await forEachP(async (chapter_id: string) => {
    const item = {
      course_id,
      chapter_id,
      order: i++,
    }

    const result = await create(item)

    results.push(result)
  })(chapter_ids)

  return results
}

export const copyCalendarChapterForNewCourse = (newCourseId: string) => async (calendarChapter) => {
  if (!calendarChapter.order) {
    return
  }

  const newMcatDate = {
    chapter_id: calendarChapter.chapter_id,
    order: calendarChapter.order,
    course_id: newCourseId,
  }

  return create(
    R.omit(['id'])(newMcatDate)
  )
}
