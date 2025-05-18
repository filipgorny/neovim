import { determineQWT } from '../determine-qwt'

describe('determine-qwt', () => {
  it('returns average if workingTimeTemp is 0', () => {
    const question = {
      workingTimeTemp: 0,
      passageReading: 6,
    }
    const avg = 5
    const expected = 5

    expect(determineQWT(question, avg)()).toEqual(expected)
  })

  it('returns average if workingTimeTemp is greater than 0 but PRT + workingTimeTemp > avg', () => {
    const question = {
      workingTimeTemp: 7,
      passageReading: 2,
    }
    const avg = 8
    const expected = 9

    expect(determineQWT(question, avg)()).toEqual(expected)
  })

  it('returns PRT + workingTimeTemp if workingTimeTemp is greater than 0 but PRT + workingTimeTemp < avg', () => {
    const question = {
      workingTimeTemp: 7,
      passageReading: 2,
    }
    const avg = 10
    const expected = 9

    expect(determineQWT(question, avg)()).toEqual(expected)
  })
})
