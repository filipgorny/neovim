import fs from 'fs/promises'
import path from 'path'
import Papa from 'papaparse'
import * as R from 'ramda'
import { throwException, customException } from '../../utils/error/error-factory'
import { buildPayload, issueAuthUrl, PayloadRecord } from './auth-links-utils/utils'
import { config } from 'dotenv'
import env from '../../utils/env'

// eslint-disable-next-line @typescript-eslint/no-floating-promises
(
  async () => {
    config()

    if (env('APP_ENV') !== 'development') {
      throw new Error('Script can be ran only in development mode')
    }

    const sourcePath = path.resolve('./storage/students-auth.csv')
    const targetPath = path.resolve('./storage/students-auth-generated.csv')

    // Check if the file exists
    await fs.lstat(sourcePath)

    console.log('Generating auth links from CSV file...')

    const inputContent = (await fs.readFile(sourcePath)).toString()
    const input = Papa.parse(inputContent, { header: false })

    const rejectEmptyRecords = R.reject(
      R.propSatisfies(R.equals(1), 'length')
    )

    const buildCsvRecord = (record: PayloadRecord) => ([
      record.student_email,
      record.student_name,
      issueAuthUrl(record),
    ])

    // @ts-ignore
    R.unless(
      R.propSatisfies(R.isEmpty, 'errors'),
      () => throwException(customException('file-invalid', 422))
    )(input)

    const csvPayload = R.pipe(
      R.prop('data'),
      R.slice(1, Infinity),
      // @ts-ignore
      rejectEmptyRecords,
      R.map(buildPayload),
      R.map(buildCsvRecord),
      Papa.unparse
      // @ts-ignore
    )(input)

    // @ts-ignore
    await fs.writeFile(targetPath, csvPayload)

    console.log('Done')

    return Promise.resolve()
  }
)()
