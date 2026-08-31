-- Ekran A: Kanban aktywnego sprintu.
--
-- Kolumny pobierane z konfiguracji boardu (mapowanie statusów -> kolumny),
-- zadania z aktywnego sprintu rozłożone po kolumnach wg statusu.
--
-- Nawigacja: strzałki / hjkl poruszają kursorem po kartach (kolumna × wiersz),
-- ekran scrolluje się za kursorem. Enter otwiera szczegół zadania. Zmiana
-- statusu to popup z dostępnymi tranzycjami (spacja / s) — po wyborze board
-- się odświeża i karta trafia do właściwej kolumny.

local api = require("system.jira.api")
local components = require("system.jira.ui.components")
local avatar = require("system.jira.avatar")
local frame = require("system.jira.ui.frame")
local filter = require("system.jira.filter")

local M = {}

local CARD_H = 4      -- fallback wysokości karty (realne wysokości liczymy dynamicznie)
local HEADER_H = 2    -- nagłówek kolumny (tytuł + linia)
local CHROME_TOP = 2  -- zakładki + odstęp nad siatką

local state = nil
-- state = {
--   board_id, sprint, columns = { {name, status_ids={}, cards={issue}} },
--   cur_col, cur_card,
-- }

local span = components.span

-- ---------------------------------------------------------------------------
-- Budowa modelu kolumn
-- ---------------------------------------------------------------------------

local function build_columns(board_config, issues)
  local cols = {}
  local by_status = {} -- status_id -> column index

  local col_conf = board_config
    and board_config.columnConfig
    and board_config.columnConfig.columns
    or {}

  for _, c in ipairs(col_conf) do
    local status_ids = {}
    for _, s in ipairs(c.statuses or {}) do
      status_ids[tostring(s.id)] = true
      by_status[tostring(s.id)] = #cols + 1
    end
    table.insert(cols, { name = c.name, status_ids = status_ids, cards = {} })
  end

  -- Fallback: brak konfiguracji kolumn -> grupuj po nazwie statusu.
  if #cols == 0 then
    local seen = {}
    for _, issue in ipairs(issues) do
      local sname = issue.fields.status and issue.fields.status.name or "—"

      if not seen[sname] then
        seen[sname] = #cols + 1
        table.insert(cols, { name = sname, status_ids = {}, cards = {} })
      end

      table.insert(cols[seen[sname]].cards, issue)
    end

    return cols
  end

  for _, issue in ipairs(issues) do
    local sid = issue.fields.status and tostring(issue.fields.status.id) or nil
    local ci = sid and by_status[sid] or 1
    table.insert(cols[ci].cards, issue)
  end

  return cols
end

-- ---------------------------------------------------------------------------
-- Renderowanie
-- ---------------------------------------------------------------------------

-- Zwraca block-listę span-linii dla jednej karty (wysokość zmienna — zależna
-- od długości zawiniętej treści zadania).
-- Karta pod kursorem jest podświetlana; pozostałe mają cienki akcent statusu.
local function render_card(issue, col_width, is_cursor)
  local f = issue.fields
  local inner = col_width - 2
  local bg = is_cursor and "JiraCursorCard" or nil

  local gutter, gutter_hl
  if is_cursor then
    gutter, gutter_hl = "▌ ", "JiraStatusProgress"
  else
    -- Cienki, kolorowy akcent statusu na krawędzi każdej karty.
    gutter, gutter_hl = "▏ ", components.status_hl(f.status)
  end

  local key_hl = is_cursor and "JiraSelected" or "JiraKey"
  local text_hl = is_cursor and "JiraTitle" or nil

  local type_ic = components.type_span(f.issuetype)

  local lines = {}

  -- Linia klucza + typu zadania.
  table.insert(lines, {
    span(gutter, gutter_hl),
    span(issue.key, key_hl),
    span("  ", bg),
    span(type_ic.text, bg or type_ic.hl),
  })

  -- Pełna treść zadania — zawinięta na tyle linii, ile trzeba (bez ucięcia).
  for _, wl in ipairs(components.wrap(f.summary or "", inner)) do
    table.insert(lines, {
      span("  ", bg),
      span(wl, text_hl),
    })
  end

  -- Linia przypisania (+ ewentualny priorytet).
  local assignee_name = avatar.present(f.assignee) and f.assignee.displayName or "Nieprzypisane"
  local badge = avatar.badge(f.assignee)
  local line_assignee = {
    span("  ", bg),
    span(badge.text, bg or badge.hl),
    span(" ", bg),
    span(components.truncate(assignee_name, inner - 8), bg or "JiraDim"),
  }

  if f.priority then
    table.insert(line_assignee, span("  ●", bg or components.priority_hl(f.priority.name)))
  end

  table.insert(lines, line_assignee)

  -- Dopełnij linie treści do pełnej szerokości kolumny (żeby tło kursora
  -- pokrywało całą kartę).
  for i, l in ipairs(lines) do
    lines[i] = components.pad_line(l, col_width, bg)
  end

  table.insert(lines, {}) -- pusta linia — odstęp między kartami

  return lines
