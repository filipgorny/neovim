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
  console.log('Fix metadata and original_end_date for student courses')

  const studentCourses = await knex.from('student_courses').select('id', 'metadata', 'original_metadata').where('type', StudentCourseTypes.liveCourse)

  for (const { id, metadata, original_metadata } of studentCourses) {
    const { expires_at } = JSON.parse(metadata)
    const { expires_at: original_expires_at } = JSON.parse(original_metadata)

    if (expires_at.includes('T') || original_expires_at.includes('T')) {
      await patch(id, { metadata: fixMetadata(metadata), original_metadata: fixMetadata(original_metadata), original_end_date: eliminateTime(original_expires_at.split('T')[0]) })
    }
  }

  console.log('Done')

  process.exit(0)
})()
