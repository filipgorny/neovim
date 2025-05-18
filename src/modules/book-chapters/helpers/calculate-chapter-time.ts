import { stripHtml } from '@desmart/js-utils'
import * as R from 'ramda'

export const countWordsInChapter = (data, extractFunction = R.pluck('content_html')) => (
  R.pipe(
    R.prop('subchapters'),
    R.pluck('contents'),
    R.flatten,
    extractFunction,
    R.map(stripHtml),
    R.map(R.split(' ')),
    R.flatten,
    R.length
  )(data)
)

export const calculateChapterTime = (data, extractFunction = R.pluck('content_html')) => (
  R.pipe(
    (data) => countWordsInChapter(data, extractFunction),
    R.divide(R.__, 225), // 225 words per minute, value given by Jon
    Math.ceil
  )(data)
)
