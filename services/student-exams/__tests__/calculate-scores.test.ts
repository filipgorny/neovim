import { calculateScores } from '../calculate-scores'

jest.mock('../../../src/modules/percentile-ranks/percentile-rank-repository')
jest.mock('../../../src/modules/exam-type-scaled-score-templates/exam-type-scaled-score-template-repository')
jest.mock('../../../src/modules/exam-types/exam-type-repository.ts')

const exam = {
  exam_length: {
    sections: [
      {
        section: 'CHEMISTRY PHYSICS',
        amount: 59,
        sectionMinutes: 95,
        timeMultiplier: 96.605,
      },
      {
        section: 'CARS',
        amount: 53,
        sectionMinutes: 90,
        timeMultiplier: 101.887,
      },
      {
        section: 'SECTION 3',
        amount: 59,
        sectionMinutes: 95,
        timeMultiplier: 96.605,
      },
      {
        section: 'SECTION 4',
        amount: 59,
        sectionMinutes: 95,
        timeMultiplier: 96.605,
      },
    ],
  },
  sections: [
    {
      id: 'section-2',
      title: 'CARS',
      order: 2,
      passages: [
        {
          order: 2,
          questions: [
            {
              order: 1,
              id: 'q9',
              answer: 'A',
              correct_answer: 'B',
            },
            {
              order: 2,
              id: 'q10',
              answer: 'C',
              correct_answer: 'A',
            },
          ],
        },
        {
          order: 1,
          questions: [
            {
              order: 1,
              id: 'q6',
              answer: 'B',
              correct_answer: 'C',
            },
            {
              order: 2,
              id: 'q7',
              answer: 'D',
              correct_answer: 'A',
            },
            {
              order: 3,
              id: 'q8',
              answer: 'A',
              correct_answer: 'B',
            },
          ],
        },
      ],
      scaledScore: {
        scores: [
          {
            correct_answer_amount: 3,
            scaled_score: 121,
            percentile_rank: '0.51',
          },
          {
            correct_answer_amount: 5,
            scaled_score: 131,
            percentile_rank: '0.71',
          },
        ],
      },
    },
    {
      id: 'section-1',
      title: 'CHEMISTRY PHYSICS',
      order: 1,
      passages: [
        {
          questions: [
            {
              order: 2,
              id: 'q2',
              answer: 'A',
              correct_answer: 'A',
            },
            {
              order: 3,
              id: 'q3',
              answer: 'A',
              correct_answer: 'B',
            },
            {
              order: 1,
              id: 'q1',
              answer: 'C',
              correct_answer: 'A',
            },
          ],
        },
        {
          questions: [
            {
              order: 1,
              id: 'q4',
              answer: 'D',
              correct_answer: 'D',
            },
            {
              order: 2,
              id: 'q5',
              answer: 'A',
              correct_answer: 'C',
            },
          ],
        },
      ],
      scaledScore: {
        scores: [
          {
            correct_answer_amount: 5,
            scaled_score: 121,
            percentile_rank: '0.51',
          },
          {
            correct_answer_amount: 2,
            scaled_score: 111,
            percentile_rank: '0.21',
          },
        ],
      },
    },
    {
      id: 'section-4',
      title: 'SECTION 4',
      order: 4,
      passages: [
        {
          order: 2,
          questions: [
            {
              order: 1,
              id: 'q44',
              answer: 'A',
              correct_answer: 'A',
            },
            {
              order: 2,
              id: 'q45',
              answer: 'C',
              correct_answer: 'A',
            },
          ],
        },
        {
          order: 1,
          questions: [
            {
              order: 1,
              id: 'q41',
              answer: 'B',
              correct_answer: 'B',
            },
            {
              order: 2,
              id: 'q42',
              answer: 'D',
              correct_answer: 'D',
            },
            {
              order: 3,
              id: 'q43',
              answer: 'A',
              correct_answer: 'B',
            },
          ],
        },
      ],
      scaledScore: {
        scores: [
          {
            correct_answer_amount: 3,
            scaled_score: 121,
            percentile_rank: '0.51',
          },
          {
            correct_answer_amount: 5,
            scaled_score: 131,
            percentile_rank: '0.71',
          },
        ],
      },
    },
    {
      id: 'section-3',
      title: 'SECTION 3',
      order: 3,
      passages: [
        {
          order: 2,
          questions: [
            {
              order: 1,
              id: 'q34',
              answer: 'A',
              correct_answer: 'A',
            },
            {
              order: 2,
              id: 'q35',
              answer: 'C',
              correct_answer: 'A',
            },
          ],
        },
        {
          order: 1,
          questions: [
            {
              order: 1,
              id: 'q31',
              answer: 'B',
              correct_answer: 'B',
            },
            {
              order: 2,
              id: 'q32',
              answer: 'D',
              correct_answer: 'D',
            },
            {
              order: 3,
              id: 'q33',
              answer: 'A',
              correct_answer: 'B',
            },
          ],
        },
      ],
      scaledScore: {
        scores: [
          {
            correct_answer_amount: 3,
            scaled_score: 121,
            percentile_rank: '0.51',
          },
          {
            correct_answer_amount: 5,
            scaled_score: 131,
            percentile_rank: '0.71',
          },
        ],
      },
    },
  ],
}

describe('calculate-scores', () => {
  /**
   * After making some changes in calculateScores, the function is now relying on the database
   * and is currently not testable. This test is skipped until we find a way to mock the database.
   */
  it.skip('calculates scores of a finished exam', async () => {
    const result = await calculateScores(exam, true)

    const expected = {
      sections: [
        {
          id: 'section-1',
          title: 'CHEMISTRY PHYSICS',
          order: 1,
          percentage_correct: 40,
          total_amount: 5,
          amount_correct: 2,
          scaled_score: 122,
          percentile_rank: '24.07',
        },
        {
          id: 'section-2',
          title: 'CARS',
          order: 2,
          percentage_correct: 0,
          total_amount: 5,
          amount_correct: 0,
          scaled_score: 122,
          percentile_rank: '24.07',
        },
        {
          id: 'section-3',
          title: 'SECTION 3',
          order: 3,
          percentage_correct: 60,
          total_amount: 5,
          amount_correct: 3,
          scaled_score: 122,
          percentile_rank: '24.07',
        },
        {
          id: 'section-4',
          title: 'SECTION 4',
          order: 4,
          percentage_correct: 60,
          total_amount: 5,
          amount_correct: 3,
          scaled_score: 122,
          percentile_rank: '24.07',
        },
      ],
      exam: {
        scaled_score: 488,
        percentile_rank: '24.07',
        amount_correct: 8,
      },
    }

    expect(result).toEqual(expected)
  })
})
