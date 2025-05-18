import { create, findOneOrFail, remove } from './s3-file-repository'
import { makeDTO } from './dto/s3-file-dto'

export const saveNewFile = async (key: string, url: string) => (
  create(
    makeDTO(key, url)
  )
)

export const deleteS3File = async (id: string) => {
  const file = await findOneOrFail({ id })

  await remove(file.id)

  return true
}
