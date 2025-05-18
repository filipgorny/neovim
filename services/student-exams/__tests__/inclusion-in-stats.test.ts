import { shouldIncludeStudentExamInStats } from '../inclusion-in-stats'

const baseStudentExam = {
  completions_done: 0,
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
            { order: 1, id: 'q9', original_exam_question_id: 1, answer: 'A' },
            { order: 2, id: 'q10', original_exam_question_id: 1, answer: null },
          ],
        },
        {
          id: 'passage-2-1',
          order: 1,
          is_false_passage: true,
          questions: [
            { order: 1, id: 'q6', original_exam_question_id: 1, answer: null },
            { order: 2, id: 'q7', original_exam_question_id: 1, answer: 'B' },
            { order: 3, id: 'q8', original_exam_question_id: 1, answer: null },
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
            { order: 2, id: 'q2', original_exam_question_id: 1, answer: 'A' },
            { order: 3, id: 'q3', original_exam_question_id: 1, answer: 'B' },
            { order: 1, id: 'q1', original_exam_question_id: 1, answer: 'C' },
          ],
        },
        {
          id: 'passage-1-2',
          order: 2,
          is_false_passage: true,
          questions: [
            { order: 1, id: 'q4', original_exam_question_id: 1, answer: null },
            { order: 2, id: 'q5', original_exam_question_id: 1, answer: null },
          ],
        },
      ],
    },
  ],
  exam_seconds_left: [
    {
      section_id: 'section-1',
      seconds_left: 1195,
    },
    {
      section_id: 'section-2',
      seconds_left: 1200,
    },
  ],
}

