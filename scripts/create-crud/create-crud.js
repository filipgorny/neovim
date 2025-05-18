const prompts = require('prompts')
const questions = require('./questions')
const createCrudRaw = require('./create-crud-raw')

const onCancel = () => {
  console.log('Aborting.')

  return false
}

module.exports = (
  async () => {
    const { moduleName, actions, proceed } = await prompts(questions, { onCancel })

    if (!proceed) {
      return
    }

    await createCrudRaw(moduleName, actions)
  }
)()
