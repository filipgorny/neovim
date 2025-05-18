import { create, patch } from './app-settings-repository'

export const createAppSetting = async (namespace: string, name: string, value: string) => (
  create({
    namespace, name, value,
  })
)

export const updateAppSetting = async (id: string, data) => (
  patch(id, data)
)
