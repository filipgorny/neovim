import { stitchArraysByProp, stitchArraysByPropStrict } from '../stitch-arrays-by-prop'

describe('stitch-arrays-by-prop', () => {
  it('stitches together two arrays using a shared prop', () => {
    const a = [
      {
        resource_type: 'question',
        reading: 2,
        working: 0,
        checking: 0,
        original_exam_question_id: '7421415d-f242-4356-88db-f0772f9360d2',
      },
      {
        resource_type: 'question',
        reading: 1,
        working: 1,
        checking: 0,
        original_exam_question_id: '47c78ff1-5c13-4a95-91fb-d1db86bebe6c',
      },
      {
        resource_type: 'question',
        reading: 1,
        working: 1,
        checking: 0,
        original_exam_question_id: 'e0864c70-8800-4b00-9047-aa76a762f494',
      },
    ]

    const b = [
      {
        order: 1,
        id: '36286d9a-23fe-4f5b-a9e4-07b066726c03',
        original_order: 1,
        is_flagged: false,
        question_status: 'unseen',
        answer: null,
        correct_answer: null,
        original_exam_question_id: '7421415d-f242-4356-88db-f0772f9360d2',
      },
      {
        order: 2,
        id: 'c4072e81-2053-4596-ab9d-cf8c7859a56f',
        original_order: 2,
        is_flagged: false,
        question_status: 'unseen',
        answer: null,
        correct_answer: null,
        original_exam_question_id: '47c78ff1-5c13-4a95-91fb-d1db86bebe6c',
      },
      {
        order: 3,
        id: '282a535a-cc51-4724-bbb3-330eec976b77',
        original_order: 3,
        is_flagged: false,
        question_status: 'unseen',
        answer: null,
        correct_answer: null,
        original_exam_question_id: 'e0864c70-8800-4b00-9047-aa76a762f494',
      },
    ]

    const expected = [
      {
        answer: null,
        checking: 0,
        correct_answer: null,
        id: '36286d9a-23fe-4f5b-a9e4-07b066726c03',
        is_flagged: false,
        order: 1,
        original_exam_question_id: '7421415d-f242-4356-88db-f0772f9360d2',
        original_order: 1,
        question_status: 'unseen',
        reading: 2,
        resource_type: 'question',
        working: 0,
      },
      {
        answer: null,
        checking: 0,
        correct_answer: null,
        id: 'c4072e81-2053-4596-ab9d-cf8c7859a56f',
        is_flagged: false,
        order: 2,
        original_exam_question_id: '47c78ff1-5c13-4a95-91fb-d1db86bebe6c',
        original_order: 2,
        question_status: 'unseen',
        reading: 1,
        resource_type: 'question',
        working: 1,
      },
      {
        answer: null,
        checking: 0,
        correct_answer: null,
        id: '282a535a-cc51-4724-bbb3-330eec976b77',
        is_flagged: false,
        order: 3,
        original_exam_question_id: 'e0864c70-8800-4b00-9047-aa76a762f494',
        original_order: 3,
        question_status: 'unseen',
        reading: 1,
        resource_type: 'question',
        working: 1,
      },
    ]

    expect(stitchArraysByProp('original_exam_question_id', a, b)).toEqual(expected)
  })

  it('stitches together two arrays using a shared prop omitting items not found in second array', () => {
    const a = [
      {
        resource_type: 'question',
        reading: 2,
        working: 0,
        checking: 0,
        original_exam_question_id: '7421415d-f242-4356-88db-f0772f9360d2',
      },
      {
        resource_type: 'question',
        reading: 1,
        working: 1,
        checking: 0,
        original_exam_question_id: '47c78ff1-5c13-4a95-91fb-d1db86bebe6c',
      },
      {
        resource_type: 'question',
        reading: 1,
        working: 1,
        checking: 0,
        original_exam_question_id: 'e0864c70-8800-4b00-9047-aa76a762f494',
      },
    ]

    const b = [
      {
        order: 1,
        id: '36286d9a-23fe-4f5b-a9e4-07b066726c03',
        original_order: 1,
        is_flagged: false,
        question_status: 'unseen',
        answer: null,
        correct_answer: null,
        original_exam_question_id: '7421415d-f242-4356-88db-f0772f9360d2',
      },
      {
        order: 3,
        id: '282a535a-cc51-4724-bbb3-330eec976b77',
        original_order: 3,
        is_flagged: false,
        question_status: 'unseen',
        answer: null,
        correct_answer: null,
        original_exam_question_id: 'e0864c70-8800-4b00-9047-aa76a762f494',
      },
    ]

    const expected = [
      {
        answer: null,
        checking: 0,
        correct_answer: null,
        id: '36286d9a-23fe-4f5b-a9e4-07b066726c03',
        is_flagged: false,
        order: 1,
        original_exam_question_id: '7421415d-f242-4356-88db-f0772f9360d2',
        original_order: 1,
        question_status: 'unseen',
        reading: 2,
        resource_type: 'question',
        working: 0,
      },
      {
        answer: null,
        checking: 0,
        correct_answer: null,
        id: '282a535a-cc51-4724-bbb3-330eec976b77',
        is_flagged: false,
        order: 3,
        original_exam_question_id: 'e0864c70-8800-4b00-9047-aa76a762f494',
        original_order: 3,
        question_status: 'unseen',
        reading: 1,
        resource_type: 'question',
        working: 1,
      },
    ]

    expect(stitchArraysByPropStrict('original_exam_question_id', a, b)).toEqual(expected)
  })
})
