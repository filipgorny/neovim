import * as R from 'ramda'
import { changePathValue } from '../change-path-value'

describe('change-path-value', () => {
  it('changes value of a path by applying the given function', () => {
    const item = {
      metaData: {
        timesBought: 3,
      },
    }

    const expected = {
      metaData: {
        timesBought: 5,
      },
    }

    const result = changePathValue(['metaData', 'timesBought'], R.add(2), item)

    expect(result).toEqual(expected)
  })
})
