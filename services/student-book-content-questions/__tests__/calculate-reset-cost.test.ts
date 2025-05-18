import { calculateChapterResetCost } from '../calculate-reset-cost'

describe('calculate-reset-cost', () => {
  it('calculates reset cost for a chapter', () => {
    const chapter = {
      subchapters: [
        {
          contents: [
            {
              questions: [
                { answered_at: '2023-04-04 12:12:12' },
                { answered_at: null },
                { answered_at: '2023-04-04 12:12:12' },
              ],
            },
            {
              questions: [
                { answered_at: null },
                { answered_at: '2023-04-04 12:12:12' },
              ],
            },
          ],
        },
      ],
    }

    const expected = { chapter_reset_cost: 2 * 3 }

    const result = calculateChapterResetCost(2)(chapter)

    expect(result).toEqual(expected)
  })

  it('calculates reset cost for a chapter (many subchapters)', () => {
    const chapter = {
      subchapters: [
        {
          contents: [
            {
              questions: [
                { answered_at: '2023-04-04 12:12:12' },
                { answered_at: null },
                { answered_at: '2023-04-04 12:12:12' },
              ],
            },
            {
              questions: [
                { answered_at: null },
                { answered_at: '2023-04-04 12:12:12' },
              ],
            },
          ],
        },
        {
          contents: [
            {
              questions: [
                { answered_at: '2023-04-04 12:12:12' },
                { answered_at: null },
              ],
            },
            {
              questions: [
                { answered_at: null },
                { answered_at: '2023-04-04 12:12:12' },
              ],
            },
          ],
        },
      ],
    }

    const expected = { chapter_reset_cost: 2 * 5 }

    const result = calculateChapterResetCost(2)(chapter)

    expect(result).toEqual(expected)
  })

  it('calculates reset cost for a chapter (zero cost)', () => {
    const chapter = {
      subchapters: [
        {
          contents: [
            {
              questions: [
                { answered_at: null },
              ],
            },
            {
              questions: [
                { answered_at: null },
              ],
            },
          ],
        },
        {
          contents: [
            {
              questions: [
                { answered_at: null },
              ],
            },
            {
              questions: [
                { answered_at: null },
              ],
            },
          ],
        },
      ],
    }

    const expected = { chapter_reset_cost: 2 * 0 }

    const result = calculateChapterResetCost(2)(chapter)

    expect(result).toEqual(expected)
  })
})
