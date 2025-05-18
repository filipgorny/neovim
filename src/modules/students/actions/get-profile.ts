import * as R from 'ramda'
import { evalProp } from '../../../../utils/object/eval-prop'
import { BookshelfEntity } from '../../../types/bookshelf-entity'
import { Student } from '../../../types/student'

export default async (student: BookshelfEntity<Student>, impersonateData, previewData) => R.pipe(
  R.invoker(0, 'toJSON'),
  evalProp('is_impersonated', R.always(impersonateData.is_impersonated)),
  evalProp('impersonated_by', R.always(impersonateData.impersonated_by)),
  evalProp('is_preview', R.always(previewData.is_preview)),
  evalProp('preview_admin', R.always(previewData.preview_admin))
)(student)
