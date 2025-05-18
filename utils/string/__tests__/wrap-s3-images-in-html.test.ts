import { wrapS3ImagesInHtml } from '../wrap-s3-images-in-html'

jest.mock('../../env')

describe('wrap-s3-images-in-html', () => {
  it('wraps found S3 URLs in image tags', () => {
    const input = 'foo bar https://examkrackers-storage-staging.s3-us-west-1.amazonaws.com/weave-13.jpg something but also https://www.youtube.com/watch?v=veT0lvUz6LI and even more but https://examkrackers-storage-staging.s3-us-west-1.amazonaws.com/asdasd.png'
    const expected = 'foo bar &lt;img src="https://examkrackers-storage-staging.s3-us-west-1.amazonaws.com/weave-13.jpg" /&gt; something but also https://www.youtube.com/watch?v=veT0lvUz6LI and even more but &lt;img src="https://examkrackers-storage-staging.s3-us-west-1.amazonaws.com/asdasd.png" /&gt;'

    const result = wrapS3ImagesInHtml(input)

    expect(result).toEqual(expected)
  })

  it('wraps found S3 URLs in image tags while it is in center tag', () => {
    const input = `Based on the graph below, which of the following explanations would account for the case where the chance of survival is greatest?

    <center>https://examkrackers-storage-staging.s3-us-west-1.amazonaws.com/mcat/biology-minimcats/chapter5/Bio_miniMCATs_C5_P4_Q15.png</center>`
    const expected = `Based on the graph below, which of the following explanations would account for the case where the chance of survival is greatest?

    &lt;center&gt;&lt;img src="https://examkrackers-storage-staging.s3-us-west-1.amazonaws.com/mcat/biology-minimcats/chapter5/Bio_miniMCATs_C5_P4_Q15.png" /&gt;&lt;/center&gt;`

    const result = wrapS3ImagesInHtml(input)

    expect(result).toEqual(expected)
  })

  it('wraps found S3 URLs in image tags while it is in center tag (escape characters)', () => {
    const input = `Based on the graph below, which of the following explanations would account for the case where the chance of survival is greatest?

    &lt;center&gt;https://examkrackers-storage-staging.s3-us-west-1.amazonaws.com/mcat/biology-minimcats/chapter5/Bio_miniMCATs_C5_P4_Q15.png&lt;/center&gt;`
    const expected = `Based on the graph below, which of the following explanations would account for the case where the chance of survival is greatest?

    &lt;center&gt;&lt;img src="https://examkrackers-storage-staging.s3-us-west-1.amazonaws.com/mcat/biology-minimcats/chapter5/Bio_miniMCATs_C5_P4_Q15.png" /&gt;&lt;/center&gt;`

    const result = wrapS3ImagesInHtml(input)

    expect(result).toEqual(expected)
  })
})
