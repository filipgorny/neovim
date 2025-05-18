import { calculateVelocity } from '../velocity-service-helpers'

const readContentData = [
  { content_read_amount: 45, student_book_id: 'foo' },
  { content_read_amount: 73, student_book_id: 'bar' },
  { content_read_amount: 21, student_book_id: 'baz' },
]

const readContentDataComplex = [
  { content_read_amount: 194, student_book_id: 'foo' },
  { content_read_amount: 121, student_book_id: 'bar' },
  { content_read_amount: 9, student_book_id: 'baz' },
  { content_read_amount: 100, student_book_id: 'foo' },
]

describe('velocity-service-helpers', () => {
  it('calculates velocity when all books have been "touched" (read in the last few days)', async () => {
    const result = await calculateVelocity(3, 3, readContentData)

    expect(result).toEqual(46)
  })

  it('calculates velocity adding zeros for books not touched', async () => {
    const result = await calculateVelocity(5, 3, readContentData)

    expect(result).toEqual(28)
  })

  it('calculates velocity when having multiple books over days', async () => {
    const result = await calculateVelocity(3, 10, readContentData)

    expect(result).toEqual(46)
  })

  it('calculates velocity aggregating same books', async () => {
    const result = await calculateVelocity(5, 3, readContentDataComplex)

    expect(result).toEqual(85)
  })
})
