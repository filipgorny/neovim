import { safeDivide } from '../safe-divide'

describe('safe-divide', () => {
  it('divides two numbers safely', () => {
    const scenarios = [
      { a: 12, b: 24, expected: 0.5 },
      { a: 0, b: 24, expected: 0 },
      { a: 3, b: 24, expected: 0.125 },
      { a: 0, b: 0, expected: 0 },
      { a: 24, b: 0, expected: 0 }
    ]

    scenarios.map(
      scenario => expect(safeDivide(scenario.a, scenario.b)).toEqual(scenario.expected)
    )
  })
})
