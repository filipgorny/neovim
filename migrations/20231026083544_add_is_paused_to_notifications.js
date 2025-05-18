const tableName = 'notifications'
const columnName = 'is_paused'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = async knex => {
  await knex.schema.table(tableName, table => {
    table.boolean(columnName).nullable()
  })
  await knex.raw(`
    CREATE OR REPLACE FUNCTION set_is_paused_for_notification()
    RETURNS TRIGGER AS $$
    BEGIN
      IF NEW.type <> 'immediate' THEN
        IF NEW.is_paused IS NULL THEN
          NEW.is_paused := FALSE;
        END IF;
      ELSE
        NEW.is_paused := NULL;
      END IF;
      RETURN NEW;
    END;
    $$
    LANGUAGE plpgsql;
  
    CREATE TRIGGER set_is_paused_for_notification
    BEFORE INSERT ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION set_is_paused_for_notification();

    UPDATE notifications SET is_paused = FALSE WHERE type <> 'immediate';
  `)
}

const down = async knex => {
  await knex.raw(`
    DROP TRIGGER set_is_paused_for_notification
    ON notifications;

    DROP FUNCTION IF EXISTS set_is_paused_for_notification;
  `)
  await knex.schema.table(tableName, table => {
    table.dropColumn(columnName)
  })
}
