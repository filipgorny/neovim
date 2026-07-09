-- Reużywalne komponenty renderujące dla UI Jiry.
--
-- Model: tekst stylowany reprezentujemy jako listę "spanów" — { text, hl }.
--   * span      = { text = "FOO-1", hl = "JiraKey" }
--   * span-line = lista spanów (jedna linia bufora)
--   * block     = lista span-linii
--
-- Renderer (M.render) skleja spany w linie bufora i nakłada highlighty przez
-- extmarki, licząc offsety w bajtach. Dzięki temu komponenty są czyste
-- (zwracają dane), a ekrany tylko je komponują — patrz board/task/backlog.

local M = {}

-- ---------------------------------------------------------------------------
-- Highlighty
-- ---------------------------------------------------------------------------

local did_hl = false

function M.setup_highlights()
  if did_hl then
    return
  end

  local hl = function(name, opts)
    opts.default = true
    pcall(vim.api.nvim_set_hl, 0, name, opts)
  end

  -- Paleta w duchu kanagawa (spójna, kolorowa, czytelna na ciemnym tle).
  local c = {
    blue = "#7e9cd8", blue2 = "#7fb4ca", green = "#98bb6c", yellow = "#e6c384",
    orange = "#ffa066", red = "#e82424", red2 = "#ff5d62", magenta = "#957fb8",
    cyan = "#7aa89f", fg = "#dcd7ba", dim = "#727169", border = "#54546d",
    ink = "#1f1f28", panel = "#2a2a37",
    chip_todo_bg = "#363646", chip_prog_bg = "#49443c", chip_done_bg = "#2b3328",
  }

  hl("JiraKey", { fg = c.blue, bold = true })
  hl("JiraTitle", { fg = c.fg, bold = true })
  hl("JiraDim", { fg = c.dim })
  hl("JiraBorder", { fg = c.border })
  hl("JiraColumnHeader", { fg = c.fg, bold = true })
  hl("JiraLabel", { fg = c.cyan })

  -- Zaznaczenie / kursor.
  hl("JiraSelected", { link = "Visual", bold = true })
  hl("JiraSelectedCard", { link = "Visual" })
  hl("JiraSelectedBar", { fg = c.green, bold = true })
  hl("JiraCursor", { link = "CursorLine" })
  hl("JiraCursorCard", { link = "CursorLine" })

  -- Podpowiedzi klawiszy.
  hl("JiraKeyhint", { fg = c.dim })
  hl("JiraKeyhintKey", { fg = c.ink, bg = c.blue2, bold = true })

  -- Zakładki.
  hl("JiraTabActive", { fg = c.ink, bg = c.blue, bold = true })
  hl("JiraTabInactive", { fg = c.dim })

  -- Statusy wg kategorii (todo / in progress / done) — tekst.
  hl("JiraStatusTodo", { fg = c.dim })
  hl("JiraStatusProgress", { fg = c.yellow, bold = true })
  hl("JiraStatusDone", { fg = c.green, bold = true })

  -- Statusy jako kolorowe chipy (z tłem).
  hl("JiraChipTodo", { fg = "#c8c093", bg = c.chip_todo_bg })
  hl("JiraChipProgress", { fg = c.yellow, bg = c.chip_prog_bg, bold = true })
  hl("JiraChipDone", { fg = c.green, bg = c.chip_done_bg, bold = true })

  -- Ikony typów zadań.
  hl("JiraTypeBug", { fg = c.red2 })
  hl("JiraTypeStory", { fg = c.green })
  hl("JiraTypeTask", { fg = c.blue2 })
  hl("JiraTypeEpic", { fg = c.magenta })
  hl("JiraTypeDefault", { fg = c.dim })

  -- Priorytety.
  hl("JiraPrioHigh", { fg = c.red2, bold = true })
  hl("JiraPrioMed", { fg = c.yellow })
  hl("JiraPrioLow", { fg = c.cyan })

  -- Story points (chip).
  hl("JiraPoints", { fg = c.ink, bg = c.magenta, bold = true })

  did_hl = true
end

-- ---------------------------------------------------------------------------
-- Pomocnicze: szerokości i skracanie (świadome szerokości wyświetlania)
-- ---------------------------------------------------------------------------

function M.dwidth(text)
  return vim.fn.strdisplaywidth(text)
end

