# salty-bucks-daily-log

A cron job is registering student's current Salty Bucks (SB; ExamKrackers' "currency") balance (snapshot) every day. This module is for fetching diagram data based on these values.

## Routes

`GEt /leaderboard`

Get the leaderboard regarding SB earnings.

`GET /leaderboard/salty-bucks-categories-chart`

Get the leaderboard but grouped by categories.

`GET /leaderboard/percentile-rank`

Get the student's percentile rank when it comes to earning SBs.

## Related DB tables
- `salty_bucks_daily_log`
