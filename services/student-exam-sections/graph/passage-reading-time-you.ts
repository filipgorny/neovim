import * as R from 'ramda'

const buildForSinglePassage = timerType => (payload) => {
  const { question_amount, reading_speed, is_false_passage } = payload
  const values = []
  const yValue = payload[timerType]

  for (let i = 1; i <= question_amount; i++) {
    values.push({
      x: i,
      y: yValue,
      isEmpty: false,
      isFalsePassage: is_false_passage,
      wordsPerMinute: reading_speed,
    })
  }

  return values
}

const getLastXValue = R.pipe(
  R.last,
  R.prop('x')
)

const adjustSingleAxisX = item => data => {
  const lastX = getLastXValue(item)

  return R.map(
    R.pipe(
      // @ts-ignore
      R.over(R.lensProp('x'), R.add(lastX))
    )
  )(data)
}

const adjustAxisX = data => (
  R.addIndex(R.map)(
    (item, index) => {
      if (data[index + 1]) {
        data[index + 1] = adjustSingleAxisX(item)(data[index + 1])
      }

      return item
    }
  )(data)
)

const handleMissingValues = R.map(
  // @ts-ignore
  R.when(
    R.propSatisfies(R.isNil, 'y'),
    // @ts-ignore
    R.applySpec({
      // @ts-ignore
      x: R.prop('x'),
      y: R.always(0),
      isEmpty: R.always(true),
    })
  )
)

export const buildPassageTimeGraphData = timerType => data => (
  R.pipe(
    R.values,
    R.map(
      R.pipe(
        R.pick(['question_amount', timerType, 'reading_speed', 'is_false_passage']),
        buildForSinglePassage(timerType)
      )
    ),
    adjustAxisX,
    R.flatten,
    // @ts-ignore
    handleMissingValues
    // @ts-ignore
  )(data)
)
