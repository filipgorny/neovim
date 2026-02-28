local storage = require("utils.storage")

local M = {}

local _cache = nil
local _initialized = false

local function ensure_init()
  if _initialized then return end
  _initialized = true

  storage.init()
  storage.create_table("favorites", {
    { name = "path", type = "TEXT PRIMARY KEY" },
  })

  _cache = {}
  local rows = storage.select("favorites", { "path" })
  for _, row in ipairs(rows) do
    _cache[row[1]] = true
  end
end

function M.is_favorite(path)
  ensure_init()
  return _cache[path] == true
end

function M.toggle(path)
  ensure_init()
  if _cache[path] then
    storage.delete("favorites", { path = path })
    _cache[path] = nil
  else
    storage.insert_or_replace("favorites", { path = path })
    _cache[path] = true
  end
end

function M.get_all()
  ensure_init()
  local list = {}
  for path in pairs(_cache) do
    table.insert(list, path)
  end
  table.sort(list)
  return list
end

return M
