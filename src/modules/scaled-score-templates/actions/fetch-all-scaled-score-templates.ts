import { find } from '../scaled-score-template-repository'

const query = {
  limit: {
    page: 1,
    take: 1000
  },
  order: {
    by: 'title',
    dir: 'asc'
  }
}

export default async () => (
  find(query, {})
)
