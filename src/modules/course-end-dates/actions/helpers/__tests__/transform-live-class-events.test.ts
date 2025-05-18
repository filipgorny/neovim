import { transformLiveClassEvents } from '../transform-live-class-events'

describe('transform-live-class-events', () => {
  it('transforms live class events so they can be embedded in course end dates to provide additional details', async () => {
    const events = [
      {
        student_exam_ids: 'abc',
        type: 'live_class',
        id: 'foo',
      },
      {
        student_exam_ids: 'def',
        type: 'custom_live_class',
        id: 'bar',
      },
    ]

    const expected = {
      abc: {
        type: 'live_class',
        id: 'foo',
      },
      def: {
        type: 'custom_live_class',
        id: 'bar',
      },
    }

    const result = transformLiveClassEvents(events)

    expect(result).toEqual(expected)
  })
})
