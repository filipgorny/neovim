export type s3FileDTO = {
  key: string,
  url: string,
}

export const makeDTO = (key: string, url: string): s3FileDTO => ({
  key,
  url,
})

export default s3FileDTO
