export type Limit = {
  take: number,
  page: number
}

export type Order = {
  by: string,
  dir: 'asc' | 'desc'
}

export type FetchQuery = {
  limit: Limit,
  order: Order
}

export type FetchQueryParam = Partial<FetchQuery> & {
  filter?: any
}
