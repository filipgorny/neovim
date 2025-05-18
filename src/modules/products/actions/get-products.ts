import { getProducts } from '../products-repository'

export default async (query) => (
  getProducts(query)
)
