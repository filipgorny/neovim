// eslint-disable-next-line @typescript-eslint/no-var-requires
const prompts = require('prompts')
import questions from './questions'
import { createAppSetting } from '../../src/modules/app-settings/app-settings-service'
import { findOne } from '../../src/modules/app-settings/app-settings-repository'
import { resourceAlreadyExistsException, throwException } from '../../utils/error/error-factory'

// eslint-disable-next-line @typescript-eslint/no-floating-promises
(
  async () => {
    const { namespace, name, value } = await prompts(questions)

    const setting = await findOne({
      namespace, name,
    })

    if (setting) {
      throwException(resourceAlreadyExistsException('AppSetting'))
    }

    await createAppSetting(namespace, name, value)

    console.log(`App setting ${namespace}::${name}=${value} created`)

    process.exit(0)
  }
)()
