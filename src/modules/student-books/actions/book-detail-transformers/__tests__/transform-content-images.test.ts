import { transformContentImages } from '../transform-content-images'

jest.mock('../../../../../../utils/env')

describe('transform-content-images', () => {
  it('transforms content images, sorting the data', () => {
    const input = {
      content_images: [
        {
          id: 42,
          image: 'image.png',
          small_ver: 'small_image.png',
          part: 2,
          order: 1,
          original_image_id: 1,
        },
        {
          id: 82,
          image: 'image2.png',
          small_ver: 'small_image2.png',
          part: 2,
          order: 2,
          original_image_id: 3,
        },
        {
          id: 62,
          image: 'image1.png',
          small_ver: 'small_image1.png',
          part: 1,
          order: 1,
          original_image_id: 2,
        },
      ],
    }
    const expected = { content_images: [{ id: 62, image: 'https://example-bucket.s3.amazonaws.com/image1.png', order: 1, original_image_id: 2, part: 1, small_ver: 'https://example-bucket.s3.amazonaws.com/small_image1.png' }, { id: 42, image: 'https://example-bucket.s3.amazonaws.com/image.png', order: 1, original_image_id: 1, part: 2, small_ver: 'https://example-bucket.s3.amazonaws.com/small_image.png' }, { id: 82, image: 'https://example-bucket.s3.amazonaws.com/image2.png', order: 2, original_image_id: 3, part: 2, small_ver: 'https://example-bucket.s3.amazonaws.com/small_image2.png' }] }

    const result = transformContentImages(input)

    expect(result).toEqual(expected)
  })

  it('transforms content images and removes duplicates (by original_image_id)', () => {
    const input = {
      content_images: [
        {
          id: 42,
          image: 'image.png',
          small_ver: 'small_image.png',
          part: 2,
          order: 1,
          original_image_id: 1,
        },
        {
          id: 82,
          image: 'image2.png',
          small_ver: 'small_image2.png',
          part: 2,
          order: 2,
          original_image_id: 2,
        },
        {
          id: 62,
          image: 'image1.png',
          small_ver: 'small_image1.png',
          part: 1,
          order: 1,
          original_image_id: 2,
        },
      ],
    }
    const expected = { content_images: [{ id: 62, image: 'https://example-bucket.s3.amazonaws.com/image1.png', order: 1, original_image_id: 2, part: 1, small_ver: 'https://example-bucket.s3.amazonaws.com/small_image1.png' }, { id: 42, image: 'https://example-bucket.s3.amazonaws.com/image.png', order: 1, original_image_id: 1, part: 2, small_ver: 'https://example-bucket.s3.amazonaws.com/small_image.png' }] }

    const result = transformContentImages(input)

    expect(result).toEqual(expected)
  })

  it('does nothing if content images not present', () => {
    const input = {
      foo: [
        {
          id: 42,
          image: 'image.png',
          small_ver: 'small_image.png',
          part: 2,
          order: 1,
          original_image_id: 1,
        },
      ],
    }
    const expected = { foo: [{ id: 42, image: 'image.png', order: 1, original_image_id: 1, part: 2, small_ver: 'small_image.png' }] }

    const result = transformContentImages(input)

    expect(result).toEqual(expected)
  })
})
