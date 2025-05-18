// eslint-disable-next-line @typescript-eslint/no-var-requires
import { calculatePassageReadingSpeedForExams } from '../../services/student-exam-passages/calculate-for-exams'

// eslint-disable-next-line @typescript-eslint/no-floating-promises
(
  async () => {
    console.log('Calculating passage reading speed for completed exams')

    await calculatePassageReadingSpeedForExams()

    console.log('Done.')

    return Promise.resolve()
  }
)()
