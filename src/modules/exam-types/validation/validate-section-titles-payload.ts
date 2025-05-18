import { customException, throwException } from '@desmart/js-utils'
import * as R from 'ramda'

export default (section_titles: Array<{ order: number, value: string }>, sections_count: number) => {
  const isOK = R.pipe(
    R.map(R.prop('order')),
    R.sort((a, b) => a - b),
    R.equals(R.range(1, sections_count + 1))
  )(section_titles)

  if (!isOK) {
    throwException(customException('exam-types.section-titles.invalid', 403, 'Invalid section titles'))
  }
}
