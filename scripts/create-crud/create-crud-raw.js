const fs = require('fs')
const R = require('ramda')
const camelCase = require('lodash.camelcase')
const { injectBefore, replacePlaceholder } = require('../helpers/file-content-manipulation')
const { getFileContents, writeArrayToFile } = require('../helpers/fs-utils')
const {
  ROUTE_DEFINITION_END_BREAKPOINT,
  ROUTE_EXPORT_BREAKPOINT,
} = require('./breakpoints')

const TEMPLATE_PATH = './scripts/create-crud/templates'

const copyService = async moduleName => (
  R.pipeWith(R.andThen)([
    getFileContents,
    replacePlaceholder('MODULE_NAME', moduleName),
    writeArrayToFile(`./src/modules/${moduleName}/${moduleName}-service.ts`),
  ])(`${TEMPLATE_PATH}/service.txt`)
)

const copyAction = async (actionName, moduleName) => (
  R.pipeWith(R.andThen)([
    getFileContents,
    replacePlaceholder('MODULE_NAME', moduleName),
    writeArrayToFile(`./src/modules/${moduleName}/actions/${actionName}.ts`),
  ])(`${TEMPLATE_PATH}/${actionName}.txt`)
)

const makeImportStatement = actionName => `import ${camelCase(actionName)} from './actions/${actionName}'`
const makeRouteStatement = (verb, routePath, actionName, routeParams = []) => (
  routeParams
    ? `  app.${verb}('${routePath}', route(${camelCase(actionName)}, [${routeParams.join(', ')}])) // import from 'attach-route', if needed`
    : `  app.${verb}('${routePath}', route(${camelCase(actionName)}))`
)

const adjustRouteFile = async (verb, moduleName, actionName, routePath, routeParams = []) => (
  R.pipeWith(R.andThen)([
    getFileContents,
    injectBefore(ROUTE_EXPORT_BREAKPOINT, makeImportStatement(actionName), -1),
    injectBefore(ROUTE_DEFINITION_END_BREAKPOINT, makeRouteStatement(verb, routePath, actionName, routeParams)),
    writeArrayToFile(`src/modules/${moduleName}/routes.ts`),
  ])(`src/modules/${moduleName}/routes.ts`)
)

const shouldCreate = (name, options) => R.includes(name, options)

module.exports = async (moduleName, actions) => {
  fs.promises.access(`${TEMPLATE_PATH}/service.ts`, fs.constants.F_OK)
    .catch(() => copyService(moduleName))

  if (shouldCreate('create', actions)) {
    await adjustRouteFile('post', moduleName, 'create', `/${moduleName}`, ['payload'])
    await copyAction('create', moduleName)
  }

  if (shouldCreate('read', actions)) {
    await adjustRouteFile('get', moduleName, 'fetch-all', `/${moduleName}`, ['query'])
    await copyAction('fetch-all', moduleName)
    await adjustRouteFile('get', moduleName, 'fetch-one', `/${moduleName}/:id`, ['id'])
    await copyAction('fetch-one', moduleName)
  }

  if (shouldCreate('update', actions)) {
    await adjustRouteFile('patch', moduleName, 'update-one', `/${moduleName}/:id`, ['id', 'payload'])
    await copyAction('update-one', moduleName)
  }

  if (shouldCreate('delete', actions)) {
    await adjustRouteFile('delete', moduleName, 'delete-one', `/${moduleName}/:id`, ['id'])
    await copyAction('delete-one', moduleName)
  }
}
