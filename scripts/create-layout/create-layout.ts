// eslint-disable-next-line @typescript-eslint/no-var-requires
const prompts = require('prompts')
import questions from './questions'
import { cretateLayout } from '../../src/modules/layouts/layout-service'

// eslint-disable-next-line @typescript-eslint/no-floating-promises
(
  async () => {
    const { title } = await prompts(questions)

    const layout = await cretateLayout(title)

    console.log(`Layout with ID ${layout.id} created`)

    return true
  }
)()
