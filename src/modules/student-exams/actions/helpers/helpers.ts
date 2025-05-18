import * as R from 'ramda'

const filterExamSectionById = sectionId => R.over(
  R.lensPath(['sections']),
  R.filter(
    R.propEq('id', sectionId)
  )
)

export const extractSection = sectionId => R.pipe(
  R.prop('exam'),
  filterExamSectionById(sectionId)
)

export const extractPropAndFlattenArray = prop => R.pipe(
  R.pluck(prop),
  R.flatten
)
