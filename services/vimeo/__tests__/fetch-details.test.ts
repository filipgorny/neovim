import nock from 'nock'
import { VIMEO_API_BASE_URL } from '../vimeo-constants'
import { HttpStatus } from '../../../utils/enums/http-statuses'
import fetchDetails from '../fetch-details'
import { notFoundException, vimeoUnexpectedException } from '../../../utils/error/error-factory'

interface MockVideoDetailsResponseCommand {
  videoId: string,
  expectedStatusCode: HttpStatus,
  expectedData: any
}

const mockVideoDetailsResponse = (command: MockVideoDetailsResponseCommand) => nock(VIMEO_API_BASE_URL)
  .get(`/videos/${command.videoId}`)
  .reply(command.expectedStatusCode, command.expectedData)

describe('vimeo fetch details', () => {
  const videoId = '656704401'
  const expectedData = { foo: 'bar', bar: 'foo' }

  it.skip.each([
    ['not found', HttpStatus.NotFound, notFoundException('Vimeo video')],
    ['unexpected exception', HttpStatus.Unauthorized, vimeoUnexpectedException()],
  ])('should throw %s exception when api response code is %d', async (_, expectedStatusCode, expectedException) => {
    mockVideoDetailsResponse({
      videoId,
      expectedData,
      expectedStatusCode,
    })

    await expect(fetchDetails(videoId)).rejects.toThrowError(expectedException)
  })

  it.skip('should return data when api response code is 200', async () => {
    mockVideoDetailsResponse({
      videoId,
      expectedData,
      expectedStatusCode: HttpStatus.Ok,
    })

    expect(await fetchDetails(videoId)).toEqual(expectedData)
  })
})
