import { transformContentQuestions } from '../transform-content-questions'

describe('transform-content-questions', () => {
  it('transforms questions', () => {
    const input = {
      content_questions: [
        {
          id: 42,
          answer_definition: '{"foo": "bar"}',
          correct_answers: '{"bar": "baz"}',
          question: '{"foobar": 42}',
          explanation: '{"barbaz": "foo foo"}',
          difficulty_percentage: 30,
        },
      ],
    }
    const expected = { content_questions: [{ answer_definition: { foo: 'bar' }, correct_answers: { bar: 'baz' }, difficulty_percentage: 30, explanation: { barbaz: 'foo foo' }, id: 42, question: { foobar: 42 }, salty_bucks_value: 92 }] }

    const result = transformContentQuestions({ value: 2 }, { value: 3 })(input)

    expect(result).toEqual(expected)
  })

  it('does nothing if questions not present', () => {
    const input = {
      foo: [
        {
          id: 42,
          answer_definition: '{"foo": "bar"}',
          correct_answers: '{"bar": "baz"}',
          question: '{"foobar": 42}',
          explanation: '{"barbaz": "foo foo"}',
          difficulty_percentage: 30,
        },
      ],
    }
    const expected = { foo: [{ answer_definition: '{"foo": "bar"}', correct_answers: '{"bar": "baz"}', difficulty_percentage: 30, explanation: '{"barbaz": "foo foo"}', id: 42, question: '{"foobar": 42}' }] }

    const result = transformContentQuestions({ value: 2 }, { value: 3 })(input)

    expect(result).toEqual(expected)
  })
})
