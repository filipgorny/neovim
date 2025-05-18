import * as R from 'ramda'

export const codeFromFlashcard = R.unless(
  R.isNil,
  R.pipe(
    String,
    R.split(''),
    R.prepend(R.repeat(0, 5)),
    R.append(0),
    R.flatten,
    R.slice(-6, -1),
    R.join('')
  )
)