describe('inclusion-in-stats', () => {
  it('should return true for first completion being equal to 0', () => {
    const studentExam = {
      ...baseStudentExam,
      completions_done: 0,
    }

    const resultDetailed = shouldIncludeStudentExamInStats(studentExam, false)
    const resultBoolean = shouldIncludeStudentExamInStats(studentExam)

    expect(resultDetailed.is_first_completion).toBe(true)
    expect(resultBoolean).toBe(false)
  })

  it('should return false for first completion being greater than 0', () => {
    const studentExam = {
      ...baseStudentExam,
      completions_done: 1,
    }

    const resultDetailed = shouldIncludeStudentExamInStats(studentExam, false)
    const resultBoolean = shouldIncludeStudentExamInStats(studentExam)

    expect(resultDetailed.is_first_completion).toBe(false)
    expect(resultBoolean).toBe(false)
  })

  it('should return false for answering less than 75% of the questions', () => {
    const studentExam = {
      ...baseStudentExam,
    }

    const resultDetailed = shouldIncludeStudentExamInStats(studentExam, false)
    const resultBoolean = shouldIncludeStudentExamInStats(studentExam)

    expect(resultDetailed.is_enough_questions_answered).toBe(false)
    expect(resultBoolean).toBe(false)
  })

  it('should return true for answering more than 75% of the questions', () => {
    const studentExam = {
      completions_done: 0,
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
                { order: 1, id: 'q9', original_exam_question_id: 1, answer: 'A' },
                { order: 2, id: 'q10', original_exam_question_id: 1, answer: null },
              ],
            },
            {
              id: 'passage-2-1',
              order: 1,
              is_false_passage: true,
              questions: [
                { order: 1, id: 'q6', original_exam_question_id: 1, answer: 'D' },
                { order: 2, id: 'q7', original_exam_question_id: 1, answer: 'B' },
                { order: 3, id: 'q8', original_exam_question_id: 1, answer: 'C' },
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
                { order: 2, id: 'q2', original_exam_question_id: 1, answer: 'A' },
                { order: 3, id: 'q3', original_exam_question_id: 1, answer: 'B' },
                { order: 1, id: 'q1', original_exam_question_id: 1, answer: 'C' },
              ],
            },
            {
              id: 'passage-1-2',
              order: 2,
              is_false_passage: true,
              questions: [
                { order: 1, id: 'q4', original_exam_question_id: 1, answer: 'B' },
                { order: 2, id: 'q5', original_exam_question_id: 1, answer: null },
              ],
            },
          ],
        },
      ],
      exam_seconds_left: [
        {
          section_id: 'section-1',
          seconds_left: 1195,
        },
        {
          section_id: 'section-2',
          seconds_left: 1200,
        },
      ],
    }

    const resultDetailed = shouldIncludeStudentExamInStats(studentExam, false)
    const resultBoolean = shouldIncludeStudentExamInStats(studentExam)

    expect(resultDetailed.is_enough_questions_answered).toBe(true)
    expect(resultBoolean).toBe(false)
  })

  it('should return false for answering correctly less than 15% of the questions', () => {
    const studentExam = {
      completions_done: 0,
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
                { order: 1, id: 'q9', original_exam_question_id: 1, answer: 'A', correct_answer: 'B' },
                { order: 2, id: 'q10', original_exam_question_id: 1, answer: null, correct_answer: 'B' },
              ],
            },
            {
              id: 'passage-2-1',
              order: 1,
              is_false_passage: true,
              questions: [
                { order: 1, id: 'q6', original_exam_question_id: 1, answer: 'D', correct_answer: 'B' },
                { order: 2, id: 'q7', original_exam_question_id: 1, answer: 'B', correct_answer: 'B' },
                { order: 3, id: 'q8', original_exam_question_id: 1, answer: 'C', correct_answer: 'B' },
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
                { order: 2, id: 'q2', original_exam_question_id: 1, answer: 'A', correct_answer: 'B' },
                { order: 3, id: 'q3', original_exam_question_id: 1, answer: 'A', correct_answer: 'B' },
                { order: 1, id: 'q1', original_exam_question_id: 1, answer: 'C', correct_answer: 'B' },
              ],
            },
            {
              id: 'passage-1-2',
              order: 2,
              is_false_passage: true,
              questions: [
                { order: 1, id: 'q4', original_exam_question_id: 1, answer: 'A', correct_answer: 'B' },
                { order: 2, id: 'q5', original_exam_question_id: 1, answer: null, correct_answer: 'B' },
              ],
            },
          ],
        },
      ],
      exam_seconds_left: [
        {
          section_id: 'section-1',
          seconds_left: 1195,
        },
        {
          section_id: 'section-2',
          seconds_left: 1200,
        },
      ],
    }

    const resultDetailed = shouldIncludeStudentExamInStats(studentExam, false)
    const resultBoolean = shouldIncludeStudentExamInStats(studentExam)

    expect(resultDetailed.is_enough_questions_answered_correctly).toBe(false)
    expect(resultBoolean).toBe(false)
  })

  it('should return true for answering correctly more than 15% of the questions', () => {
    const studentExam = {
      completions_done: 0,
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
                { order: 1, id: 'q9', original_exam_question_id: 1, answer: 'B', correct_answer: 'B' },
                { order: 2, id: 'q10', original_exam_question_id: 1, answer: null, correct_answer: 'B' },
              ],
            },
            {
              id: 'passage-2-1',
              order: 1,
              is_false_passage: true,
              questions: [
                { order: 1, id: 'q6', original_exam_question_id: 1, answer: 'D', correct_answer: 'B' },
                { order: 2, id: 'q7', original_exam_question_id: 1, answer: 'B', correct_answer: 'B' },
                { order: 3, id: 'q8', original_exam_question_id: 1, answer: 'B', correct_answer: 'B' },
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
                { order: 2, id: 'q2', original_exam_question_id: 1, answer: 'A', correct_answer: 'B' },
                { order: 3, id: 'q3', original_exam_question_id: 1, answer: 'B', correct_answer: 'B' },
                { order: 1, id: 'q1', original_exam_question_id: 1, answer: 'C', correct_answer: 'B' },
              ],
            },
            {
              id: 'passage-1-2',
              order: 2,
              is_false_passage: true,
              questions: [
                { order: 1, id: 'q4', original_exam_question_id: 1, answer: 'A', correct_answer: 'B' },
                { order: 2, id: 'q5', original_exam_question_id: 1, answer: null, correct_answer: 'B' },
              ],
            },
          ],
        },
      ],
      exam_seconds_left: [
        {
          section_id: 'section-1',
          seconds_left: 1195,
        },
        {
          section_id: 'section-2',
          seconds_left: 1200,
        },
      ],
    }

    const resultDetailed = shouldIncludeStudentExamInStats(studentExam, false)
    const resultBoolean = shouldIncludeStudentExamInStats(studentExam)

    expect(resultDetailed.is_enough_questions_answered_correctly).toBe(true)
    expect(resultBoolean).toBe(true)
  })

  it('should return false for spending less than 40% of time in sections', () => {
    const studentExam = {
      completions_done: 0,
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
                { order: 1, id: 'q9', original_exam_question_id: 1, answer: 'B', correct_answer: 'B' },
                { order: 2, id: 'q10', original_exam_question_id: 1, answer: null, correct_answer: 'B' },
              ],
            },
            {
              id: 'passage-2-1',
              order: 1,
              is_false_passage: true,
              questions: [
                { order: 1, id: 'q6', original_exam_question_id: 1, answer: 'D', correct_answer: 'B' },
                { order: 2, id: 'q7', original_exam_question_id: 1, answer: 'B', correct_answer: 'B' },
                { order: 3, id: 'q8', original_exam_question_id: 1, answer: 'B', correct_answer: 'B' },
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
                { order: 2, id: 'q2', original_exam_question_id: 1, answer: 'A', correct_answer: 'B' },
                { order: 3, id: 'q3', original_exam_question_id: 1, answer: 'B', correct_answer: 'B' },
                { order: 1, id: 'q1', original_exam_question_id: 1, answer: 'C', correct_answer: 'B' },
              ],
            },
            {
              id: 'passage-1-2',
              order: 2,
              is_false_passage: true,
              questions: [
                { order: 1, id: 'q4', original_exam_question_id: 1, answer: 'A', correct_answer: 'B' },
                { order: 2, id: 'q5', original_exam_question_id: 1, answer: null, correct_answer: 'B' },
              ],
            },
          ],
        },
      ],
      exam_seconds_left: [
        {
          section_id: 'section-1',
          seconds_left: 4195,
        },
        {
          section_id: 'section-2',
          seconds_left: 1200,
        },
      ],
    }

    const resultDetailed = shouldIncludeStudentExamInStats(studentExam, false)
    const resultBoolean = shouldIncludeStudentExamInStats(studentExam)

    expect(resultDetailed.is_enough_time_spent_in_sections).toBe(false)
    expect(resultBoolean).toBe(false)
  })

  it('should return true for spending more than 40% of time in sections', () => {
    const studentExam = {
      completions_done: 0,
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
                { order: 1, id: 'q9', original_exam_question_id: 1, answer: 'B', correct_answer: 'B' },
                { order: 2, id: 'q10', original_exam_question_id: 1, answer: null, correct_answer: 'B' },
              ],
            },
            {
              id: 'passage-2-1',
              order: 1,
              is_false_passage: true,
              questions: [
                { order: 1, id: 'q6', original_exam_question_id: 1, answer: 'D', correct_answer: 'B' },
                { order: 2, id: 'q7', original_exam_question_id: 1, answer: 'B', correct_answer: 'B' },
                { order: 3, id: 'q8', original_exam_question_id: 1, answer: 'B', correct_answer: 'B' },
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
                { order: 2, id: 'q2', original_exam_question_id: 1, answer: 'A', correct_answer: 'B' },
                { order: 3, id: 'q3', original_exam_question_id: 1, answer: 'B', correct_answer: 'B' },
                { order: 1, id: 'q1', original_exam_question_id: 1, answer: 'C', correct_answer: 'B' },
              ],
            },
            {
              id: 'passage-1-2',
              order: 2,
              is_false_passage: true,
              questions: [
                { order: 1, id: 'q4', original_exam_question_id: 1, answer: 'A', correct_answer: 'B' },
                { order: 2, id: 'q5', original_exam_question_id: 1, answer: null, correct_answer: 'B' },
              ],
            },
          ],
        },
      ],
      exam_seconds_left: [
        {
          section_id: 'section-1',
          seconds_left: 1195,
        },
        {
          section_id: 'section-2',
          seconds_left: 1200,
        },
      ],
    }

    const resultDetailed = shouldIncludeStudentExamInStats(studentExam, false)
    const resultBoolean = shouldIncludeStudentExamInStats(studentExam)

    expect(resultDetailed.is_enough_time_spent_in_sections).toBe(true)
    expect(resultBoolean).toBe(true)
  })
})
