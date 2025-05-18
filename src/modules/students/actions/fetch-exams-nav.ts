import * as R from 'ramda'
import { fetchRaw } from '../../../../utils/model/fetch'
import { StudentExam } from '../../../models'
import renameProps from '../../../../utils/object/rename-props'

const buildQuery = studentId => async knex => (
  knex
    .select(
      'se.id',
      'se.exam_id as exam_id',
      'se.title',
      'ses.title as section_title',
      'ses.id as section_id',
      'ses.order as section_order',
      'et.type as exam_type'
    ).from('student_exams AS se')
    .leftJoin('student_exam_sections AS ses', 'se.id', 'ses.student_exam_id')
    .leftJoin('exam_types AS et', 'et.id', 'se.exam_type_id')
    .where('student_id', studentId)
    .whereRaw('se.deleted_at is null')
    .orderByRaw('se.title ASC NULLS LAST')
)

const getProp = name => R.pipe(
  R.head,
  R.prop(name)
)

const getSections = R.pipe(
  R.map(
    R.pipe(
      R.pick(['section_id', 'section_title', 'section_order']),
      renameProps({
        section_id: 'id',
        section_title: 'title',
        section_order: 'order',
      })
    )
  ),
  R.sortBy(
    R.prop('order')
  )
)

const transformData = R.pipe(
  R.prop('data'),
  R.groupWith(
    // @ts-ignore
    R.eqBy(R.prop('id'))
  ),
  R.map(
    R.applySpec({
      exam_id: getProp('id'),
      title: getProp('title'),
      type: getProp('exam_type'),
      sections: getSections,
    })
  )
)

export default async student => R.pipeWith(R.andThen)([
  fetchRaw(
    StudentExam,
    buildQuery(student.id)
  ),
  transformData,
])(undefined)
