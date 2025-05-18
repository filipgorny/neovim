import * as R from 'ramda'

const START_CUT_SEPARATOR = '<__START_CUT__>'
const END_CUT_SEPARATOR = '<__END_CUT__>'

const takeLastN = n => input => (
  R.pipe(
    R.split(' '),
    arr => R.splitAt(
      R.max(arr.length - n, 0)
    )(arr),
    R.last,
    R.join(' ')
  )(input)
)

const takeFirstN = n => input => (
  R.pipe(
    R.split(' '),
    R.splitAt(n),
    R.head,
    R.join(' ')
  )(input)
)

const shouldAddEllipsis = wordLimit => R.pipe(
  R.split(' '),
  R.propSatisfies(R.lt(wordLimit), 'length')
)

const replacer = (wordLimit, ellipsis) => (match, p1, p2, p3, offset, string) => (
  [
    START_CUT_SEPARATOR,
    (shouldAddEllipsis(wordLimit)(p1) ? ellipsis : ''),
    takeLastN(wordLimit)(p1),
    p2,
    takeFirstN(wordLimit)(p3),
    (shouldAddEllipsis(wordLimit)(p3) ? ellipsis : ''),
    END_CUT_SEPARATOR,
  ].join('')
)

const removeLineBreaks = R.replace(/[\r\n]/gm, '')

const extractText = (phrase, boundaryWordLimit, ellipsis) => R.pipe(
  removeLineBreaks,
  R.replace(
    new RegExp(`(.*)(${phrase})(.*)`, 'ig'),
    replacer(boundaryWordLimit, ellipsis)
  ),
  R.split(END_CUT_SEPARATOR),
  R.head,
  R.split(START_CUT_SEPARATOR),
  R.last
)

export const takeExcerpt = (phrase, boundaryWordLimit = 4, ellipsis = '(...)') => R.ifElse(
  R.anyPass([
    R.isNil,
    R.isEmpty,
  ]),
  R.identity,
  extractText(phrase, boundaryWordLimit, ellipsis)
)
