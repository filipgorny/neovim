import { findVideoCategories } from '../video-categories-repository'

export default async (query) => (
  findVideoCategories(query, query.filter)
)
