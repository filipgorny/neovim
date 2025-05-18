import { calculateReadingSpeed } from '../calculate-reading-speed'

describe('calculate-reading-speed', () => {
  it('calculates reading speed for a passage', () => {
    const passage = {
      reading: 80,
      originalPassage: {
        word_count: 500,
      },
    }

    const expected = { reading_speed: 375 }

    // @ts-ignore
    expect(calculateReadingSpeed(passage)).toEqual(expected)
  })

  it('returns 0 if reading time is 0', () => {
    const passage = {
      reading: 0,
      originalPassage: {
        word_count: 500,
      },
    }

    const expected = { reading_speed: 0 }

    // @ts-ignore
    expect(calculateReadingSpeed(passage)).toEqual(expected)
  })
})
