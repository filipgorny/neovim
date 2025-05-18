# scaled-score-templates

Module for managing scaled score templates.

## Routes

`POST /scaled-score-templates`

Create a scaled score template.

`POST /scaled-score-templates/:id/upsert-scores`

Upsert scores for a given template.

`PATCH /scaled-score-templates/:id`

Update a template.

`GET /scaled-score-templates`

Fetch templates.

`GET /scaled-score-templates/:id`

Get a single template.

## Related DB tables
- `scaled_score_templates`
