import { calculateClassDuration } from '../calculate-class-duration'

describe('calculate-class-duration', () => {
  it('calculates duration of a class day', () => {
    const classDay = {
      class_time: '09:00',
      class_time_end: '11:00',
      book_chapter_id: '',
      exam_id: '',
      class_date: '2024-07-21',
      class_topic: '',
      class_topic_number: '',
      end_date_id: '',
      meeting_url: '',
      id: 'abc',
    }

    const duration = calculateClassDuration(classDay)

    // Duration is returned in minutes
    expect(duration).toEqual(120)
  })
})
