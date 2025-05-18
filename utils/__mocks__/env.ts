const env = {
  NODE_ENV: 'test',
  S3_BUCKET_NAME: 'examkrackers-storage-staging',
  AWS_S3_BUCKET: 'example-bucket',
}

export default variable => env[variable]
