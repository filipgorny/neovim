# custom-event-groups

In the calendar, events can be grouped so the event dropdown can display them accordingly.

## Routes

`POST /custom-event-groups`

Create an event group.

`GET /custom-event-groups`

List event groups.

`GET /custom-event-groups/:id`

Fetch a specific event group.

`PATCH /custom-event-groups/:id`

Update an event group.

`PATCH /custom-event-groups/:course_id/group/:id/reorder/:direction`

Reoder event groups.

`DELETE /custom-event-groups/:id`

Remove an event group.

## Related DB tables
- `custom_event_groups`
