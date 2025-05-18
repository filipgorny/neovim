import * as R from 'ramda'
import { patchSiteActivity } from '../../src/modules/students/student-service'
import olderThanNMinutes from '../../utils/datetime/older-than-n-minutes'
import { earnSaltyBucksForSiteActivity } from '../salty-bucks/salty-buck-service'
import { StudentCourse } from '../../src/types/student-course'
import { bumpSiteActivityForStudentCourse } from '../../src/modules/student-courses/student-course-service'

/**
 * To prevent malicious activity bumping to earn SB,
 * prevent the bump before the right amount of time passes.
 */
const isValidTimePeriod = (student, duration) => {
  const lastActivity = student[`activity_streak_${duration}min`]

  return olderThanNMinutes(duration, lastActivity)
}

const bumpFirstTime = (duration, studentCourse: StudentCourse, activityType: string) => async student => (
  Promise.all([
    patchSiteActivity(student.id, duration),
    earnSaltyBucksForSiteActivity(student.id, duration, studentCourse),
  ])
)

const bumpExisting = (duration, studentCourse: StudentCourse, activityType: string) => async student => (
  isValidTimePeriod(student, duration)
    ? Promise.all([
      patchSiteActivity(student.id, duration),
      earnSaltyBucksForSiteActivity(student.id, duration, studentCourse),
    ])
    : undefined
)

export const bumpSiteActivity = async (student, duration: number, studentCourse: StudentCourse, activityType: string) => {
  await bumpSiteActivityForStudentCourse(studentCourse, duration, activityType)

  return R.pipe(
    R.invoker(0, 'toJSON'),
    R.ifElse(
      R.propSatisfies(R.isNil, `activity_streak_${duration}min`),
      bumpFirstTime(duration, studentCourse, activityType),
      bumpExisting(duration, studentCourse, activityType)
    )
  )(student)
}
