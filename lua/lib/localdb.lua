local package = "kkharji/sqlite.lua"

require('pckr').add{
  package
}

local localdb = {
  db = {}
}

local sqlite = require("sqlite")
local config_tbl_name = "config"
local config_tbl_desc = {
  id = {"int", "primary", "key"},
  name = { "text", unique = true },
  value = { "text" },
}

local db_uri = vim.fn.stdpath("data") .. "/localdb.sqlite3"

local sqlitedb = sqlite({
 uri = db_uri
})

localdb.db = sqlitedb.db.open(db_uri, {}, nil)

localdb.db:create(config_tbl_name, config_tbl_desc)

localdb.get = function (name)
  result = localdb.db:select(config_tbl_name, { where = { name = name }})

  if result == nil then
    return nil
  end

  if result[1] == nil then
    return nil
  end

  return result[1].value
end

localdb.set = function (name, value)
  result = localdb.db:select(config_tbl_name, { name = name })
 
  if result == nil then
    localdb.db:insert(config_tbl_name, { name = name, value = value })
  else
    localdb.db:update(config_tbl_name, { where = { value = value }, set = { name = name }})
  end
end

return localdb
