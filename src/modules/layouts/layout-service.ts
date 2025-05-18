import { create } from './layout-repository'

export const cretateLayout = async (title: string) => (
  create({
    title,
  })
)
