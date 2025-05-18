import moment from 'moment'
import v8 from 'v8'
import fs from 'fs'

export default async () => {
  console.log(process.env.NODE_APP_INSTANCE)
  if (process.env.NODE_APP_INSTANCE === '0' || process.env.NODE_APP_INSTANCE === undefined) {
    const heapsnapshotDir = 'storage/heapsnapshots'
    if (!fs.existsSync(heapsnapshotDir)) {
      fs.mkdirSync(heapsnapshotDir)
    }
    v8.writeHeapSnapshot(`${heapsnapshotDir}/${moment().format('YYYY-MM-DD-HH-mm-ss')}.heapsnapshot`)
    return true
  }
  return false
}
