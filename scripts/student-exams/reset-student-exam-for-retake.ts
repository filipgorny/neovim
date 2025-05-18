import { removeStudentExam, resetExamForRetake } from '../../src/modules/student-exams/student-exam-service'

// eslint-disable-next-line @typescript-eslint/no-floating-promises
(
  async (): Promise<void> => {
    const examId = process.argv[2]

    await resetExamForRetake(examId)

    console.log(`Reset student exam (${examId}) for retake.`)

    process.exit(0)
  }
)()
