# app-settings

The application has several global settings that are managed in this module. Only a Master Admin can change these settings. An app setting may be created in the database table directly or using the command `yarn run ek:create:app-setting`.

## Routes
`PATCH /app-settings/gladiators/:id`

**DEPRECATED**

Change an app setting in the Gladiators game.

`PATCH /app-settings/:id`

Change an app setting in ExamKrackers.

`GET /app-settings/namespace/:namespace`

Fetch all app settings within the given namespace.

`GET /app-settings/gladiators/namespace/:namespace`

**DEPRECATED**

Fetch all Gladiators game app settings within the given namespace.

`GET /app-settings/timezone`

Fetch the timezone set in the application.

## Related DB tables
- `app_settings`
