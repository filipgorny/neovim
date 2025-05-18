# amino-acid-games

One of three games available in the application. This module is used to record games played by the student, handle leaderboard.

## Routes
`POST /games/amino-acid`

Record student's game result.

`GET /games/amino-acid/personal-best`
`GET /games/amino-acid/period-best`
`GET /games/amino-acid/daily-best`
`GET /games/amino-acid/weekly-best`
`GET /games/amino-acid/monthly-best`

Different (yet similar) routes for fetching student's scores.

## Related DB tables
- `amino_acid_games`
