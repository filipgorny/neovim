import { patch } from './video-categories-repository'

export const hideVideoCategory = async (id) => (
  patch(id, { is_hidden: true })
)

export const revealVideoCategory = async (id) => (
  patch(id, { is_hidden: false })
)
