const fs = require('fs')
const R = require('ramda')
const camelCase = require('lodash.camelcase')
const prompts = require('prompts')
const questions = require('./questions')
const { injectBefore } = require('../helpers/file-content-manipulation')
const { getFileContents, writeArrayToFile } = require('../helpers/fs-utils')
const {
  ROUTE_DEFINITION_END_BREAKPOINT,
  ROUTE_EXPORT_BREAKPOINT,
} = require('./breakpoints')

const TEMPLATE_PATH = './scripts/create-module/templates'

const makeImportStatement = actionName => `import ${camelCase(actionName)} from './actions/${actionName}'`
const makeRouteStatement = actionName => `  app.get('/${actionName}', route(${camelCase(actionName)}))`

const copyExampleAction = async (moduleName, actionName) => {
  fs.copyFileSync(TEMPLATE_PATH + '/example-action.ts', `./src/modules/${moduleName}/actions/${actionName}.ts`)
}

const adjustRouteFile = async (moduleName, actionName) => (
  R.pipeWith(R.andThen)([
    getFileContents,
    injectBefore(ROUTE_EXPORT_BREAKPOINT, makeImportStatement(actionName), -1),
    injectBefore(ROUTE_DEFINITION_END_BREAKPOINT, makeRouteStatement(actionName)),
    writeArrayToFile(`src/modules/${moduleName}/routes.ts`),
  ])(`src/modules/${moduleName}/routes.ts`)
)

module.exports = (
  async () => {
    const { moduleName, actionName } = await prompts(questions)

    await Promise.all([
      copyExampleAction(moduleName, actionName),
      adjustRouteFile(moduleName, actionName),
    ])
  }
)()
