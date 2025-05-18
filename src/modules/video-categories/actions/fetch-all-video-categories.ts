import { find } from '../video-categories-repository'

export default async (query) => (
  find(query, query.filter, ['course', 'endDate'])
)
