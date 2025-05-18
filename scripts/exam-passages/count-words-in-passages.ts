import { countWordsInPassages } from '../../services/exam-passages/count-words-in-passages'

// eslint-disable-next-line @typescript-eslint/no-floating-promises
(
  async () => {
    console.log('Counting words in all passages...')

    await countWordsInPassages()

    console.log('Done')

    process.exit(0)
  }
)()
