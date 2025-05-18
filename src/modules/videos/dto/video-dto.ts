export type VideoDTO = {
  title: string,
  description: string,
  source: string,
  thumbnail: string,
  duration: number,
}

export const makeDTO = (title: string, description: string, source: string, thumbnail: string, duration: number): VideoDTO => ({
  title,
  description,
  source,
  thumbnail,
  duration,
})

export default VideoDTO
