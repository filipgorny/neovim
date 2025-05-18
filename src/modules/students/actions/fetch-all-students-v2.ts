import { findProductsWithStudents } from '../../products/products-repository'

export default async (query) => (
  findProductsWithStudents(query, query.filter)
)
