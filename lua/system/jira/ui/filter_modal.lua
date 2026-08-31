-- Reużywalny modal filtrowania (Ctrl+F na boardzie i w backlogu).
--
-- Pływające okienko z dwiema strefami:
--   1. Pole tekstowe — wpisywany string zawęża po '%tekst%' (klucz + summary).
--   2. Lista checkboxów użytkowników — Space zaznacza; brak zaznaczeń = wszyscy.
--
-- Sterowanie:
--   * pisanie          — wpisuje do pola tekstowego (fokus wraca na pole)
--   * Backspace / C-u  — kasuje znak / całe pole
--   * Up/Down, Tab     — przełącza fokus (pole -> użytkownicy)
--   * Space            — na użytkowniku: zaznacz; na polu: wstaw spację
--   * Enter            — zatwierdź (zapis robi caller w on_apply)
--   * Esc / C-c        — anuluj
--
-- Modal jest neutralny: nie wie skąd są dane. Caller podaje listę użytkowników
-- i callback on_apply({ text, selected }). Patrz board.lua / backlog.lua.

local components = require("system.jira.ui.components")

local M = {}

local span = components.span

local state = nil
-- state = {
--   buf, win, ns, width,
--   text, users = { {id,label,hl} }, checked = { [id]=true },
--   focus = 0 (pole) | 1..#users,
--   on_apply,
-- }

-- Polskie litery (wielobajtowe) — mapujemy osobno, bo pętla po bajtach 33..126
-- ich nie obejmuje.
local POLISH = {
  "ą", "ć", "ę", "ł", "ń", "ó", "ś", "ź", "ż",
  "Ą", "Ć", "Ę", "Ł", "Ń", "Ó", "Ś", "Ź", "Ż",
}

-- Wiersze bufora: 1=hint, 2=pole, 3=pusto, 4=hint, 5..=użytkownicy, koniec=hint.
local FIELD_LINE = 2
local USERS_START = 5

local function close()
  if state and state.win and vim.api.nvim_win_is_valid(state.win) then
    vim.api.nvim_win_close(state.win, true)
  end

  state = nil
end

local function render()
  if not state then
    return
  end

  local block = {}

  -- Pole wyszukiwania (kursorek tylko gdy fokus na polu).
  local on_field = state.focus == 0
  local caret = on_field and "▏" or ""

  table.insert(block, { span("  Filtruj po frazie:", "JiraDim") })
  table.insert(block, {
    span("  ", nil),
    span(state.text .. caret, on_field and "JiraTitle" or "JiraKey"),
  })
  table.insert(block, {})
  table.insert(block, { span("  Użytkownicy  (Space = zaznacz; brak = wszyscy)", "JiraDim") })

  for i, u in ipairs(state.users) do
    local is_focus = state.focus == i
    local on = state.checked[u.id]

    table.insert(block, {
      span(is_focus and "▌ " or "  ", is_focus and "JiraStatusProgress" or nil),
      span(on and "[x] " or "[ ] ", on and "JiraStatusDone" or "JiraDim"),
      span(u.label, is_focus and "JiraTitle" or u.hl),
    })
  end

  if #state.users == 0 then
    table.insert(block, { span("  (brak użytkowników w zadaniach)", "JiraDim") })
  end

  table.insert(block, {})
  table.insert(block, {
    span(" Enter ", "JiraKeyhintKey"), span(" zastosuj   ", "JiraKeyhint"),
    span(" Esc ", "JiraKeyhintKey"), span(" anuluj   ", "JiraKeyhint"),
    span(" C-u ", "JiraKeyhintKey"), span(" wyczyść", "JiraKeyhint"),
  })

  components.render(state.buf, state.ns, block)

  -- Kursor na aktywnym wierszu.
  local line = on_field and FIELD_LINE or (USERS_START + state.focus - 1)
  local total = vim.api.nvim_buf_line_count(state.buf)
  pcall(vim.api.nvim_win_set_cursor, state.win, { math.min(line, total), 0 })
end

