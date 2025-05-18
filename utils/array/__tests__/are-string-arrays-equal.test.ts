import { areStringArraysEqual } from '../are-string-arrays-equal'

describe('are-string-arrays-equal', () => {
  it('shuffled arrays should be equal; the function is case insensitive', () => {
    const a = ['A', 'D', 'b']
    const b = ['b', 'D', 'a']

    expect(areStringArraysEqual(a, b)).toEqual(true)
  })

  it('returns false on different arrays I', () => {
    const a = ['A', 'D', 'b']
    const b = ['b', 'a']

    expect(areStringArraysEqual(a, b)).toEqual(false)
  })

  it('returns false on different arrays II', () => {
    const a = ['A', 'D']
    const b = ['b', 'a', 'D']

    expect(areStringArraysEqual(a, b)).toEqual(false)
  })
})
