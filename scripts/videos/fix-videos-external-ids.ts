/* eslint-disable @typescript-eslint/no-floating-promises */
import { fixVideosExternalIds } from '../../src/modules/student-book-content-resources/student-book-content-resource-service'

(async () => {
  await fixVideosExternalIds()
  process.exit(0)
})()
