import { makeColumn } from '../column-factory'
import {
  COLUMN_TYPE_QUESTION,
  COLUMN_TYPE_ANSWER,
  COLUMN_TYPE_PASSAGE,
  COLUMN_TYPE_CHAPTER,
  COLUMN_TYPE_EXPLANATION
} from '../column-types'

describe('column-factory', () => {
  it('creates a question column', () => {
    const column = makeColumn('some question')

    const expected = {
      type: COLUMN_TYPE_QUESTION,
      value: 'some question'
    }

    expect(column).toEqual(expected)
  })

  it('creates an answer column', () => {
    const column = makeColumn('Answer choice 4')

    const expected = {
      type: COLUMN_TYPE_ANSWER,
      value: 'Answer choice 4'
    }

    expect(column).toEqual(expected)
  })

  it('creates a passage column', () => {
    const column = makeColumn('passage text')

    const expected = {
      type: COLUMN_TYPE_PASSAGE,
      value: 'passage text'
    }

    expect(column).toEqual(expected)
  })

  it('creates a chapter column', () => {
    const column = makeColumn('EK chapter 2')

    const expected = {
      type: COLUMN_TYPE_CHAPTER,
      value: 'EK chapter 2'
    }

    expect(column).toEqual(expected)
  })

  it('creates an explanation column', () => {
    const column = makeColumn('explanation of something')

    const expected = {
      type: COLUMN_TYPE_EXPLANATION,
      value: 'explanation of something'
    }

    expect(column).toEqual(expected)
  })
})
