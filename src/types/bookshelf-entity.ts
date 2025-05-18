export type BookshelfEntity<T extends {}> = {
  id: string
  get: <K extends keyof T>(k: K) => T[K]
  toJSON: () => T
}
