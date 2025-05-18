import R from 'ramda'
import { stopWords } from '../../src/modules/book-contents/stop-words'
import { stripHtml } from '../../utils/string/strip-html'

const isStopWord = (value: string): boolean => stopWords.includes(value.toLocaleLowerCase())

const isNumber = (value: string): boolean => !isNaN(Number(value))

const isUrl = (value: string): boolean => {
  try {
    const url = new URL(value)

    return true
  } catch (e) {
    return false
  }
}

const isUnwanted = (value: string): boolean => isStopWord(value) || isNumber(value) || isUrl(value)

const removeHtmlMarkup = (text: string): string => (
  stripHtml(text)
)

export default R.pipe(
  removeHtmlMarkup,
  R.split(' '),
  R.reject(isUnwanted),
  R.join(' ')
)
