import { transformChapterImages } from '../transform-chapter-images'

jest.mock('../../../../../../utils/env')

describe('transform-chapter-images', () => {
  it('transforms chapter images, sorting the data', () => {
    const input = {
      chapter_images: [
        {
          id: 42,
          image: 'image.png',
          small_ver: 'small_image.png',
          order: 2,
        },
        {
          id: 22,
          image: 'image2.png',
          small_ver: 'small_image2.png',
          order: 1,
        },
      ],
    }
    const expected = { chapter_images: [{ id: 22, image: 'https://example-bucket.s3.amazonaws.com/image2.png', order: 1, small_ver: 'https://example-bucket.s3.amazonaws.com/small_image2.png' }, { id: 42, image: 'https://example-bucket.s3.amazonaws.com/image.png', order: 2, small_ver: 'https://example-bucket.s3.amazonaws.com/small_image.png' }] }

    const result = transformChapterImages(input)

    expect(result).toEqual(expected)
  })

  it('does nothing if chapter images not present', () => {
    const input = {
      foo: [
        {
          id: 42,
          image: 'image.png',
          small_ver: 'small_image.png',
          order: 2,
        },
      ],
    }
    const expected = { foo: [{ id: 42, image: 'image.png', order: 2, small_ver: 'small_image.png' }] }

    const result = transformChapterImages(input)

    expect(result).toEqual(expected)
  })
})
