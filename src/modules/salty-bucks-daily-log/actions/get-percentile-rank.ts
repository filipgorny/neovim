import * as R from 'ramda'
import { excerptFromList } from '../../../../services/salty-bucks-percentile-rank/excerpt-from-list'
import { StudentCourse } from '../../../types/student-course'
import { getSaltyBucksPercentileRank } from '../../students/student-repository'

const addRowNumber = R.addIndex(R.map)(
  (student, index) => ({
    ...student,
    percentile_position: index + 1,
  })
)

const roundPercentileRank = R.map(
  R.evolve({
    percentile_rank: Math.round,
  })
)

const findCurrentStudent = student => R.find(R.propEq('id', student.id))

export default async (student, studentCourse: StudentCourse) => {
  const allStudents = await R.pipeWith(R.andThen)([
    getSaltyBucksPercentileRank,
    addRowNumber,
    roundPercentileRank,
  ])(studentCourse)

  const currentStudent = findCurrentStudent(student)(allStudents)

  return {
    all_students: R.pipe(
      excerptFromList(student.id)
    )(allStudents),
    current_student: currentStudent,
  }
}
