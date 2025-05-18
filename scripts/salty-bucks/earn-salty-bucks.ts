import { earnSaltyBucksForSiteActivity } from '../../services/salty-bucks/salty-buck-service'
import orm from '../../src/models'
import { findOneOrFail } from '../../src/modules/student-courses/student-course-repository'

const { knex } = orm.bookshelf;

// eslint-disable-next-line @typescript-eslint/no-floating-promises
(async () => {
  const studentCourseId = process.argv[2]
  const actionType = process.argv[3]

  console.log('Earch Salty Bucks for studentCourseId:', studentCourseId, 'actionType:', actionType)

  const studentCourse = await findOneOrFail({ id: studentCourseId })

  if (actionType === 'site_activity') {
    await earnSaltyBucksForSiteActivity(studentCourse.student_id, 2, studentCourse)
  }

  console.log('Done')

  process.exit(0)
})()
