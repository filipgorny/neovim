import aws, { S3 } from 'aws-sdk'
import env from '../../utils/env'

aws.config.update({
  region: env('AWS_S3_REGION'),
  accessKeyId: env('AWS_S3_ACCESS_KEY_ID'),
  secretAccessKey: env('AWS_S3_SECRET_ACCESS_KEY'),
})

export const s3Client = (): S3 => new aws.S3({
  params: {
    Bucket: env('AWS_S3_BUCKET'),
  },
  apiVersion: '2006-03-01',
})
