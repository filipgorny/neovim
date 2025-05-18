import { transformResources } from '../transform-resources'

jest.mock('../../../../../../utils/env')

describe('transform-resources', () => {
  it('transforms resources', () => {
    const input = {
      resources: [
        {
          id: 42,
          external_id: 42,
          video_thumbnail: 'vid.png',
          video_source: '123qwe',
        },
      ],
    }
    const expected = { resources: [{ external_id: undefined, id: 42, video_source: 'https://player.vimeo.com/video/123qwe', video_thumbnail: 'https://example-bucket.s3.amazonaws.com/vid.png' }] }

    const result = transformResources(true)(input)

    expect(result).toEqual(expected)
  })

  it('does nothing if resources not present', () => {
    const input = {
      foo: [
        {
          id: 42,
          external_id: 42,
          video_thumbnail: 'vid.png',
          video_source: '123qwe',
        },
      ],
    }
    const expected = { foo: [{ external_id: 42, id: 42, video_source: '123qwe', video_thumbnail: 'vid.png' }] }

    const result = transformResources(true)(input)

    expect(result).toEqual(expected)
  })
})
