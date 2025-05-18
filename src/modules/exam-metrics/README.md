# exam-metrics

This module is used to fetch various exam metrics like scores.

## Routes

`GET /exam-metrics/exam-type/:exam_type_id/section-order/:section_order/score/:section_score`

Get exam metrics by section score.

`GET /exam-metrics/exam-type/:exam_type_id/section-order/:section_order`

Get exam metrics without scores.

`GET /exam-metrics/exam-type/:exam_type_id/section-order/:section_order/score/:section_score/passages`

Get exam metrics by passages.

`GET /exam-metrics/exam-type/:exam_type_id/section-order/:section_order/passages`

Get exam metrics by passages without scores.

`GET /exam-metrics/question-id/:question_id`

Get exam metrics for a single question.

`GET /exam-metrics/exam/:exam_id/section-order/:section_order/passages`

Get exam metrics by passages without scores (for a specific exam).

`GET /exam-metrics/exam/:exam_id/section-order/:section_order/questions`

Get exam metrics for a single exam, for questions, without scores.

`GET /exam-metrics/exam/:exam_id/section-order/:section_order/questions/score/:section_score`

Get exam metrics for a single exam, for questions.

`GET /exam-metrics/exam/:exam_id/section-order/:section_order/passages/score/:section_score`

Get exam metrics for passages, with scores.

## Related DB tables
- `exam_metrics`
- `exam_metrics_avg`
- `exam_passage_metrics`
- `exam_passage_metrics_avg`
