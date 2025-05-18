import * as R from 'ramda'

const isNotEmpty = R.pipe(
  R.isEmpty,
  R.not
)

export const studentWasActive = (findLogsFn, activityPredicateFn = isNotEmpty) => async (course, fromDate) => (
  R.pipeWith(R.andThen)([
    async () => findLogsFn(course.student_id, fromDate),
    R.prop('data'),
    activityPredicateFn,
  ])(true)
)
