import * as R from 'ramda'

import { applySpecOrEvolve } from '../apply-spec-or-evolve'

describe('apply-spec-or-evolve', () => {
  it('apply spec to an object if prop does not exist', () => {
    const input = null

    const expected = {
      foo: 'bar',
    }

    const result = applySpecOrEvolve({
      foo: R.always('bar'),
    })(input)

    expect(result).toEqual(expected)
  })

  it('evolves an existing prop', () => {
    const input = {
      foo: 41,
    }

    const expected = {
      foo: 42,
    }

    const result = applySpecOrEvolve({
      foo: R.inc,
    })(input)

    expect(result).toEqual(expected)
  })
})
