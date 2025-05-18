const XLSX = require('xlsx')

export default function (sheet) {
  const result = []
  let row
  let rowNum
  let colNum
  const range = XLSX.utils.decode_range(sheet['!ref'])
  for (rowNum = range.s.r; rowNum <= range.e.r; rowNum++) {
    row = []
    for (colNum = range.s.c; colNum <= range.e.c; colNum++) {
      const nextCell = sheet[
        XLSX.utils.encode_cell({ r: rowNum, c: colNum })
      ]
      if (typeof nextCell === 'undefined') {
        row.push(void 0)
      } else row.push(nextCell.h ? nextCell.h : nextCell.v)
    }
    result.push(row)
  }
  return result
}
