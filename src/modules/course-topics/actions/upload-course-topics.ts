import * as R from 'ramda'
import XLSX, { WorkBook } from 'xlsx'
import { decode } from 'html-entities'
import mapP from '@desmart/js-utils/dist/function/mapp'
import sheetToArray from '../../../../services/xlsx-parser/worksheet-utils/sheet-to-array'
import { createEntity } from '../course-topics-service'
import { validateCourseTopicsDoNotExist } from '../validation/validate-course-topics-do-not-exist'

type FilePayload = {
  topics: any
}

const parseSheet = (sheetName, sheet) => {
  const questionSets = R.pipe(
    sheetToArray,
    R.reject(
      R.isEmpty
    ),
    R.map(topicFromRow)
  )(sheet)

  return {
    [sheetName]: questionSets,
  }
}

const parseXlsx = (workbook: WorkBook) => (
  R.pipe(
    R.prop('SheetNames'),
    R.map(
      (sheetName: string) => parseSheet(sheetName, workbook.Sheets[sheetName])
    ),
    R.head,
    R.values,
    R.head,
    R.filter(row => row.topic !== null)
  )(workbook)
)

const topicFromRow = (row: any[]) => {
  const topic = { level: 0, topic: null }

  for (let i = 0; i < row.length; i++) {
    if (row[i]) {
      topic.level = i
      topic.topic = decode(row[i])
    }
  }

  return topic
}

const addOrderToTopics = (topics: any[]) => {
  const topicsWithOrder = []

  for (let i = 0; i < topics.length; i++) {
    topicsWithOrder.push({ ...topics[i], order: i + 1 })
  }

  return topicsWithOrder
}

const addCourseIdToTopics = (course_id: string) => (topics: any[]) => (
  R.map(
    R.assoc('course_id', course_id)
  )(topics)
)

export default async (course_id: string, files: FilePayload) => {
  await validateCourseTopicsDoNotExist(course_id)

  return R.pipe(
    R.path(['topics', 'data']),
    XLSX.read,
    parseXlsx,
    addOrderToTopics,
    addCourseIdToTopics(course_id),
    mapP(createEntity)
  )(files)
}