-- Skraca tekst do `width` komórek wyświetlania, dokładając "…" jeśli ucięto.
function M.truncate(text, width)
  if width <= 0 then
    return ""
  end

  if M.dwidth(text) <= width then
    return text
  end

  local out = ""
  local w = 0
  for _, ch in ipairs(vim.fn.str2list(text)) do
    local s = vim.fn.nr2char(ch)
    local cw = vim.fn.strdisplaywidth(s)

    if w + cw > width - 1 then
      break
    end

    out = out .. s
    w = w + cw
  end

  return out .. "…"
end

-- ---------------------------------------------------------------------------
-- Konstruktory spanów
-- ---------------------------------------------------------------------------

function M.span(text, hl)
  return { text = text or "", hl = hl }
end

-- Suma szerokości wyświetlania span-linii.
local function line_width(spans)
  local w = 0
  for _, s in ipairs(spans) do
    w = w + M.dwidth(s.text)
  end
  return w
end

M.line_width = line_width

-- Dopełnia span-linię spacjami do dokładnie `width` komórek (albo skraca).
function M.pad_line(spans, width, fill_hl)
  local w = line_width(spans)

  if w == width then
    return spans
  end

  if w < width then
    local padded = vim.deepcopy(spans)
    table.insert(padded, M.span(string.rep(" ", width - w), fill_hl))
    return padded
  end

  -- Za szeroka — skróć ostatni span, który wystaje.
  local out = {}
  local acc = 0
  for _, s in ipairs(spans) do
    local sw = M.dwidth(s.text)

    if acc + sw <= width then
      table.insert(out, s)
      acc = acc + sw
    else
      local remaining = width - acc
      table.insert(out, M.span(M.truncate(s.text, remaining), s.hl))
      break
    end
  end

  return out
end

-- ---------------------------------------------------------------------------
-- Łączenie kolumn w poziomie (siatka kanbana)
-- ---------------------------------------------------------------------------

