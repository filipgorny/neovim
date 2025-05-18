import { validateTimeLeft } from '../validate-time-left'

const exam_seconds_left = [
  {
    section_id: 'section-1',
    seconds_left: 11
  },
  {
    section_id: 'section-2',
    seconds_left: 35
  }
]

describe('validate-time-left', () => {
  it('throws exception if at least one payload item has seconds_left greater than what is in the exam', () => {
    const payload = {
      exam_seconds_left: [
        {
          section_id: 'section-1',
          seconds_left: 12
        },
        {
          section_id: 'section-2',
          seconds_left: 35
        }
      ]
    }

    // @ts-ignore
    expect(() => validateTimeLeft(exam_seconds_left)(payload)).toThrow()
  })

  it('does nothing if payload is valid', () => {
    const payload = {
      exam_seconds_left: [
        {
          section_id: 'section-1',
          seconds_left: 10
        },
        {
          section_id: 'section-2',
          seconds_left: 35
        }
      ]
    }

    // @ts-ignore
    expect(() => validateTimeLeft(exam_seconds_left)(payload)).not.toThrow()
  })
})
