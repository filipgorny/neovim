import R from 'ramda'
import { invalidExamTimeException, throwException } from '../../../../utils/error/error-factory'

export const validateTimeLeft = examSecondsLeft => (payload: { seconds_left: number }[]) => (
  R.pipe(
    R.prop('exam_seconds_left'),
    R.map(
      (payloadItem: { seconds_left: number }) => (
        R.pipe(
          R.prop('section_id'),
          (id): {} => R.find(R.propEq('section_id', id))(examSecondsLeft),
          R.prop('seconds_left'),
          R.when(
            R.gt(payloadItem.seconds_left),
            () => throwException(invalidExamTimeException())
          )
        )(payloadItem)
      )
    )
  )(payload)
)
