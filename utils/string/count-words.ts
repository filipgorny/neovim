import * as R from 'ramda'
import { isString } from '../general/basic-type-check'
import { stripHtml } from './strip-html'

const stripNewLines = content => (
  isString(content) ? content.replace(/[\n\r]+/gi, ' ') : Number(content).toString(10)
)

const removeEmptyItems = R.filter(
  // @ts-ignore
  R.identity
)

export const countWords = R.pipe(
  stripHtml,
  stripNewLines,
  R.trim,
  R.split(' '),
  R.map(
    R.trim
  ),
  removeEmptyItems,
  R.length
)
