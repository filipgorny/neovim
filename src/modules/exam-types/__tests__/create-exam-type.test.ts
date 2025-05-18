import { createFullMcatExamType } from './create-full-mcat-exam-type.help'

describe('testing create exam type', () => {
  it.skip('should create a new exam type', async () => {
    const examType = await createFullMcatExamType('CREATE EXAM TYPE 1')

    expect(examType).toHaveProperty('id')
  })
})
