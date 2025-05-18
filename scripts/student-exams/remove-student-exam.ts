import { removeStudentExam } from '../../src/modules/student-exams/student-exam-service'

// eslint-disable-next-line @typescript-eslint/no-floating-promises
(
  async (): Promise<void> => {
    const examId = process.argv[2]

    await removeStudentExam(examId)

    console.log(`Removed student exam (${examId}).`)

    process.exit(0)
  }
)()
