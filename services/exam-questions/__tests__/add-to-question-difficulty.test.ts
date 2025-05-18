import addToQuestionDifficulty from '../add-to-question-difficulty'

jest.mock('../../../src/modules/exam-questions/exam-question-repository')

describe('add-to-question-difficulty', () => {
  it('add to question difficulty', async () => {
    const question = {
      answer: null,
      correct_answer: 'A',
      original_exam_question_id: '7d66bea0-bf13-4c32-82d8-c0a55d39a170',
    }

    const result = await addToQuestionDifficulty(question)

    const expected = {
      correct_answers_amount: 2,
      all_answers_amount: 5,
      difficulty_percentage: 60,
      answer_distribution: {
        A: {
          amount: 2,
          percentage: 40,
        },
        B: {
          amount: 1,
          percentage: 20,
        },
        C: {
          amount: 1,
          percentage: 20,
        },
        D: {
          amount: 0,
          percentage: 0,
        },
        'no-answer-given': {
          amount: 1,
          percentage: 20,
        },
      },
    }

    expect(result).toEqual(expected)
  })
})
