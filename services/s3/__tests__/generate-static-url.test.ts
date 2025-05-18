import generateStaticUrl from '../generate-static-url'

jest.mock('../../../utils/env')

describe('generate-static-url', () => {
  it('create a URL to S3', () => {
    const key = 'foobar'

    expect(generateStaticUrl(key)).toEqual('https://example-bucket.s3.amazonaws.com/foobar')
  })

  it('returns null if key is null', () => {
    const key = null

    expect(generateStaticUrl(key)).toEqual(null)
  })

  it('returns null if key is undefined', () => {
    const key = undefined

    expect(generateStaticUrl(key)).toEqual(null)
  })
})
