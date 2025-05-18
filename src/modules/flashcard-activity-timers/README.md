# flashcard-activity-timers

Module for recording how much time a student spent on each flashcard he interacted with (and when was the last interaction).

## Routes

`PATCH /activity-timers/flashcard/:flashcard_id`

Upsert the flashcard activity timer.

## Related DB tables
- `flashcard_activity_timers`
