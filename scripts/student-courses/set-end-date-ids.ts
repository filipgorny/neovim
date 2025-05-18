import orm, { Student } from '../../src/models'
import { getEndDate } from '../../src/modules/course-end-dates/course-end-dates-service'
import { StudentCourseTypes } from '../../src/modules/student-courses/student-course-types'
import { patch } from '../../src/modules/student-courses/student-courses-repository'

const knex = orm.bookshelf.knex;

// eslint-disable-next-line @typescript-eslint/no-floating-promises
(async () => {
  console.log('Set end date ids for all live student courses')

  const studentCourses = await knex.from('student_courses').select('id', 'book_course_id', 'original_end_date').where('type', StudentCourseTypes.liveCourse).whereNull('end_date_id')

  for (const { id, book_course_id, original_end_date } of studentCourses) {
    const endDate = await getEndDate(book_course_id, original_end_date)

    if (!endDate) {
      console.log(`No end date found for student course ${id}`)
      continue
    }

    await patch(id, { end_date_id: endDate.id })
  }

  console.log('Done')

  process.exit(0)
})()
