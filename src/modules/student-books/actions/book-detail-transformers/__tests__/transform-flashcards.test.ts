import { transformFlashcards } from '../transform-flashcards'

jest.mock('../../../../../../utils/env')

describe('transform-flashcards', () => {
  it('transforms flashcards', () => {
    const input = {
      flashcards: [
        {
          id: 42,
          question_image: 'image',
          explanation_image: 'small_image',
        },
      ],
    }
    const expected = { flashcards: [{ explanation_image: 'https://example-bucket.s3.amazonaws.com/small_image', id: 42, question_image: 'https://example-bucket.s3.amazonaws.com/image' }] }

    const result = transformFlashcards(input)

    expect(result).toEqual(expected)
  })

  it('does nothing if flashcards not present', () => {
    const input = {
      foo: [
        {
          id: 42,
          question_image: 'image',
          explanation_image: 'small_image',
        },
      ],
    }
    const expected = { foo: [{ explanation_image: 'small_image', id: 42, question_image: 'image' }] }

    const result = transformFlashcards(input)

    expect(result).toEqual(expected)
  })
})
