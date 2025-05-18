# support-tab

Module for handling support tab visible to students.

## Routes

`PATCH /support-tab/contact-us-link`

Set the "contact us" link.

`PATCH /support-tab/help-center-link`

Set the "help center" link.

`PATCH /support-tab/share-with-community-link`

Set the "share with community" link.

`PATCH /support-tab/status-page-link`

Set the "status page" link.

`PATCH /support-tab/training-tutorials-link`

Set the "training tutorials" link.

`PATCH /support-tab/getting-started-link`

Set the "getting started" link.

`GET /support-tab/contact-us-link`
`GET /support-tab/help-center-link`
`GET /support-tab/share-with-community-link`
`GET /support-tab/status-page-link`
`GET /support-tab/training-tutorials-link`
`GET /support-tab/getting-started-link`

Getters for different links set by admin.

`GET /support-tab`

Get all support tab links.

## Related DB tables
- `app_settings`