-- @param columns  lista kolumn; każda = lista span-linii (już własna sekwencja)
-- @param width    szerokość pojedynczej kolumny (komórki)
-- @param sep      span separatora między kolumnami (np. " │ ")
-- @return block   (lista span-linii)
function M.hjoin(columns, width, sep)
  sep = sep or M.span(" │ ", "JiraBorder")

  local height = 0
  for _, col in ipairs(columns) do
    height = math.max(height, #col)
  end

  local block = {}
  for row = 1, height do
    local spans = {}
    for ci, col in ipairs(columns) do
      if ci > 1 then
        table.insert(spans, sep)
      end

      local cell = col[row] or {}
      for _, s in ipairs(M.pad_line(cell, width)) do
        table.insert(spans, s)
      end
    end
    table.insert(block, spans)
  end

  return block
end

-- ---------------------------------------------------------------------------
-- Wysokopoziomowe komponenty
-- ---------------------------------------------------------------------------

-- Kolorowy badge (np. avatar-inicjały albo status). Zwraca span.
function M.badge(text, hl)
  return M.span(" " .. text .. " ", hl)
end

-- Mapa kategorii statusu -> highlight.
function M.status_hl(status)
  local cat = status and status.statusCategory and status.statusCategory.key or ""

  if cat == "done" then
    return "JiraStatusDone"
  elseif cat == "indeterminate" then
    return "JiraStatusProgress"
  end

  return "JiraStatusTodo"
end

-- Akcent kolumny kanbana wg nazwy (done/progress/todo).
function M.column_accent(name)
  local n = (name or ""):lower()

  if n:match("done") or n:match("closed") or n:match("resolved") or n:match("gotowe") then
    return "JiraStatusDone"
  elseif n:match("progress") or n:match("review") or n:match("doing") or n:match("trakcie") then
    return "JiraStatusProgress"
  end

  return "JiraColumnHeader"
end

-- Ikona typu zadania jako span (kolorowana wg typu). Używamy pewnych znaków
-- Unicode (glify nerd-font/PUA bywają gubione przy edycji plików).
function M.type_span(issuetype)
  local n = (issuetype and issuetype.name or ""):lower()

  if n:match("bug") then
    return M.span("▲", "JiraTypeBug")
  elseif n:match("story") then
    return M.span("●", "JiraTypeStory")
  elseif n:match("epic") then
    return M.span("◆", "JiraTypeEpic")
  elseif n:match("task") or n:match("sub") then
    return M.span("■", "JiraTypeTask")
  end

  return M.span("•", "JiraTypeDefault")
end

-- Status jako kolorowy chip (z tłem) — span.
function M.status_chip(status)
  local cat = status and status.statusCategory and status.statusCategory.key or ""
  local hl = "JiraChipTodo"

  if cat == "done" then
    hl = "JiraChipDone"
  elseif cat == "indeterminate" then
    hl = "JiraChipProgress"
  end

  return M.span(" " .. (status and status.name or "—") .. " ", hl)
end

function M.priority_hl(priority_name)
  local n = (priority_name or ""):lower()

  if n:match("highest") or n:match("high") or n:match("critical") or n:match("blocker") then
    return "JiraPrioHigh"
  elseif n:match("medium") then
    return "JiraPrioMed"
  end

  return "JiraPrioLow"
end

-- Linia podpowiedzi klawiszy w stopce: pairs = { {"j/k","ruch"}, ... }.
function M.keyhints(pairs_list)
  local spans = {}

  for i, pair in ipairs(pairs_list) do
    if i > 1 then
      table.insert(spans, M.span("   ", "JiraKeyhint"))
    end

    table.insert(spans, M.span(" " .. pair[1] .. " ", "JiraKeyhintKey"))
    table.insert(spans, M.span(" " .. pair[2], "JiraKeyhint"))
  end

  return spans
end

-- Pozioma linia (separator) na całą szerokość.
function M.hr(width, hl)
  return { M.span(string.rep("─", width), hl or "JiraBorder") }
end

-- ---------------------------------------------------------------------------
-- Picker w stylu Telescope (fallback: vim.ui.select).
-- @param items       lista elementów
-- @param opts        { prompt, format_item(item)->string }
-- @param on_choice   function(item)  (item = nil gdy anulowano)
function M.pick(items, opts, on_choice)
  opts = opts or {}

  local ok, pickers = pcall(require, "telescope.pickers")

  if not ok then
    vim.ui.select(items, {
      prompt = opts.prompt,
      format_item = opts.format_item,
    }, function(item) on_choice(item) end)
    return
  end

  local finders = require("telescope.finders")
  local conf = require("telescope.config").values
  local actions = require("telescope.actions")
  local action_state = require("telescope.actions.state")

  pickers.new({}, {
    prompt_title = opts.prompt or "Wybierz",
    finder = finders.new_table({
      results = items,
      entry_maker = function(item)
        local display = opts.format_item and opts.format_item(item) or tostring(item)
        return { value = item, display = display, ordinal = display }
      end,
    }),
    sorter = conf.generic_sorter({}),
    attach_mappings = function(bufnr)
      actions.select_default:replace(function()
        local sel = action_state.get_selected_entry()
        actions.close(bufnr)
        on_choice(sel and sel.value or nil)
      end)

      return true
    end,
  }):find()
end

-- ---------------------------------------------------------------------------
-- Renderer: block -> bufor + extmarki
-- ---------------------------------------------------------------------------

-- Renderuje block do bufora. Zwraca mapę: numer_linii(0-idx) -> szerokość.
-- @param line_meta  opcjonalna lista równoległa do block; meta[i] przypięte
--                   przez callera do własnych struktur (nie używane tutaj).
function M.render(bufnr, ns, block)
  local lines = {}
  local hl_ops = {} -- { row, col_start, col_end, hl }

  for row, spans in ipairs(block) do
    local text = ""
    local byte_col = 0

    for _, s in ipairs(spans) do
      local seg = s.text or ""
      text = text .. seg

      if s.hl and seg ~= "" then
        table.insert(hl_ops, {
          row = row - 1,
          col_start = byte_col,
          col_end = byte_col + #seg,
          hl = s.hl,
        })
      end

      byte_col = byte_col + #seg
    end

    table.insert(lines, text)
  end

  vim.api.nvim_buf_set_option(bufnr, "modifiable", true)
  vim.api.nvim_buf_set_lines(bufnr, 0, -1, false, lines)
  vim.api.nvim_buf_clear_namespace(bufnr, ns, 0, -1)

  for _, op in ipairs(hl_ops) do
    pcall(vim.api.nvim_buf_set_extmark, bufnr, ns, op.row, op.col_start, {
      end_col = op.col_end,
      hl_group = op.hl,
    })
  end

  vim.api.nvim_buf_set_option(bufnr, "modifiable", false)
end

return M
