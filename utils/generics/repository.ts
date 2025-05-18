import { notFoundException, throwException } from '../error/error-factory'

export const DELETED_AT = 'deleted_at'

const buildWhereClause = (where: object | Function, handleSoftDeletes: boolean) => (
  handleSoftDeletes
    ? (
        where instanceof Function
          ? function () {
            this.where(where).andWhereNull(DELETED_AT)
          }
          : {
              ...where,
              [DELETED_AT]: null,
            }
      )
    : where
)

const findOneInstance = (Model, modelName?: string) => async (where: object | Function, handleSoftDeletes: boolean, throwOnNoResults: boolean, fetchConfig = {}) => {
  let entity

  try {
    entity = await Model.where(
      buildWhereClause(where, handleSoftDeletes)
    ).fetch(fetchConfig)

    return entity
  } catch (e) {
    console.log(e)

    return throwOnNoResults ? throwException(notFoundException(modelName)) : undefined
  }
}

const findOne = (Model, modelName?: string) => async (where: object | Function, handleSoftDeletes: boolean, throwOnNoResults: boolean, fetchConfig = {}) => {
  const entity = await findOneInstance(Model, modelName)(where, handleSoftDeletes, throwOnNoResults, fetchConfig)

  return entity?.toJSON()
}

export const _create = Model => async (dto: object, trx?) => (
  Model.forge(dto).save(null, {
    ...trx && { transacting: trx },
  })
)

export const _patch = Model => async (id: string, data: object, trx?) => (
  Model.forge({ id }).save(data, {
    patch: true,
    require: false,
    ...trx && { transacting: trx },
  })
)

export const _patchWhere = Model => async (where: object | Function, data: object, trx?) => (
  Model.where(where).save(data, { patch: true, require: false, ...trx && { transacting: trx } })
)

export const _patchAll = Model => async (ids: string[], data: object, trx?) => (
  Model.whereIn('id', ids).save(data, { patch: true, require: false, ...trx && { transacting: trx } })
)

export const _patchCustom = (qb: any) => async (data: object) => (
  qb.save(data, { patch: true, require: false })
)

const isFalsePassage = content => content.length < 200

export const _patchRawCustom = (knex, tableName: string, trx) => (data: Array<{id: string, content?: string}>) => (
  data.map(
    tuple => knex(tableName)
      .where('id', tuple.id)
      .update({
        ...tuple,
        is_false_passage: tuple?.content ? isFalsePassage(tuple.content) : undefined,
      })
      .transacting(trx)
  )
)

export const _patchRaw = (knex, tableName: string) => (data: Array<{id: string}>) => async (trx) => (
  Promise.all(
    _patchRawCustom(knex, tableName, trx)(data)
  )
    .then(trx.commit)
    .catch(trx.rollback)
)

export const _findOne = Model => async (where: object | Function, withRelated = []) => (
  findOne(Model)(where, false, false, {
    withRelated,
    require: false,
  })
)

export const _findOneWithoutDeleted = Model => async (where: object | Function, fetchConfig = {}) => (
  findOne(Model)(where, true, false, fetchConfig)
)

export const _findOneOrFail = (Model, modelName: string) => async (where: object | Function, withRelated = []) => (
  findOne(Model, modelName)(where, false, true, {
    withRelated,
  })
)

export const _findOneOrFailWithoutDeleted = (Model, modelName: string) => async (where: object | Function, withRelated = []) => (
  findOne(Model, modelName)(where, true, true, {
    withRelated,
  })
)

export const _findOneInstanceOrFailWithoutDeleted = (Model, modelName: string) => async (where: object | Function, withRelated = []) => (
  findOneInstance(Model, modelName)(where, true, true, {
    withRelated,
  })
)

export const _countRecords = Model => async (where: object | Function, trx?) => {
  const count = await Model.where(where).count(null, {
    ...trx && { transacting: trx },
  })

  return parseInt(count, 10)
}

export const _delete = Model => async (where: object | Function, trx?) => (
  Model.where(where).destroy({
    require: false,
    ...trx && { transacting: trx },
  })
)

export const _deleteAll = Model => async (ids: string[], trx?) => (
  Model.whereIn('id', ids).destroy({
    require: false,
    ...trx && { transacting: trx },
  })
)

export const _deleteAllByCustomColumn = Model => async (columnName: string, ids: string[], trx?) => (
  Model.whereIn(columnName, ids).destroy({
    require: false,
    ...trx && { transacting: trx },
  })
)

const fixOrder = (knex, tableName, entityKeyName, trx?, orderColumn = 'order') => async (entity_id: string, order: number, operator: '-' | '+'): Promise<void> => {
  const qb = knex.raw(`UPDATE ${tableName} set "${orderColumn}" = "${orderColumn}" ${operator} 1 where ${entityKeyName} = ? and "${orderColumn}" >= ?`, [entity_id, order])

  return trx ? qb.transacting(trx) : qb
}

const fixOrderSimple = (knex, tableName, trx?, orderColumn = 'order') => async (order: number, operator: '-' | '+'): Promise<void> => {
  const qb = knex.raw(`UPDATE ${tableName} set "${orderColumn}" = "${orderColumn}" ${operator} 1 where "${orderColumn}" >= ?`, [order])

  return trx ? qb.transacting(trx) : qb
}

export const fixOrderAfterAdding = (knex, tableName, entityKeyName, trx?, orderColumn = 'order') => async (entity_id: string, order: number): Promise<void> => (
  fixOrder(knex, tableName, entityKeyName, trx, orderColumn)(entity_id, order, '+')
)

export const fixOrderAfterDeleting = (knex, tableName, entityKeyName, trx?, orderColumn = 'order') => async (entity_id: string, order: number): Promise<void> => (
  fixOrder(knex, tableName, entityKeyName, trx, orderColumn)(entity_id, order, '-')
)

export const fixOrderAfterDeletingSimple = (knex, tableName, trx?, orderColumn = 'order') => async (order: number): Promise<void> => (
  fixOrderSimple(knex, tableName, trx, orderColumn)(order, '-')
)
