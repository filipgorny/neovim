const R = require('ramda')

const SPECIAL_CHAR_AT_START_PATTERN = /^[^a-zA-Z0-9]/
const OMIT_OPTIONAL_SPECIAL_CHAR_AT_START_PATTERN = /^[^a-zA-Z0-9]?(.+)/
const COMPARISON_SIGN_AT_START_PATTERN = /^[<>]/
const OR_WHERE_SIGN_AT_START_PATTERN = /^\?/
const RANGE_SIGN_AT_START_PATTERN = /^\|/
const CUSTOM_FILTER_AT_START_PATTERN = /^__/
const BOOL_STRING_PATTERN = /true|false/

const parseName = R.pipe(
  R.head,
  R.objOf('name')
)

const arrayTypeCondition = [
  R.is(Array),
  R.always('whereIn'),
]

const comparisonTypeCondition = [
  R.pipe(
    R.match(COMPARISON_SIGN_AT_START_PATTERN),
    R.isEmpty,
    R.not
  ),
  R.always('comparison'),
]

const orWhereTypeCondition = [
  R.pipe(
    R.match(OR_WHERE_SIGN_AT_START_PATTERN),
    R.isEmpty,
    R.not
  ),
  R.always('orWhere'),
]

const rangeTypeCondition = [
  R.pipe(
    R.match(RANGE_SIGN_AT_START_PATTERN),
    R.isEmpty,
    R.not
  ),
  R.always('range'),
]

const nullTypeCondition = [
  R.pipe(
    R.equals('isNull')
  ),
  R.always('isNull'),
]

const notNullTypeCondition = [
  R.pipe(
    R.equals('isNotNull')
  ),
  R.always('isNotNull'),
]

const customTypeCondition = filterName => [
  () => (
    R.pipe(
      R.match(CUSTOM_FILTER_AT_START_PATTERN),
      R.isEmpty,
      R.not
    )(filterName)
  ),
  R.always(filterName),
]

const defaultTypeCondition = [
  R.T,
  R.always('default'),
]

const parseType = definition => (
  R.pipe(
    R.last,
    R.cond([
      customTypeCondition(definition[0]),
      arrayTypeCondition,
      comparisonTypeCondition,
      rangeTypeCondition,
      nullTypeCondition,
      notNullTypeCondition,
      orWhereTypeCondition,
      defaultTypeCondition,
    ]),
    R.objOf('type')
  )(definition)
)

const parseModifier = R.pipe(
  R.last,
  R.ifElse(
    R.is(String),
    R.pipe(
      R.match(SPECIAL_CHAR_AT_START_PATTERN),
      R.ifElse(
        R.isEmpty,
        R.always(null),
        R.head
      )
    ),
    R.always(null)
  ),
  R.objOf('modifier')
)

const arrayValueCondition = [
  R.is(Array),
  R.identity,
]

const booleanValueCondition = [
  R.pipe(
    R.match(BOOL_STRING_PATTERN),
    R.isEmpty,
    R.not
  ),
  R.ifElse(
    R.equals('true'),
    R.T,
    R.F
  ),
]

const rangeValueCondition = [
  R.pipe(
    R.match(RANGE_SIGN_AT_START_PATTERN),
    R.isEmpty,
    R.not
  ),
  R.pipe(
    R.tail,
    R.split(','),
    R.map(parseInt)
  ),
]

const defaultValueCondition = [
  R.T,
  R.pipe(
    R.match(OMIT_OPTIONAL_SPECIAL_CHAR_AT_START_PATTERN),
    R.last
  ),
]

const parseValue = R.pipe(
  R.last,
  R.cond([
    arrayValueCondition,
    booleanValueCondition,
    rangeValueCondition,
    defaultValueCondition,
  ]),
  R.objOf('value')
)

// This is needed because of the bug in qs package (used by body-parser)
// https://github.com/ljharb/qs/issues/370
const convertObjectToArray = R.pipe(
  R.over(
    R.lensIndex(1),
    R.when(
      R.is(Object),
      R.values
    )
  )
)

const parseFilters = allowedFilters => R.pipe(
  R.pick(allowedFilters),
  R.toPairs,
  R.map(
    R.pipe(
      convertObjectToArray,
      R.juxt([
        parseName,
        parseType,
        parseModifier,
        parseValue,
      ]),
      R.mergeAll
    )
  )
)

module.exports = parseFilters
