import * as R from 'ramda'
import { studentWasActive } from '../oil-service-helpers'

const mockDate = '2022-05-05'
const mockCourse = { student_id: 'abc' }

describe('oil-service', () => {
  it('fetches salty bucks logs using given function and returns true on non-empty set; false otherwise', async () => {
    const nonEmptyList = [{ foo: 'bar' }]

    const findLogsFnNonEmpty = () => ({ data: nonEmptyList })
    const findLogsFnEmpty = () => ({ data: [] })

    const resultNonEmpty = await studentWasActive(findLogsFnNonEmpty)(mockCourse, mockDate)
    const resultEmpty = await studentWasActive(findLogsFnEmpty)(mockCourse, mockDate)

    expect(resultNonEmpty).toEqual(true)
    expect(resultEmpty).toEqual(false)
  })

  it('fetches salty bucks logs using given function and returns result of applying a predicate the results', async () => {
    const atLeastThree = R.pipe(
      R.length,
      R.lte(3)
    )

    const shortList = [{ foo: 'bar' }, { foo: 'qux' }]
    const longList = [{ foo: 'bar' }, { foo: 'qux' }, { foo: 'ppp' }]

    const findLogsFnShortList = () => ({ data: shortList })
    const findLogsFnLongList = () => ({ data: longList })

    const resultShortList = await studentWasActive(findLogsFnShortList, atLeastThree)(mockCourse, mockDate)
    const resultLongList = await studentWasActive(findLogsFnLongList, atLeastThree)(mockCourse, mockDate)

    expect(resultShortList).toEqual(false)
    expect(resultLongList).toEqual(true)
  })
})
