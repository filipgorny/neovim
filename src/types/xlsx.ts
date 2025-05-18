import { AllColumnTypes } from '../../services/xlsx-parser/column-types'

export type XlsxColumn = {
  type: AllColumnTypes,
  value: string
}

export type XlsxCell = {
  column: XlsxColumn,
  value: any
}
