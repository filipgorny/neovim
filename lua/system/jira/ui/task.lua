-- Ekran B: szczegół zadania z komentarzami i akcjami.
--
-- Układ zbliżony do Jiry: nagłówek, pasek pól (status/assignee/priorytet),
-- opis, akcje (przyciski) i lista komentarzy. Po wszystkich elementach
-- interaktywnych poruszamy się home-rowem (j/k), Enter aktywuje element.
--
-- Dostępne akcje: zmiana statusu, przypisanie do siebie, dodanie komentarza,
-- otwarcie w przeglądarce, odświeżenie.

local api = require("system.jira.api")
local components = require("system.jira.ui.components")
local avatar = require("system.jira.avatar")
local frame = require("system.jira.ui.frame")

local M = {}

local span = components.span

local state = nil
-- state = {
--   key, issue, comments = {},
--   focusables = { { line, activate = fn } },
--   focus = 1,
-- }

-- ---------------------------------------------------------------------------
-- Konwersja ADF/HTML -> zwykłe linie (best-effort)
-- ---------------------------------------------------------------------------

local function html_to_lines(html, width)
  if not html or html == "" then
    return { "—" }
  end

  local text = html
  text = text:gsub("</p>", "\n"):gsub("<br%s*/?>", "\n")
  text = text:gsub("<li>", "\n • "):gsub("</li>", "")
  text = text:gsub("<[^>]->", "")            -- usuń pozostałe tagi
  text = text:gsub("&nbsp;", " "):gsub("&amp;", "&")
  text = text:gsub("&lt;", "<"):gsub("&gt;", ">"):gsub("&quot;", "\"")

  local lines = {}
  for _, raw in ipairs(vim.split(text, "\n", { plain = true })) do
    raw = vim.trim(raw)

    if raw ~= "" then
      -- Zawijanie do szerokości.
      while components.dwidth(raw) > width do
        local cut = components.truncate(raw, width)
        cut = cut:gsub("…$", "")
        table.insert(lines, cut)
        raw = raw:sub(#cut + 1)
      end

      table.insert(lines, raw)
    end
  end

  if #lines == 0 then
    return { "—" }
  end

  return lines
end

-- ---------------------------------------------------------------------------
-- Renderowanie
-- ---------------------------------------------------------------------------

-- Buduje przycisk jako span; podświetlony gdy sfokusowany.
local function button(label, focused)
  local hl = focused and "JiraSelected" or "JiraKeyhintKey"
  return span(" [ " .. label .. " ] ", hl)
end

local function render()
  if not frame.is_open() or not state or not state.issue then
    return
  end

  local width = frame.state.width
  local f = state.issue.fields
  local block = {}
  local focusables = {}

  local function push(spans)
    table.insert(block, spans)
    return #block -- numer linii (1-idx)
  end

  push(frame.tabbar("task"))
  push({})

  -- Nagłówek
  push({
    span(state.issue.key .. "  ", "JiraKey"),
    span(components.truncate(f.summary or "", width - #state.issue.key - 4), "JiraTitle"),
  })
  push(components.hr(width))

  -- Pasek pól
  local status = f.status or {}
  local assignee_badge = avatar.badge(f.assignee)
  push({
    span("Status: ", "JiraDim"),
    span(status.name or "—", components.status_hl(status)),
    span("    Assignee: ", "JiraDim"),
    span(assignee_badge.text, assignee_badge.hl),
    span(" " .. (avatar.present(f.assignee) and f.assignee.displayName or "Nieprzypisane"),
      avatar.present(f.assignee) and avatar.user_hl(f.assignee) or nil),
    span("    Priorytet: ", "JiraDim"),
    span(f.priority and f.priority.name or "—", components.priority_hl(f.priority and f.priority.name)),
  })
  push({
    span("Typ: ", "JiraDim"),
    span(f.issuetype and f.issuetype.name or "—", nil),
    span("    Reporter: ", "JiraDim"),
    span(avatar.present(f.reporter) and f.reporter.displayName or "—",
      avatar.present(f.reporter) and avatar.user_hl(f.reporter) or nil),
    span("    Etykiety: ", "JiraDim"),
    span(#(f.labels or {}) > 0 and table.concat(f.labels, ", ") or "—", "JiraLabel"),
  })
  push(components.hr(width))

  -- Opis
  push({ span("Opis:", "JiraColumnHeader") })
  local desc_html = state.issue.renderedFields and state.issue.renderedFields.description
  for _, l in ipairs(html_to_lines(desc_html, width - 2)) do
    push({ span("  " .. l, nil) })
  end
  push(components.hr(width))

  -- Akcje (przyciski) — nawigowalne home-rowem
  local actions = {
    { label = "Zmień status", activate = M.action_change_status },
    { label = "Przypisz do mnie", activate = M.action_assign_me },
    { label = "Komentarz", activate = M.action_comment },
    { label = "Otwórz w przeglądarce", activate = M.action_open_browser },
    { label = "Odśwież", activate = M.reload },
  }

  local action_line = { span("Akcje:", "JiraColumnHeader"), span("  ", nil) }
  local action_line_no = #block + 1
  for i, a in ipairs(actions) do
    local focused = (#focusables + 1) == state.focus
    table.insert(action_line, button(a.label, focused))
    table.insert(focusables, { line = action_line_no, activate = a.activate })
    if i < #actions then
      table.insert(action_line, span(" ", nil))
    end
  end
  push(action_line)
  push(components.hr(width))

  -- Komentarze
  push({ span(string.format("Komentarze (%d):", #state.comments), "JiraColumnHeader") })
  push({})

  for _, c in ipairs(state.comments) do
    local ab = avatar.badge(c.author)
    push({
      span(ab.text, ab.hl),
      span(" " .. (avatar.present(c.author) and c.author.displayName or "?"),
        avatar.present(c.author) and avatar.user_hl(c.author) or "JiraTitle"),
      span("  · " .. (c.created and c.created:sub(1, 10) or ""), "JiraDim"),
    })

    for _, l in ipairs(html_to_lines(c.renderedBody or c.body, width - 4)) do
      push({ span("    " .. l, nil) })
    end

    push({})
  end

  -- Rozciągnij widok do dołu ramki (ostatni wiersz zostawiamy na przypiętą stopkę).
  while #block < frame.state.height - 1 do
    push({})
  end

  state.focusables = focusables

  frame.render(block)
  frame.set_footer({
    { "j/k", "przyciski" },
    { "enter", "wykonaj" },
    { "gb", "board" },
    { "Tab", "Board/Task/Backlog" },
    { "q/esc", "zamknij" },
  })

  local fitem = focusables[state.focus]
  if fitem then
    frame.set_cursor(fitem.line, 0)
  end
end

-- ---------------------------------------------------------------------------
-- Akcje
-- ---------------------------------------------------------------------------

function M.action_change_status()
  local key = state.key

  api.transitions(key, function(transitions, err)
    if err then
      return vim.notify("Jira: " .. err, vim.log.levels.ERROR)
    end

    if #transitions == 0 then
      return vim.notify("Jira: brak dostępnych przejść", vim.log.levels.WARN)
    end

    components.pick(transitions, {
      prompt = key .. " — zmień status",
      format_item = function(t)
        return "→ " .. (t.to and t.to.name or "?") .. "   (" .. t.name .. ")"
      end,
    }, function(t)
      if not t then
        return
      end

      api.transition(key, t.id, function(_, terr)
        if terr then
          return vim.notify("Jira: " .. terr, vim.log.levels.ERROR)
        end

        M.reload()
      end)
    end)
  end)
end

function M.action_assign_me()
  -- Bez pełnej listy userów: przypisanie do konta z poświadczeń przez email.
  local config = require("system.jira.config")
  local creds = config.credentials()

  if not creds then
    return
  end

  api.request("PUT", "/rest/api/3/issue/" .. state.key .. "/assignee",
    { accountId = state.issue.fields.reporter and nil }, function() end)

  -- Jira Cloud wymaga accountId; email nie wystarcza. Informujemy uczciwie.
  vim.notify("Przypisywanie wymaga accountId — otwórz w przeglądarce, jeśli trzeba.",
    vim.log.levels.INFO)
end

function M.action_comment()
  local ui = require("utils.ui")

  ui.input_window(" Nowy komentarz — " .. state.key, "> ", function(text)
    if not text or vim.trim(text) == "" then
      return
    end

    api.add_comment(state.key, text, function(_, err)
      if err then
        return vim.notify("Jira: " .. err, vim.log.levels.ERROR)
      end

      M.reload()
    end)
  end)
end

function M.action_open_browser()
  local config = require("system.jira.config")
  local creds = config.credentials()

  if not creds then
    return
  end

  local url = creds.base_url .. "/browse/" .. state.key
  local ok = pcall(vim.ui.open, url)

  if not ok then
    vim.fn.jobstart({ "xdg-open", url }, { detach = true })
  end
end

-- ---------------------------------------------------------------------------
-- Nawigacja
-- ---------------------------------------------------------------------------

local function move_focus(delta)
  if not state.focusables or #state.focusables == 0 then
    return
  end

  state.focus = ((state.focus - 1 + delta) % #state.focusables) + 1
  render()
end

local function activate()
  local item = state.focusables and state.focusables[state.focus]

  if item and item.activate then
    item.activate()
  end
end

local function bind_keys()
  frame.reset_screen_maps()

  frame.map("n", "j", function() move_focus(1) end)
  frame.map("n", "k", function() move_focus(-1) end)
  frame.map("n", "<Down>", function() move_focus(1) end)
  frame.map("n", "<Up>", function() move_focus(-1) end)
  frame.map("n", "<CR>", activate)
  frame.map("n", "gb", function() require("system.jira").show_board() end)
  frame.map("n", "r", function() M.reload() end)
  -- Esc/q zamykają (chrome ramki — reset_screen_maps).
  -- Swobodne scrollowanie treści.
  frame.map("n", "<C-d>", "<C-d>")
  frame.map("n", "<C-u>", "<C-u>")
end

-- ---------------------------------------------------------------------------
-- Dane
-- ---------------------------------------------------------------------------

function M.reload()
  if not state or not state.key then
    return
  end

  local key = state.key
  frame.render({ frame.tabbar("task"), {}, { span("  Ładowanie " .. key .. "…", "JiraDim") } })

  api.issue(key, function(issue, err)
    if err then
      frame.render({ frame.tabbar("task"), {}, { span("  Błąd: " .. err, "JiraPrioHigh") } })
      return
    end

    api.comments(key, function(comments, cerr)
      state.issue = issue
      state.comments = (not cerr and comments) or {}
      state.focus = state.focus or 1
      bind_keys()
      render()
    end)
  end)
end

function M.show(key)
  require("system.jira.config").save_last_screen("task", key)
  state = { key = key, issue = nil, comments = {}, focus = 1, focusables = {} }
  M.reload()
end

return M
