import moment from 'moment'
import { DATETIME_DATABASE_FORMAT, DATE_FORMAT_YMD } from '../../src/constants'
import orm, { Student } from '../../src/models'
import { eliminateTime, getEndDate } from '../../src/modules/course-end-dates/course-end-dates-service'
import { StudentCourseTypes } from '../../src/modules/student-courses/student-course-types'
import { patch } from '../../src/modules/student-courses/student-courses-repository'

const knex = orm.bookshelf.knex;

// eslint-disable-next-line @typescript-eslint/no-floating-promises
(async () => {
  console.log('Fix original end dates for student courses')

  const studentCourses = await knex.from('student_courses').select('id', 'accessible_to', 'original_end_date', 'original_metadata').where('type', StudentCourseTypes.liveCourse)

  for (const { id, accessible_to, original_end_date, original_metadata } of studentCourses) {
    const { expires_at } = JSON.parse(original_metadata)

    if (moment(original_end_date).format(DATETIME_DATABASE_FORMAT) !== eliminateTime(expires_at)) {
      await patch(id, {
        ...(moment(accessible_to).format(DATETIME_DATABASE_FORMAT) === moment(original_end_date).format(DATETIME_DATABASE_FORMAT) ? { accessible_to: eliminateTime(expires_at) } : {}),
        original_end_date: eliminateTime(expires_at),
      })
    }
  }

  console.log('Done')

  process.exit(0)
})()
