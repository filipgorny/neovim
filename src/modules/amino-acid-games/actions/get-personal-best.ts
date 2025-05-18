import { findPersonalBestResults } from '../amino-acid-games-repository'

export default async (student, query) => (
  findPersonalBestResults(student.id, query.bloxGameEnabled === 'true', query.difficulty)
)
