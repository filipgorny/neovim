import { randomPin } from '../random-pin'

describe('random-pin', () => {
  it('generates a random 4-digit pin code (default length)', () => {
    const result = randomPin()

    expect(result).toMatch(/\d{4}/)
  })

  it('generates a random n-digit pin code', () => {
    const result = randomPin(6)

    expect(result).toMatch(/\d{6}/)
  })
})