local function set_focus(f)
  state.focus = math.max(0, math.min(f, #state.users))
  render()
end

local function type_str(s)
  state.text = state.text .. s
  state.focus = 0
  render()
end

local function backspace()
  local n = vim.fn.strchars(state.text)
  state.text = vim.fn.strcharpart(state.text, 0, math.max(0, n - 1))
  state.focus = 0
  render()
end

-- Space: na użytkowniku zaznacza, na polu wstawia spację.
local function on_space()
  if state.focus >= 1 then
    local u = state.users[state.focus]

    if state.checked[u.id] then
      state.checked[u.id] = nil
    else
      state.checked[u.id] = true
    end

    render()
  else
    type_str(" ")
  end
end

local function apply()
  local result = { text = vim.trim(state.text), selected = state.checked }
  local cb = state.on_apply

  close()

  if cb then
    cb(result)
  end
end

local function map(lhs, fn)
  vim.keymap.set("n", lhs, fn, { buffer = state.buf, nowait = true, silent = true })
end

local function bind_keys()
  -- Nawigacja fokusu (bez liter — te trafiają do pola tekstowego).
  map("<Down>", function() set_focus(state.focus + 1) end)
  map("<Up>", function() set_focus(state.focus - 1) end)
  map("<Tab>", function() set_focus(state.focus + 1) end)
  map("<S-Tab>", function() set_focus(state.focus - 1) end)
  map("<C-n>", function() set_focus(state.focus + 1) end)
  map("<C-p>", function() set_focus(state.focus - 1) end)

  -- Edycja pola.
  map("<Space>", on_space)
  map("<BS>", backspace)
  map("<C-u>", function() state.text = "" state.focus = 0 render() end)

  -- Akcje.
  map("<CR>", apply)
  map("<Esc>", close)
  map("<C-c>", close)

  -- Znaki drukowalne ASCII (33..126, spacja obsłużona osobno).
  for b = 33, 126 do
    local ch = string.char(b)
    local lhs = ch == "<" and "<lt>" or ch

    map(lhs, function() type_str(ch) end)
  end

  -- Polskie litery.
  for _, ch in ipairs(POLISH) do
    map(ch, function() type_str(ch) end)
  end
end

-- @param opts { title, text, users = {{id,label,hl}}, selected = {[id]=true},
--               on_apply = function({ text, selected }) }
function M.open(opts)
  opts = opts or {}

  if state then
    close()
  end

  local users = opts.users or {}

  local checked = {}
  for id, on in pairs(opts.selected or {}) do
    if on then
      checked[id] = true
    end
  end

  local width = math.min(60, math.max(40, math.floor(vim.o.columns * 0.5)))
  local content_h = USERS_START - 1 + math.max(#users, 1) + 2
  local height = math.min(content_h, math.floor(vim.o.lines * 0.8))
  local row = math.floor((vim.o.lines - height) / 2)
  local col = math.floor((vim.o.columns - width) / 2)

  local buf = vim.api.nvim_create_buf(false, true)
  vim.api.nvim_buf_set_option(buf, "bufhidden", "wipe")
  vim.api.nvim_buf_set_option(buf, "buftype", "nofile")

  local win = vim.api.nvim_open_win(buf, true, {
    relative = "editor",
    width = width,
    height = height,
    row = row,
    col = col,
    style = "minimal",
    border = "rounded",
    title = " " .. (opts.title or "Filtr") .. " ",
    title_pos = "center",
    zindex = 200,
  })

  vim.api.nvim_win_set_option(win, "wrap", false)
  vim.api.nvim_win_set_option(win, "cursorline", false)
  vim.api.nvim_win_set_option(win, "winhl", "Normal:NormalFloat,FloatBorder:JiraBorder")

  components.setup_highlights()

  state = {
    buf = buf,
    win = win,
    ns = vim.api.nvim_create_namespace("jira_filter_modal"),
    width = width,
    text = opts.text or "",
    users = users,
    checked = checked,
    focus = 0,
    on_apply = opts.on_apply,
  }

  bind_keys()

  -- Sprzątanie stanu przy zamknięciu okna z zewnątrz.
  vim.api.nvim_create_autocmd("WinClosed", {
    pattern = tostring(win),
    once = true,
    callback = function()
      state = nil
    end,
  })

  render()
end

return M