end

-- Buforowa linia (1-idx) kotwicy karty (kolumna × karta). Karty mają zmienną
-- wysokość, więc sumujemy realne wysokości poprzednich kart w tej kolumnie.
local function card_anchor_line(col_index, card_index)
  local heights = state.card_heights and state.card_heights[col_index] or {}
  local offset = 0

  for i = 1, card_index - 1 do
    offset = offset + (heights[i] or CARD_H)
  end

  return CHROME_TOP + HEADER_H + offset + 1
end

local function render()
  if not frame.is_open() or not state then
    return
  end

  local width = frame.state.width
  local ncols = math.max(#state.columns, 1)
  local sep_w = 3
  local col_width = math.floor((width - (ncols - 1) * sep_w) / ncols)
  col_width = math.max(col_width, 16)

  -- Chrome: zakładki + odstęp.
  local block = {}
  table.insert(block, frame.tabbar("board"))
  table.insert(block, {})

  -- Każda kolumna -> lista span-linii (nagłówek + karty).
  local rendered_cols = {}
  local card_heights = {} -- [ci][cardi] = wysokość karty w liniach
  for ci, col in ipairs(state.columns) do
    local col_lines = {}

    local accent = components.column_accent(col.name)
    table.insert(col_lines, {
      span(components.truncate(col.name, col_width - 6), accent),
      span("  " .. #col.cards, "JiraDim"),
    })
    table.insert(col_lines, { span(string.rep("━", col_width), accent) })

    card_heights[ci] = {}

    for cardi, issue in ipairs(col.cards) do
      local is_cursor = (ci == state.cur_col and cardi == state.cur_card)
      local card = render_card(issue, col_width, is_cursor)

      card_heights[ci][cardi] = #card

      for _, l in ipairs(card) do
        table.insert(col_lines, l)
      end
    end

    rendered_cols[ci] = col_lines
  end

  state.card_heights = card_heights

  -- Rozciągnij kolumny do dołu ramki: dopełnij puste linie, żeby separatory
  -- kolumn ciągnęły się aż do spodu (chrome góra: CHROME_TOP; stopka: 2).
  local target_h = frame.state.height - CHROME_TOP - 2
  for _, col_lines in ipairs(rendered_cols) do
    while #col_lines < target_h do
      table.insert(col_lines, {})
    end
  end

  local grid = components.hjoin(rendered_cols, col_width, span(" │ ", "JiraBorder"))
  for _, l in ipairs(grid) do
    table.insert(block, l)
  end

  frame.render(block)

  local fdesc = filter.describe(state.filter)
  frame.set_footer({
    { "hjkl", "ruch" },
    { "space/s", "zmień status" },
    { "enter", "otwórz" },
    { "C-f", fdesc ~= "" and ("filtr: " .. fdesc) or "filtr" },
    { "Tab", "Board/Task/Backlog" },
    { "q", "zamknij" },
  })

  local anchor = card_anchor_line(state.cur_col, state.cur_card)
  frame.set_cursor(anchor, 0)
end

-- ---------------------------------------------------------------------------
-- Nawigacja i akcje
-- ---------------------------------------------------------------------------

local function current_issue()
  local col = state.columns[state.cur_col]
  return col and col.cards[state.cur_card]
end

local function clamp_cursor()
  state.cur_col = math.max(1, math.min(state.cur_col, #state.columns))
  local col = state.columns[state.cur_col]
  local n = col and #col.cards or 0
  state.cur_card = math.max(1, math.min(state.cur_card, math.max(n, 1)))
end

local function move(dcol, dcard)
  state.cur_col = state.cur_col + dcol
  state.cur_card = state.cur_card + dcard
  clamp_cursor()
  render()
end

-- Zmiana statusu karty pod kursorem = popup z dostępnymi tranzycjami.
local function change_status()
  local issue = current_issue()

  if not issue then
    return
  end

  api.transitions(issue.key, function(transitions, err)
    if err then
      return vim.notify("Jira: " .. err, vim.log.levels.ERROR)
    end

    if #transitions == 0 then
      return vim.notify("Jira: brak dostępnych przejść dla " .. issue.key, vim.log.levels.WARN)
    end

    components.pick(transitions, {
      prompt = issue.key .. " — zmień status",
      format_item = function(t)
        return "→ " .. (t.to and t.to.name or "?") .. "   (" .. t.name .. ")"
      end,
    }, function(t)
      if not t then
        return
      end

      api.transition(issue.key, t.id, function(_, terr)
        if terr then
          return vim.notify("Jira: " .. terr, vim.log.levels.ERROR)
        end

        M.reload()
      end)
    end)
  end)
end

-- Enter: otwórz szczegół zadania.
local function on_enter()
  local issue = current_issue()

  if issue then
    require("system.jira").show_task(issue.key, "board")
  end
end

-- Przelicza kolumny z zapamiętanych zadań wg bieżącego filtra (bez pobierania).
local function rebuild()
  if not state then
    return
  end

  state.columns = build_columns(state.board_config, filter.apply(state.all_issues, state.filter))
  clamp_cursor()
  render()
end

-- Ctrl+F: modal filtrowania (tekst + użytkownicy). Zapis i przeliczenie w callbacku.
local function open_filter()
  if not state then
    return
  end

  require("system.jira.ui.filter_modal").open({
    title = "Filtr — Sprint Board",
    text = state.filter.text,
    selected = state.filter.users,
    users = filter.collect_users({ state.all_issues }),
    on_apply = function(result)
      state.filter = { text = result.text, users = result.selected }
      filter.save(state.filter)
      rebuild()
    end,
  })
end

-- ---------------------------------------------------------------------------
-- Montaż / dane
-- ---------------------------------------------------------------------------

local function bind_keys()
  frame.reset_screen_maps()

  local maps = {
    ["<Left>"] = function() move(-1, 0) end,
    ["h"] = function() move(-1, 0) end,
    ["<Right>"] = function() move(1, 0) end,
    ["l"] = function() move(1, 0) end,
    ["<Up>"] = function() move(0, -1) end,
    ["k"] = function() move(0, -1) end,
    ["<Down>"] = function() move(0, 1) end,
    ["j"] = function() move(0, 1) end,
    ["<Space>"] = change_status,
    ["s"] = change_status,
    ["<CR>"] = on_enter,
    ["<C-f>"] = open_filter,
    ["r"] = function() M.reload() end,
  }

  for lhs, fn in pairs(maps) do
    frame.map("n", lhs, fn)
  end
end

function M.reload()
  local config = require("system.jira.config")
  local board_id = config.board_id()

  if not board_id then
    return
  end

  frame.render({ frame.tabbar("board"), {}, { span("  Ładowanie sprintu…", "JiraDim") } })

  api.active_sprint(board_id, function(sprint, err)
    if err then
      frame.render({ frame.tabbar("board"), {}, { span("  Błąd: " .. err, "JiraPrioHigh") } })
      return
    end

    if not sprint then
      frame.render({
        frame.tabbar("board"), {},
        { span("  Brak aktywnego sprintu na tym boardzie.", "JiraDim") },
      })
      return
    end

    api.board_config(board_id, function(board_config, cerr)
      if cerr then
        board_config = nil
      end

      api.sprint_issues(board_id, sprint.id, function(issues, ierr)
        if ierr then
          frame.render({ frame.tabbar("board"), {}, { span("  Błąd: " .. ierr, "JiraPrioHigh") } })
          return
        end

        -- Zachowaj pozycję kursora między odświeżeniami (np. po zmianie statusu).
        local prev = state or {}
        local active_filter = filter.load()
        state = {
          board_id = board_id,
          sprint = sprint,
          board_config = board_config,
          all_issues = issues,
          filter = active_filter,
          columns = build_columns(board_config, filter.apply(issues, active_filter)),
          cur_col = prev.cur_col or 1,
          cur_card = prev.cur_card or 1,
        }
        clamp_cursor()
        bind_keys()
        render()
      end)
    end)
  end)
end

function M.show()
  require("system.jira.config").save_last_screen("board")
  M.reload()
end

return M
