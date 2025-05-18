import { findByNamespace } from '../app-settings-repository'

export default async (namespace: string) => (
  findByNamespace(namespace)
)
