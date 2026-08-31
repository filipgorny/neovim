-- Reużywalna logika filtrowania zadań — wspólna dla boardu i backlogu.
--
-- Filtr = { text = "<substring>", users = { [accountId] = true } }.
--   * text  — dopasowanie podłańcucha (case-insensitive) do klucza + summary,
--             semantyka jak SQL '%text%'.
--   * users — zbiór zaznaczonych użytkowników; PUSTY = wszyscy.
--
-- Persystencja delegowana do system.jira.config (per-repo).

local avatar = require("system.jira.avatar")

local M = {}

-- Sentinel dla zadań bez przypisanego użytkownika.
local UNASSIGNED = "__unassigned__"
M.UNASSIGNED = UNASSIGNED

-- Identyfikator użytkownika przypisanego do zadania (albo sentinel).
local function assignee_id(issue)
  local a = issue.fields and issue.fields.assignee

  if avatar.present(a) then
    return a.accountId or a.displayName or "?"
  end

  return UNASSIGNED
end

M.assignee_id = assignee_id

-- Czy filtr faktycznie coś zawęża.
function M.is_active(filter)
  if not filter then
    return false
  end

  local has_text = filter.text and filter.text ~= ""
  local has_users = filter.users and next(filter.users) ~= nil

  return has_text or has_users
end

-- Czy pojedyncze zadanie przechodzi przez filtr.
function M.matches(issue, filter)
  if not filter then
    return true
  end

  local text = filter.text

  if text and text ~= "" then
    local summary = (issue.fields and issue.fields.summary) or ""
    local hay = ((issue.key or "") .. " " .. summary):lower()

    if not hay:find(text:lower(), 1, true) then
      return false
    end
  end

  local users = filter.users

  if users and next(users) then
    if not users[assignee_id(issue)] then
      return false
    end
  end

  return true
end

-- Zwraca nową listę zadań przepuszczonych przez filtr (bez mutacji wejścia).
function M.apply(issues, filter)
  if not M.is_active(filter) then
    return issues
  end

  local out = {}

  for _, issue in ipairs(issues) do
    if M.matches(issue, filter) then
      table.insert(out, issue)
    end
  end

  return out
end

-- Unikalna, posortowana lista użytkowników z zadań (do modala).
-- @param issue_lists  lista list zadań (board: 1, backlog: sprint + backlog)
-- @return lista { id, label, hl } — realni użytkownicy alfabetycznie,
--         „Nieprzypisane” na końcu.
function M.collect_users(issue_lists)
  local seen = {}
  local users = {}

  local function add(issue)
    local id = assignee_id(issue)

    if seen[id] then
      return
    end

    seen[id] = true

    local a = issue.fields and issue.fields.assignee

    if avatar.present(a) then
      table.insert(users, {
        id = id,
        label = a.displayName or a.name or a.emailAddress or id,
        hl = avatar.user_hl(a),
        order = 1,
      })
    else
      table.insert(users, { id = id, label = "Nieprzypisane", hl = "JiraDim", order = 2 })
    end
  end

  for _, list in ipairs(issue_lists) do
    for _, issue in ipairs(list) do
      add(issue)
    end
  end

  table.sort(users, function(x, y)
    if x.order ~= y.order then
      return x.order < y.order
    end

    return x.label:lower() < y.label:lower()
  end)

  return users
end

-- Krótki, ludzki opis aktywnego filtra (do stopki). "" gdy nieaktywny.
function M.describe(filter)
  if not M.is_active(filter) then
    return ""
  end

  local parts = {}

  if filter.text and filter.text ~= "" then
    table.insert(parts, "„" .. filter.text .. "”")
  end

  if filter.users and next(filter.users) then
    local n = 0

    for _ in pairs(filter.users) do
      n = n + 1
    end

    table.insert(parts, n .. (n == 1 and " os." or " os."))
  end

  return table.concat(parts, " · ")
end

-- Persystencja (delegowana do config, per-repo).
function M.load()
  return require("system.jira.config").get_filter()
end

function M.save(filter)
  require("system.jira.config").save_filter(filter)
end

return M
