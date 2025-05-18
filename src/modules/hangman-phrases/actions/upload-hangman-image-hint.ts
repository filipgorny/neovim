import { uploadHangmanHintImageToS3 } from './create-hangman-phrase'

export default async (files) => ({
  image_hint: await uploadHangmanHintImageToS3(files.image),
})
