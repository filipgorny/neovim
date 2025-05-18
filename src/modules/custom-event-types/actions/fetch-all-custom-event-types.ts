import { find } from '../custom-event-types-repository'

export default async (query) => (
  find(query, query?.filter?.custom_event_group_id ? { custom_event_group_id: query.filter.custom_event_group_id } : {})
)
