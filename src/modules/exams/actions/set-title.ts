import * as R from 'ramda'
import { setTitle } from '../exam-service'
import { findOne } from '../exam-repository'
import { examTitleAlreadyExistsException, throwException } from '../../../../utils/error/error-factory'

const findByTitle = async title => (
  R.unless(
    R.isNil,
    async () => findOne({
      title,
    })
  )(title)
)

const validateExistingExam = currentExamId => async title => (
  R.pipeWith(R.andThen)([
    findByTitle,
    R.unless(
      R.isNil,
      R.unless(
        R.propEq('id', currentExamId),
        () => throwException(examTitleAlreadyExistsException())
      )
    ),
  ])(title)
)

export default async (id: string, payload, user) => {
  const { title } = payload

  await validateExistingExam(id)(title)

  return setTitle(id)(title, user.id)
}
