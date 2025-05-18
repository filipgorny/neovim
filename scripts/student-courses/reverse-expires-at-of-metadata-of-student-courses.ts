import moment from 'moment'
import { DATE_FORMAT_YMD } from '../../src/constants'
import orm, { Student } from '../../src/models'
import { eliminateTime, getEndDate } from '../../src/modules/course-end-dates/course-end-dates-service'
import { StudentCourseTypes } from '../../src/modules/student-courses/student-course-types'
import { patch } from '../../src/modules/student-courses/student-courses-repository'

const knex = orm.bookshelf.knex

const fixMetadata = (metadata: string) => {
  const { expires_at } = JSON.parse(metadata)

  if (expires_at.includes('T')) {
    return JSON.stringify({ expires_at: expires_at.split('T')[0] })
  }

  return metadata
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
(async () => {
  console.log('Reverse expires_at of metadata for student courses')

  const studentCourses = await knex.from('student_courses').select('id', 'metadata', 'original_metadata').where('type', StudentCourseTypes.liveCourse)

  for (const { id, metadata, original_metadata } of studentCourses) {
    const { expires_at } = JSON.parse(metadata)
    const { expires_at: original_expires_at } = JSON.parse(original_metadata)

    const [YYYY, MM, DD] = expires_at.split('-')
    const [original_YYYY, original_MM, original_DD] = original_expires_at.split('-')

    if (YYYY.length === 2 || original_YYYY.length === 2) {
      await patch(id, {
        ...(YYYY.length === 2 ? { metadata: JSON.stringify({ expires_at: [DD, YYYY, MM].join('-') }) } : {}),
        ...(original_YYYY.length === 2 ? { original_metadata: JSON.stringify({ expires_at: [original_DD, original_YYYY, original_MM].join('-') }) } : {}),
        ...(original_YYYY.length === 2 ? { original_end_date: eliminateTime([original_DD, original_YYYY, original_MM].join('-')) } : {}),
      })
    }
  }

  console.log('Done')

  process.exit(0)
})()
