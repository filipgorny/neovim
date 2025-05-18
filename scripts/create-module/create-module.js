const fs = require('fs')
const R = require('ramda')
const prompts = require('prompts')
const pluralize = require('pluralize')
const moment = require('moment')
const camelCase = require('lodash.camelcase')
const snakeCase = require('lodash.snakecase')
const questions = require('./questions')
const { injectBefore, replacePlaceholder } = require('../helpers/file-content-manipulation')
const { getFileContents, writeArrayToFile } = require('../helpers/fs-utils')
const createCrudRaw = require('../create-crud/create-crud-raw')
const {
  ROUTE_IMPORT_BREAKPOINT,
  ROUTE_BIND_BREAKPOINT,
  MODEL_IMPORT_BREAKPOINT,
  MODEL_EXPORT_BREAKPOINT,
} = require('./breakpoints')

const TEMPLATE_PATH = './scripts/create-module/templates'

const ucFirst = R.converge(
  R.concat,
  [
    R.pipe(
      R.head,
      R.toUpper
    ),
    R.tail,
  ]
)

const makeRouteImportStatement = moduleName => `import ${camelCase(moduleName)}Routes from './modules/${moduleName}/routes'`
const makeModelImportStatement = (modelName, modelFileName) => `import ${camelCase(modelName)}Model from './${modelFileName}'`
const makeModelExportStatement = modelName => `export const ${camelCase(modelName)} = ${camelCase(modelName)}Model(bookshelf)`
const makeRouteBindingStatement = moduleName => `  ${camelCase(moduleName)}Routes,`
const makeMigrationFileName = moduleName => `${moment().format('YMMDDHHmmss')}_create_${moduleName}_table.js`

const createModuleDirStructure = async moduleName => {
  try {
    await fs.mkdirSync(`./src/modules/${moduleName}`)
  } catch (e) {}

  try {
    await fs.mkdirSync(`./src/modules/${moduleName}/actions`)
  } catch (e) {}
}

const copyRoutes = async moduleName => {
  fs.copyFileSync(TEMPLATE_PATH + '/routes.js', `./src/modules/${moduleName}/routes.ts`)
}

const copyExampleAction = async moduleName => {
  fs.copyFileSync(TEMPLATE_PATH + '/example-action.ts', `./src/modules/${moduleName}/actions/example-action.ts`)
}

const adjustServerFile = async moduleName => (
  R.pipeWith(R.andThen)([
    getFileContents,
    injectBefore(ROUTE_IMPORT_BREAKPOINT, makeRouteImportStatement(moduleName)),
    injectBefore(ROUTE_BIND_BREAKPOINT, makeRouteBindingStatement(moduleName)),
    writeArrayToFile('src/server-routes.ts'),
  ])('src/server-routes.ts')
)

const adjustModelIndexFile = async (moduleName, singularName, singularNameUpperFirst) => (
  R.pipeWith(R.andThen)([
    getFileContents,
    injectBefore(MODEL_IMPORT_BREAKPOINT, makeModelImportStatement(singularNameUpperFirst, singularName)),
    injectBefore(MODEL_EXPORT_BREAKPOINT, makeModelExportStatement(singularNameUpperFirst)),
    writeArrayToFile('src/models/index.ts'),
  ])('src/models/index.ts')
)

const copyModel = async (moduleName, singularName, singularNameUpperFirst) => (
  R.pipeWith(R.andThen)([
    getFileContents,
    replacePlaceholder('MODEL_NAME', ucFirst(camelCase(singularNameUpperFirst))),
    replacePlaceholder('TABLE_NAME', snakeCase(moduleName)),
    writeArrayToFile(`./src/models/${singularName}.ts`),
  ])(TEMPLATE_PATH + '/example-model.js')
)

const copyMigration = async moduleName => (
  R.pipeWith(R.andThen)([
    getFileContents,
    replacePlaceholder('TABLE_NAME', snakeCase(moduleName)),
    writeArrayToFile(`./migrations/${makeMigrationFileName(moduleName)}`),
  ])(TEMPLATE_PATH + '/example-migration.js')
)

const copyRepository = async (moduleName, singularNameUpperFirst) => (
  R.pipeWith(R.andThen)([
    getFileContents,
    replacePlaceholder('__MODEL_NAME', ucFirst(camelCase(singularNameUpperFirst))),
    writeArrayToFile(`./src/modules/${moduleName}/${moduleName}-repository.ts`),
  ])(TEMPLATE_PATH + '/example-repository.txt')
)

const onCancel = () => {
  console.log('Aborting.')

  return false
}

const shouldCreate = (name, options) => R.includes(name, options)

module.exports = (
  async () => {
    const { moduleName, createAlso, proceed } = await prompts(questions, { onCancel })

    if (!proceed) {
      return
    }

    const singularName = pluralize(moduleName, 1)
    const singularNameUpperFirst = ucFirst(singularName)

    await createModuleDirStructure(moduleName)

    await Promise.all([
      copyRoutes(moduleName),
      copyExampleAction(moduleName),
      adjustServerFile(moduleName),
    ])

    if (shouldCreate('migration', createAlso)) {
      await copyMigration(moduleName)
    }

    if (shouldCreate('model', createAlso)) {
      await Promise.all([
        copyModel(moduleName, singularName, singularNameUpperFirst),
        adjustModelIndexFile(moduleName, singularName, singularNameUpperFirst),
      ])
    }

    if (shouldCreate('repository', createAlso)) {
      await copyRepository(moduleName, singularNameUpperFirst)
    }

    if (shouldCreate('crud', createAlso)) {
      await createCrudRaw(moduleName, ['create', 'read', 'update', 'delete'])
    }
  }
)()
