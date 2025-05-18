import R from 'ramda'
import { safeDivide } from '../../utils/number/safe-divide'

const calculatePercentage = (a, b) => (
  R.pipe(
    safeDivide(R.__, b),
    // @ts-ignore
    R.multiply(100),
    Math.round
    // @ts-ignore
  )(a)
)

const bumpGivenAnswer = (answer, answerCount, allAnswersAmount) => R.pipe(
  R.prop(answer),
  R.applySpec({
    amount: R.always(answerCount + 1),
    percentage: R.always(calculatePercentage(answerCount + 1, allAnswersAmount)),
  }),
  R.objOf(answer)
)

export const updateAnswerDistribution = (answer, allAnswersAmount) => answerDistribution => {
  const answerCount = R.pipe(
    R.prop(answer),
    // @ts-ignore
    R.prop('amount'),
    R.when(
      R.isNil,
      R.always(0)
    )
    // @ts-ignore
  )(answerDistribution)

  return R.pipe(
    R.juxt([
      R.map(
        // @ts-ignore
        details => R.over(
          // @ts-ignore
          R.lensProp('percentage'),
          // @ts-ignore
          R.always(calculatePercentage(details.amount, allAnswersAmount))
        )(details)
      ),
      // @ts-ignore
      bumpGivenAnswer(answer, answerCount, allAnswersAmount),
    ]),
    // @ts-ignore
    R.mergeAll
    // @ts-ignore
  )(answerDistribution)
}
