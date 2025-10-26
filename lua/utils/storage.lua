local M = {}

-- SQLite database path
local db_path = vim.fn.stdpath("data") .. "/nvim_storage.db"

-- Ensure database directory exists
local function ensure_db_dir()
  local db_dir = vim.fn.fnamemodify(db_path, ":h")
  if vim.fn.isdirectory(db_dir) == 0 then
    vim.fn.mkdir(db_dir, "p")
  end
end

-- Execute SQL command
local function exec_sql(sql, params)
  params = params or {}

  -- Build sqlite3 command with proper escaping
  local cmd = string.format("sqlite3 '%s' ", db_path)

  -- Prepare SQL with parameters
  local escaped_sql = sql
  for i, param in ipairs(params) do
    local escaped_param = tostring(param):gsub("'", "''")
    escaped_sql = escaped_sql:gsub("$" .. i, "'" .. escaped_param .. "'")
  end

  cmd = cmd .. string.format('"%s"', escaped_sql)

  local handle = io.popen(cmd .. " 2>&1")
  if not handle then
    return nil, "Failed to execute SQL"
  end

  local result = handle:read("*a")
  local success = handle:close()

  -- Check for SQLite errors in output
  if result and (result:match("^Error:") or result:match("^SQL error:")) then
    return nil, result
  end

  return result, nil
end

-- Query with results (for SELECT)
local function query_sql(sql, params)
  params = params or {}

  -- Build command to get results as pipe-separated values
  local cmd = string.format("sqlite3 -separator '|' '%s' ", db_path)

  -- Prepare SQL with parameters
  local escaped_sql = sql
  for i, param in ipairs(params) do
    local escaped_param = tostring(param):gsub("'", "''")
    escaped_sql = escaped_sql:gsub("$" .. i, "'" .. escaped_param .. "'")
  end

  cmd = cmd .. string.format('"%s"', escaped_sql)

  local handle = io.popen(cmd .. " 2>&1")
  if not handle then
    return {}, "Failed to execute query"
  end

  local result = handle:read("*a")
  local success = handle:close()

  -- Check for SQLite errors in output
  if result and (result:match("^Error:") or result:match("^SQL error:")) then
    return {}, result
  end

  -- Parse results into table of rows
  local rows = {}
  if result and result ~= "" then
    for line in result:gmatch("[^\r\n]+") do
      local parts = {}
      for part in line:gmatch("[^|]+") do
        table.insert(parts, part)
      end
      if #parts > 0 then
        table.insert(rows, parts)
      end
    end
  end

  return rows, nil
end

-- Create a table with schema definition
function M.create_table(table_name, columns, indexes, constraints)
  indexes = indexes or {}
  constraints = constraints or {}

  -- Build CREATE TABLE statement
  local col_defs = {}
  for _, col in ipairs(columns) do
    table.insert(col_defs, string.format("%s %s", col.name, col.type))
  end

  -- Add constraints to the table definition
  for _, constraint in ipairs(constraints) do
    table.insert(col_defs, constraint)
  end

  local create_sql = string.format(
    "CREATE TABLE IF NOT EXISTS %s (%s);",
    table_name,
    table.concat(col_defs, ", ")
  )

  local result, err = exec_sql(create_sql)
  if err then
    return false, "Failed to create table: " .. err
  end

  -- Create indexes
  for _, idx in ipairs(indexes) do
    local idx_sql = string.format(
      "CREATE INDEX IF NOT EXISTS %s ON %s(%s);",
      idx.name,
      table_name,
      table.concat(idx.columns, ", ")
    )
    exec_sql(idx_sql)
  end

  return true
end

-- Insert or replace a row
function M.insert_or_replace(table_name, data)
  local columns = {}
  local placeholders = {}
  local values = {}

  local i = 1
  for col, val in pairs(data) do
    table.insert(columns, col)
    table.insert(placeholders, "$" .. i)
    table.insert(values, val)
    i = i + 1
  end

  local sql = string.format(
    "INSERT OR REPLACE INTO %s (%s) VALUES (%s)",
    table_name,
    table.concat(columns, ", "),
    table.concat(placeholders, ", ")
  )

  local result, err = exec_sql(sql, values)
  if err then
    return false, err
  end

  return true
end

-- Delete rows matching conditions
function M.delete(table_name, conditions)
  local where_parts = {}
  local values = {}

  local i = 1
  for col, val in pairs(conditions) do
    table.insert(where_parts, string.format("%s = $%d", col, i))
    table.insert(values, val)
    i = i + 1
  end

  local sql = string.format(
    "DELETE FROM %s WHERE %s",
    table_name,
    table.concat(where_parts, " AND ")
  )

  local result, err = exec_sql(sql, values)
  if err then
    return false, err
  end

  return true
end

-- Select rows with conditions and ordering
function M.select(table_name, columns, conditions, order_by)
  columns = columns or { "*" }
  conditions = conditions or {}
  order_by = order_by or {}

  local where_parts = {}
  local values = {}

  local i = 1
  for col, val in pairs(conditions) do
    table.insert(where_parts, string.format("%s = $%d", col, i))
    table.insert(values, val)
    i = i + 1
  end

  local sql = string.format("SELECT %s FROM %s", table.concat(columns, ", "), table_name)

  if #where_parts > 0 then
    sql = sql .. " WHERE " .. table.concat(where_parts, " AND ")
  end

  if #order_by > 0 then
    sql = sql .. " ORDER BY " .. table.concat(order_by, ", ")
  end

  local rows, err = query_sql(sql, values)
  if err then
    vim.notify("SQL query error: " .. tostring(err), vim.log.levels.ERROR)
    return {}
  end

  return rows
end

-- Initialize database (create file if it doesn't exist)
function M.init()
  ensure_db_dir()
  -- Create a simple query to ensure the database file is created
  local result, err = exec_sql("SELECT 1;")
  if err then
    vim.notify("Failed to initialize database: " .. tostring(err), vim.log.levels.ERROR)
    return false
  end
  return true
end

return M
