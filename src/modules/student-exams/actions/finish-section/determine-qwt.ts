import * as R from 'ramda'

export const determineQWT = (question, firstQuestionAvgWorkingTime) => () => {
  const firstQWT = R.min(question.passageReading || 0, firstQuestionAvgWorkingTime)

  return R.pipe(
    R.propOr(0, 'workingTimeTemp'),
    parseInt,
    R.add(firstQWT)
  )(question)
}
