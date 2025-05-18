// eslint-disable-next-line @typescript-eslint/no-var-requires
const prompts = require('prompts')
import questions from './questions'
import { dropStudentExams } from '../../src/modules/student-exams/student-exam-service'

// eslint-disable-next-line @typescript-eslint/no-floating-promises
(
  async () => {
    const { ids } = await prompts(questions)

    await dropStudentExams(ids)

    console.log('Deleted requested student exams')

    process.exit(0)
  }
)()
