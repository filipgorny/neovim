import { BookChapter } from '../../../src/types/book-chapter'
import { BookSubchapter } from '../../../src/types/book-subchapter'
import { getNextPartFromChapter, getCurrentPartFromChapter } from '../part-helpers'

const makeSampleChapter = (): BookChapter => ({
  id: 'foo',
  title: 'bar',
  book_id: 'some-book-id',
  order: 1,
})

const makeSampleSubchapter = (part: number): BookSubchapter => ({
  id: 'baz',
  title: 'some title',
  chapter_id: 'foo',
  order: 1,
  part,
})

describe('part-helpers', () => {
  it('calculates next part with existing subchapters I', async () => {
    const chapter = makeSampleChapter()
    chapter.subchapters = [
      makeSampleSubchapter(1),
      makeSampleSubchapter(1),
    ]

    const result = await getNextPartFromChapter(chapter)
    const expected = 2

    expect(result).toBe(expected)
  })

  it('calculates next part with existing subchapters II', async () => {
    const chapter = makeSampleChapter()
    chapter.subchapters = [
      makeSampleSubchapter(1),
      makeSampleSubchapter(2),
      makeSampleSubchapter(2),
    ]

    const result = await getNextPartFromChapter(chapter)
    const expected = 3

    expect(result).toBe(expected)
  })

  it('calculates next part with no subchapters', async () => {
    const chapter = makeSampleChapter()

    const result = await getNextPartFromChapter(chapter)
    const expected = 1

    expect(result).toBe(expected)
  })

  it('calculates current part with existing subchapters I', async () => {
    const chapter = makeSampleChapter()
    chapter.subchapters = [
      makeSampleSubchapter(1),
      makeSampleSubchapter(1),
    ]

    const result = await getCurrentPartFromChapter(chapter)
    const expected = 1

    expect(result).toBe(expected)
  })

  it('calculates current part with existing subchapters II', async () => {
    const chapter = makeSampleChapter()
    chapter.subchapters = [
      makeSampleSubchapter(1),
      makeSampleSubchapter(2),
      makeSampleSubchapter(2),
    ]

    const result = await getCurrentPartFromChapter(chapter)
    const expected = 2

    expect(result).toBe(expected)
  })

  it('calculates current part with no subchapters', async () => {
    const chapter = makeSampleChapter()

    const result = await getCurrentPartFromChapter(chapter)
    const expected = 0

    expect(result).toBe(expected)
  })
})
