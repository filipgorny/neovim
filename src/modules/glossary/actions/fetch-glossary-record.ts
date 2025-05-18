import { findOneGlossaryWithOccurances } from '../glossary-repository'

export default async (id: string) => (
  findOneGlossaryWithOccurances(id)
)
