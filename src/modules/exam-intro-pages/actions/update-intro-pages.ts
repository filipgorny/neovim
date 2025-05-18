import R from 'ramda'
import { updateIntroPagesBulk } from '../exam-intro-page-repository'
import { findOneOrFail } from '../../exam-types/exam-type-repository'
import { introPagesLengthMismatchException, throwException } from '../../../../utils/error/error-factory'

type UpdateIntroPagePayload = {
  intro_pages: Array<{
    raw: string,
    delta_object: object,
  }>
}

const validateIntroPagesLength = (type, introPages) => R.pipe(
  R.propOr([], 'introPages'),
  R.prop('length'),
  R.when(
    length => introPages.length !== length,
    () => throwException(introPagesLengthMismatchException())
  )
)(type)

const getPageId = (idx, pages) => R.pipe(
  R.find(
    R.propEq('order', idx)
  ),
  R.propOr(null, 'id')
)(pages)

const prepareIntroPages = (originalPages, introPages) => R.pipe(
  R.addIndex(R.map)(
    (value, idx) => R.assoc('id', getPageId(idx + 1, originalPages))(value)
  ),
  R.reject(
    R.propEq('id', null)
  )
)(introPages)

export default async (id: string, payload: UpdateIntroPagePayload) => {
  const type = await findOneOrFail({ id }, ['introPages'])
  const introPages = prepareIntroPages(type.introPages, payload.intro_pages)

  validateIntroPagesLength(type, introPages)

  return updateIntroPagesBulk(introPages)
}
