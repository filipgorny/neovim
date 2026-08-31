-- Ekran C: Backlog.
--
-- Na górze zadania z bieżącego sprintu, na dole kolejka backlogu.
-- Można dorzucić zadanie z backlogu do aktywnego sprintu (klawisz `a`
-- lub Enter na pozycji z backlogu). Enter na pozycji ze sprintu otwiera
-- szczegół zadania.

local api = require("system.jira.api")
local components = require("system.jira.ui.components")
local avatar = require("system.jira.avatar")
local frame = require("system.jira.ui.frame")
local filter = require("system.jira.filter")

local M = {}

local span = components.span

local state = nil
-- state = {
--   board_id, sprint, sp_field (id pola Story Points | nil),
--   sprint_issues = {}, backlog_issues = {},
--   items = { { issue, section } },   -- płaska lista nawigowalna
--   cursor = 1,
-- }

-- Wartość Story Points zadania (liczba) albo nil.
local function story_points(f)
  if not state or not state.sp_field then
    return nil
  end

  local v = f[state.sp_field]
  return type(v) == "number" and v or nil
end

local function issue_row(issue, is_cursor)
  local f = issue.fields
  local badge = avatar.badge(f.assignee)
  local width = frame.state.width
  local status = f.status or {}

  local gutter = is_cursor and "▌ " or "▏ "
  local gutter_hl = is_cursor and "JiraStatusProgress" or components.status_hl(status)
  local key_hl = is_cursor and "JiraSelected" or "JiraKey"

  -- Prawa kolumna (wyrównana do prawej): story points + status.
  local right = {}
  local sp = story_points(f)

  if sp then
    local txt = sp == math.floor(sp) and tostring(math.floor(sp)) or tostring(sp)
    table.insert(right, span(" " .. txt .. " SP ", "JiraPoints"))
    table.insert(right, span(" ", nil))
  end

  table.insert(right, components.status_chip(status))
  local right_w = components.line_width(right)

  -- Lewa część: gutter, klucz, avatar, podsumowanie.
  local left = {
    span(gutter, gutter_hl),
    span(string.format("%-9s ", issue.key), key_hl),
    span(badge.text, badge.hl),
    span(" ", nil),
  }
  local sum_max = width - components.line_width(left) - right_w - 2
  table.insert(left, span(components.truncate(f.summary or "", math.max(sum_max, 4)),
    is_cursor and "JiraTitle" or nil))

  -- Wypełnienie między lewą a prawą kolumną (podświetlone przy kursorze).
  local filler = width - components.line_width(left) - right_w
  table.insert(left, span(string.rep(" ", math.max(filler, 1)), is_cursor and "JiraCursorCard" or nil))

  for _, s in ipairs(right) do
    table.insert(left, s)
  end

  return left
end

