# respiration-games

One of three games available in the application. This module is used to record games played by the student, handle leaderboard.

## Routes

`POST /games/respiration`

Record student's game result.

`GET /games/respiration/personal-best`
`GET /games/respiration/period-best`
`GET /games/respiration/daily-best`
`GET /games/respiration/weekly-best`
`GET /games/respiration/monthly-best`

Different (yet similar) routes for fetching student's scores.

## Related DB tables
- `respiration_games`
