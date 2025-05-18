import { calculateSectionPTS } from '../calculate-section-pts'

const data = [
  [
    {
      scaled_score: 129,
      title: 'CHEMISTRY PHYSICS',
    },
    {
      scaled_score: 125,
      title: 'CARS',
    },
    {
      scaled_score: 130,
      title: 'Biology',
    },
    {
      scaled_score: 130,
      title: 'Psych Soc',
    },
  ],
  [
    {
      scaled_score: 131,
      title: 'CHEMISTRY PHYSICS',
    },
    {
      scaled_score: 129,
      title: 'CARS',
    },
    {
      scaled_score: 135,
      title: 'Biology',
    },
    {
      scaled_score: 119,
      title: 'Psych Soc',
    },
  ],
]

describe('calculate-section-pts', () => {
  it('calculates PTS for section CARS', () => {
    const expected = 127
    const SECTION_CARS = 1

    // @ts-ignore
    const result = calculateSectionPTS(SECTION_CARS, 132)(data)

    expect(result).toEqual(expected)
  })

  it('calculates PTS for section Biology', () => {
    const expected = 133
    const SECTION_BIOLOGY = 2

    // @ts-ignore
    const result = calculateSectionPTS(SECTION_BIOLOGY, 132)(data)

    expect(result).toEqual(expected)
  })
})
