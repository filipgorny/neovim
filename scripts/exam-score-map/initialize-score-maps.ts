import { initializeScoreMap } from '../../src/modules/exam-section-score-map/exam-section-score-map-service'

// eslint-disable-next-line @typescript-eslint/no-floating-promises
(
  async (): Promise<void> => {
    const examId = process.argv[2]

    await initializeScoreMap(examId)

    console.log('Initialized score maps (for exam and sections).')
    process.exit(0)
  }
)()
