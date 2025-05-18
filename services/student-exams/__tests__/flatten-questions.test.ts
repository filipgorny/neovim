import { flattenQuestions } from '../flatten-questions'

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
    ],
  },
  sections: [
    {
      id: 'section-2',
      title: 'CARS',
      full_title: 'CARS full title',
      order: 2,
      passages: [
        {
          id: 'passage-2-2',
          order: 2,
          is_false_passage: false,
          questions: [
            { order: 1, id: 'q9', original_exam_question_id: 1 },
            { order: 2, id: 'q10', original_exam_question_id: 1 },
          ],
        },
        {
          id: 'passage-2-1',
          order: 1,
          is_false_passage: true,
          questions: [
            { order: 1, id: 'q6', original_exam_question_id: 1 },
            { order: 2, id: 'q7', original_exam_question_id: 1 },
            { order: 3, id: 'q8', original_exam_question_id: 1 },
          ],
        },
      ],
    },
    {
      id: 'section-1',
      title: 'CHEMISTRY PHYSICS',
      full_title: 'CHEMISTRY PHYSICS full title',
      order: 1,
      passages: [
        {
          id: 'passage-1-1',
          order: 1,
          is_false_passage: false,
          questions: [
            { order: 2, id: 'q2', original_exam_question_id: 1 },
            { order: 3, id: 'q3', original_exam_question_id: 1 },
            { order: 1, id: 'q1', original_exam_question_id: 1 },
          ],
        },
        {
          id: 'passage-1-2',
          order: 2,
          is_false_passage: true,
          questions: [
            { order: 1, id: 'q4', original_exam_question_id: 1 },
            { order: 2, id: 'q5', original_exam_question_id: 1 },
          ],
        },
      ],
    },
  ],
}

const unusedButRequired = {
  answer: undefined,
  correct_answer: null,
  is_flagged: undefined,
  original_exam_question_id: 1,
  passage: null,
  question_status: undefined,
}

const expected = [
  {
    id: 'section-1',
    order: 1,
    questions: [
      {
        id: 'q1',
        order: 1,
        original_order: 1,
        ...unusedButRequired,
      },
      {
        id: 'q2',
        order: 2,
        original_order: 2,
        ...unusedButRequired,
      },
      {
        id: 'q3',
        order: 3,
        original_order: 3,
        ...unusedButRequired,
      },
      {
        id: 'q4',
        order: 4,
        original_order: 1,
        ...unusedButRequired,
      },
      {
        id: 'q5',
        order: 5,
        original_order: 2,
        ...unusedButRequired,
      },
    ],
    passages: [
      {
        id: 'passage-1-1',
        order: 1,
        is_false_passage: false,
      },
      {
        id: 'passage-1-2',
        order: 2,
        is_false_passage: true,
      },
    ],
    sectionLength: {
      amount: 59,
      section: 'CHEMISTRY PHYSICS',
      sectionMinutes: 95,
      timeMultiplier: 96.605,
    },
    section_status: undefined,
    title: 'CHEMISTRY PHYSICS',
    full_title: 'CHEMISTRY PHYSICS full title',
  },
  {
    id: 'section-2',
    order: 2,
    questions: [
      {
        id: 'q6',
        order: 1,
        original_order: 1,
        ...unusedButRequired,
      },
      {
        id: 'q7',
        order: 2,
        original_order: 2,
        ...unusedButRequired,
      },
      {
        id: 'q8',
        order: 3,
        original_order: 3,
        ...unusedButRequired,
      },
      {
        id: 'q9',
        order: 4,
        original_order: 1,
        ...unusedButRequired,
      },
      {
        id: 'q10',
        order: 5,
        original_order: 2,
        ...unusedButRequired,
      },
    ],
    passages: [
      {
        id: 'passage-2-1',
        order: 1,
        is_false_passage: true,
      },
      {
        id: 'passage-2-2',
        order: 2,
        is_false_passage: false,
      },
    ],
    sectionLength: {
      amount: 53,
      section: 'CARS',
      sectionMinutes: 90,
      timeMultiplier: 101.887,
    },
    section_status: undefined,
    title: 'CARS',
    full_title: 'CARS full title',
  },
]

describe('flatten-questions', () => {
  it('flattens exam questions to omit passages', () => {
    const result = flattenQuestions(exam)

    expect(result).toEqual(expected)
  })
})
