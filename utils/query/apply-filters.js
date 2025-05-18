const { throwException, customException } = require('../../utils/error/error-factory')
const R = require('ramda')
const parseFilters = require('./parse-filters')

const filterTypes = {
  default: (queryBuilder, fieldName, value) => queryBuilder.where(fieldName, value),
  orWhere: (queryBuilder, fieldName, value) => queryBuilder.orWhere(fieldName, value),
  comparison: (queryBuilder, fieldName, value, modifier) => queryBuilder.where(fieldName, modifier, value),
  whereIn: (queryBuilder, fieldName, value) => queryBuilder.whereIn(fieldName, value),
  isNull: (queryBuilder, fieldName) => queryBuilder.whereNull(fieldName),
  isNotNull: (queryBuilder, fieldName) => queryBuilder.whereNotNull(fieldName),
  range: (queryBuilder, fieldName, value) => queryBuilder.whereBetween(fieldName, value),
  __unassigned: (queryBuilder, fieldName, value, modifier, knex) => {
    const qbIfSql = queryBuilder.clone().toSQL().sql
    const isCQ = qbIfSql.includes('book_content_questions')
    const isFlashcard = qbIfSql.includes('book_content_flashcards')
    const isVideo = qbIfSql.includes('videos_list_view')

    if (isCQ) {
      const qbCloneSql = queryBuilder.clone() // .groupByRaw('bcq.id, bc.id, bs.id, bcc.id, b.id')
        .whereRaw('b.is_archived = false').toSQL().sql
      queryBuilder.where(function () {
        this.where('b.title', null).orWhereRaw(`b.is_archived = true and q.id not in (select distinct t.question_id from (${qbCloneSql}) t)`)

        if (Array.isArray(value)) {
          this.orWhereIn('b.id', value)
        }
      })
    } else if (isFlashcard) {
      const qbCloneSql = queryBuilder.clone() // .groupByRaw('f.id, bc.id, bs.id, bcc.id, b.id')
        .whereRaw('b.is_archived = false').toSQL().sql
      queryBuilder.where(function () {
        this.where('b.title', null).orWhereRaw(`b.is_archived = true and f.id not in (select distinct t.flashcard_id from (${qbCloneSql}) t)`)

        if (Array.isArray(value)) {
          this.orWhereIn('b.id', value)
        }
      })
    } else if (isVideo) {
      const qbCloneSql = queryBuilder.clone() // .groupByRaw('v.id, bc.id, bs.id, bcc.id, b.id')
        .whereRaw('b.is_archived = false').toSQL().sql
      queryBuilder.where(function () {
        this.where('b.title', null).orWhereRaw(`b.is_archived = true and v.id not in (select distinct t.video_id from (${qbCloneSql}) t)`)

        if (Array.isArray(value)) {
          this.orWhereIn('b.id', value)
        }
      })
    } else {
      throwException(customException('unknown entities to filter by DRF'))
    }
  },
  __is_watched: (queryBuilder, fieldName, value, modifier, knex) => (
    value
      ? queryBuilder.whereRaw('bcr.delta_object ILIKE \'%is_watched":true%\'')
      : queryBuilder.where(qb => qb.whereRaw('bcr.delta_object ILIKE \'%is_watched":false%\'')
        .orWhereNull('bcr.delta_object'))
  ),
}

const applySingleFilter = (queryBuilder, knex, settings, user) => definition => {
  filterTypes[definition.type](queryBuilder, definition.name, definition.value, definition.modifier, knex, settings, user)
}

const sortFilters = R.pipe(
  R.sortBy(R.prop('name'))
)

const applyFilters = (allowedFilters, settings, user) => (queryBuilder, knex, filters = {}) => {
  const parsed = parseFilters(allowedFilters)(filters)

  R.pipe(
    sortFilters,
    R.map(
      applySingleFilter(queryBuilder, knex, settings, user)
    )
  )(parsed)
}

module.exports = applyFilters