local function build_items()
  local items = {}

  for _, issue in ipairs(state.sprint_issues) do
    table.insert(items, { issue = issue, section = "sprint" })
  end

  for _, issue in ipairs(state.backlog_issues) do
    table.insert(items, { issue = issue, section = "backlog" })
  end

  state.items = items
  state.cursor = math.max(1, math.min(state.cursor or 1, math.max(#items, 1)))
end

local function render()
  if not frame.is_open() or not state then
    return
  end

  local width = frame.state.width
  local block = {}
  local item_lines = {} -- item_index -> buffer line (1-idx)
  local idx = 0

  table.insert(block, frame.tabbar("backlog"))
  table.insert(block, {})

  local sprint_name = state.sprint and state.sprint.name or "Sprint"
  table.insert(block, {
    span(string.format("● %s  (%d)", sprint_name, #state.sprint_issues), "JiraColumnHeader"),
  })
  table.insert(block, components.hr(width))

  for _, issue in ipairs(state.sprint_issues) do
    idx = idx + 1
    table.insert(block, issue_row(issue, idx == state.cursor, "sprint"))
    item_lines[idx] = #block
  end

  if #state.sprint_issues == 0 then
    table.insert(block, { span("  (pusto)", "JiraDim") })
  end

  table.insert(block, {})
  table.insert(block, {
    span(string.format("▽ Backlog  (%d)", #state.backlog_issues), "JiraColumnHeader"),
  })
  table.insert(block, components.hr(width))

  for _, issue in ipairs(state.backlog_issues) do
    idx = idx + 1
    table.insert(block, issue_row(issue, idx == state.cursor, "backlog"))
    item_lines[idx] = #block
  end

  if #state.backlog_issues == 0 then
    table.insert(block, { span("  (pusto)", "JiraDim") })
  end

  -- Rozciągnij do dołu ramki (ostatni wiersz zostaje na przypiętą stopkę).
  while #block < frame.state.height - 1 do
    table.insert(block, {})
  end

  frame.render(block)

  local fdesc = filter.describe(state.filter)
  frame.set_footer({
    { "j/k", "ruch" },
    { "a", "dodaj do sprintu" },
    { "enter", "otwórz/dodaj" },
    { "C-f", fdesc ~= "" and ("filtr: " .. fdesc) or "filtr" },
    { "Tab", "Board/Task/Backlog" },
    { "q/esc", "zamknij" },
  })

  local line = item_lines[state.cursor]
  if line then
    frame.set_cursor(line, 0)
  end
end

local function current_item()
  return state.items and state.items[state.cursor]
end

local function move(delta)
  if not state.items or #state.items == 0 then
    return
  end

  state.cursor = math.max(1, math.min(state.cursor + delta, #state.items))
  render()
end

local function add_to_sprint()
  local item = current_item()

  if not item or item.section ~= "backlog" then
    vim.notify("Zaznacz zadanie z backlogu, żeby dodać je do sprintu.", vim.log.levels.INFO)
    return
  end

  if not state.sprint then
    vim.notify("Brak aktywnego sprintu.", vim.log.levels.WARN)
    return
  end

  local key = item.issue.key
  api.move_to_sprint(state.sprint.id, { key }, function(_, err)
    if err then
      return vim.notify("Jira: " .. err, vim.log.levels.ERROR)
    end

    vim.notify("Dodano " .. key .. " do sprintu " .. state.sprint.name, vim.log.levels.INFO)
    M.reload()
  end)
end

local function on_enter()
  local item = current_item()

  if not item then
    return
  end

  if item.section == "backlog" then
    add_to_sprint()
  else
    require("system.jira").show_task(item.issue.key, "backlog")
  end
end

-- Przelicza listy wg bieżącego filtra z zapamiętanych zadań (bez pobierania).
local function rebuild()
  if not state then
    return
  end

  state.sprint_issues = filter.apply(state.all_sprint, state.filter)
  state.backlog_issues = filter.apply(state.all_backlog, state.filter)
  build_items()
  render()
end

-- Ctrl+F: modal filtrowania (tekst + użytkownicy). Zapis i przeliczenie w callbacku.
local function open_filter()
  if not state then
    return
  end

  require("system.jira.ui.filter_modal").open({
    title = "Filtr — Backlog",
    text = state.filter.text,
    selected = state.filter.users,
    users = filter.collect_users({ state.all_sprint, state.all_backlog }),
    on_apply = function(result)
      state.filter = { text = result.text, users = result.selected }
      filter.save(state.filter)
      rebuild()
    end,
  })
end

local function bind_keys()
  frame.reset_screen_maps()

  frame.map("n", "j", function() move(1) end)
  frame.map("n", "k", function() move(-1) end)
  frame.map("n", "<Down>", function() move(1) end)
  frame.map("n", "<Up>", function() move(-1) end)
  frame.map("n", "a", add_to_sprint)
  frame.map("n", "<CR>", on_enter)
  frame.map("n", "<C-f>", open_filter)
  frame.map("n", "r", function() M.reload() end)
end

function M.reload()
  local config = require("system.jira.config")
  local board_id = config.board_id()

  if not board_id then
    return
  end

  frame.render({ frame.tabbar("backlog"), {}, { span("  Ładowanie backlogu…", "JiraDim") } })

  -- Rozwiąż (raz, cache) pole Story Points, potem pobierz sprint i backlog.
  api.story_points_field(function(sp_field)
    api.active_sprint(board_id, function(sprint, serr)
      local sprint_issues = {}

      local function load_backlog()
        api.backlog_issues(board_id, function(backlog, berr)
          if berr then
            frame.render({ frame.tabbar("backlog"), {}, { span("  Błąd: " .. berr, "JiraPrioHigh") } })
            return
          end

          local active_filter = filter.load()
          local all_backlog = backlog or {}
          state = {
            board_id = board_id,
            sprint = sprint,
            sp_field = sp_field,
            filter = active_filter,
            all_sprint = sprint_issues,
            all_backlog = all_backlog,
            sprint_issues = filter.apply(sprint_issues, active_filter),
            backlog_issues = filter.apply(all_backlog, active_filter),
            cursor = state and state.cursor or 1,
          }
          build_items()
          bind_keys()
          render()
        end)
      end

      if sprint and not serr then
        api.sprint_issues(board_id, sprint.id, function(issues)
          sprint_issues = issues or {}
          load_backlog()
        end)
      else
        load_backlog()
      end
    end)
  end)
end

function M.show()
  require("system.jira.config").save_last_screen("backlog")
  M.reload()
end

return M
