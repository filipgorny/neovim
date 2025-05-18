# custom-event-types

In the calendar, events can be grouped so the event dropdown can display them accordingly. Custom event types are aggregated in custom event groups.

## Routes

`POST /custom-event-types`

Create an event type.

`GET /custom-event-types`

List event types.

`GET /custom-event-types/:id`

Fetch a specific event type.

`PATCH /custom-event-types/:id`

Update an event type.

`PATCH /custom-event-types/:custom_event_group_id/type/:id/reorder/:direction`

Reoder event types.

`DELETE /custom-event-types/:id`

Remove an event type.

## Related DB tables
- `custom_event_types`
