import { isString, isNumber } from '../general/basic-type-check'
import XRegExp from 'xregexp'

const strip = content => {
  const strippedTags = content.replace(/(<([^>]+)>)|<>/gi, ' ')
  const stripedPunctation = XRegExp.replace(strippedTags, XRegExp('\\s\\p{Po}', 'g'), '')

  return stripedPunctation
    .replace(/\s{2,}/gi, ' ')
    .trim()
}

export const stripHtml = content => (
  isString(content)
    ? strip(content)
    : isNumber(content) ? Number(content).toString(10) : ''
)
