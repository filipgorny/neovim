-- Pytania agenta z listą odpowiedzi do wyboru (Claude: AskUserQuestion).
--
-- Gdy model potrzebuje decyzji użytkownika, zamiast pisać "nie mam
-- potwierdzenia" woła narzędzie AskUserQuestion. Provider zamienia je na
-- zdarzenie { kind = "question", questions = {...} }, a ten moduł renderuje w
-- logu czatu blok wyróżniony innym tłem:
--
--   j / k (albo strzałki) — przesuwanie zaznaczenia
--   1-9                   — wybór odpowiedzi skrótem (od razu zatwierdza)
--   <Space>               — zaznacz/odznacz (pytania wielokrotnego wyboru)
--   <CR>                  — zatwierdź, <Esc>/q — anuluj
--
-- Wybór wraca do rdzenia przez on_done(text) i leci jako kolejna wiadomość
-- tury — kontekst trzyma id sesji (--resume, patrz providers/claude.lua).

local M = {}

local ns = vim.api.nvim_create_namespace("agent_question")

-- Aktywne pytanie albo nil, gdy nic nie czeka na odpowiedź.
local active = nil

function M.setup_highlights()
  local hl = vim.api.nvim_set_hl
  -- Tło bloku pytania — wyraźnie inne niż reszta logu.
  hl(0, "AgentQuestionBg", { bg = "#1f2335", fg = "#a9b1d6" })
  hl(0, "AgentQuestionTitle", { bg = "#1f2335", fg = "#7dcfff", bold = true })
  hl(0, "AgentQuestionActive", { bg = "#3b4261", fg = "#c0caf5", bold = true })
  hl(0, "AgentQuestionKey", { fg = "#e0af68", bold = true })
  hl(0, "AgentQuestionHint", { bg = "#1f2335", fg = "#565f89", italic = true })
  hl(0, "AgentQuestionDone", { fg = "#9ece6a", bold = true })
end

function M.is_active()
  return active ~= nil
end

---------------------------------------------------------------------------
-- Render bloku pytania
---------------------------------------------------------------------------

local function current()
  return active.questions[active.qi]
end

-- Buduje linie bloku i mapę: indeks opcji -> zakres linii (1-indeks w bloku).
local function build_lines()
  local q = current()
  local lines = {}
  local rows = {}
  local hints = {}

  local head = "  " .. (q.header or "Pytanie")

  if #active.questions > 1 then
    head = head .. ("   %d/%d"):format(active.qi, #active.questions)
  end

  table.insert(lines, head)

  for _, l in ipairs(vim.split(q.question or "", "\n", { plain = true })) do
    table.insert(lines, "  " .. l)
  end

  table.insert(lines, "")

  for i, opt in ipairs(q.options) do
    local mark = " "

    if q.multiSelect then
      mark = active.selected[i] and "" or ""
    elseif active.cursor == i then
      mark = "▸"
    end

    local first = #lines + 1
    table.insert(lines, ("  %s %d  %s"):format(mark, i, opt.label or ""))

    if opt.description and opt.description ~= "" then
      for _, l in ipairs(vim.split(opt.description, "\n", { plain = true })) do
        table.insert(lines, "       " .. l)
      end
    end

    rows[i] = { first = first, last = #lines }
  end

  table.insert(lines, "")

  local hint = q.multiSelect
    and "  j/k wybór · 1-9 lub ␣ zaznacz · ⏎ zatwierdź · esc anuluj"
    or "  j/k wybór · 1-9 skrót · ⏎ zatwierdź · esc anuluj"

  table.insert(lines, hint)
  hints[#lines] = true

  return lines, rows, hints
end

-- Ustawia górę widoku na pierwszą linię bloku — ale tylko wtedy, gdy cały blok
-- mieści się w oknie. Inaczej Neovim i tak przewinąłby z powrotem do kursora
-- (kursor musi być widoczny), a my zafundowalibyśmy sobie migotanie.
local function anchor_top()
  local win = active.win

  if not (win and vim.api.nvim_win_is_valid(win)) then return end

  local ok, h = pcall(function()
    return vim.api.nvim_win_text_height(win, { start_row = active.first0 }).all
  end)

  if not ok or type(h) ~= "number" then return end

  if h > vim.api.nvim_win_get_height(win) then return end

  pcall(vim.api.nvim_win_call, win, function()
    vim.fn.winrestview({ topline = active.first0 + 1 })
  end)
end

-- Przepisuje blok w miejscu (od active.first0 do końca bufora) i maluje tła.
local function render()
  local buf = active.buf

  if not vim.api.nvim_buf_is_valid(buf) then return end

  local lines, rows, hints = build_lines()

  vim.bo[buf].modifiable = true
  vim.api.nvim_buf_set_lines(buf, active.first0, -1, false, lines)
  vim.bo[buf].modifiable = false

  vim.api.nvim_buf_clear_namespace(buf, ns, active.first0, -1)

  local sel = rows[active.cursor]

  for i = 1, #lines do
    local line0 = active.first0 + i - 1
    local group = "AgentQuestionBg"

    if i == 1 then
      group = "AgentQuestionTitle"
    elseif hints[i] then
      group = "AgentQuestionHint"
    elseif sel and i >= sel.first and i <= sel.last then
      group = "AgentQuestionActive"
    end

    pcall(vim.api.nvim_buf_set_extmark, buf, ns, line0, 0, {
      line_hl_group = group,
      priority = 300,
    })
  end

  -- Numer odpowiedzi na żółto — czytelny skrót klawiszowy.
  for _, r in pairs(rows) do
    local line0 = active.first0 + r.first - 1
    local text = lines[r.first]
    local s, e = text:find("%d+", 4)

    if s then
      pcall(vim.api.nvim_buf_set_extmark, buf, ns, line0, s - 1, {
        end_col = e,
        hl_group = "AgentQuestionKey",
        priority = 350,
      })
    end
  end

  if active.on_render then
    pcall(active.on_render, #lines)
  end

  if sel and active.win and vim.api.nvim_win_is_valid(active.win) then
    pcall(vim.api.nvim_win_set_cursor, active.win, { active.first0 + sel.first, 0 })

    -- Kursor na opcji przewijał widok tak, że nagłówek i treść pytania
    -- wyjeżdżały ponad górną krawędź — zostawała naga lista odpowiedzi.
    -- Gdy cały blok mieści się w oknie, dociągamy widok do jego pierwszej
    -- linii, żeby pytanie było widać razem z opcjami.
    anchor_top()
  end
end

---------------------------------------------------------------------------
-- Klawiszologia
---------------------------------------------------------------------------

local mapped = {}

local function unmap()
  for _, lhs in ipairs(mapped) do
    pcall(vim.keymap.del, "n", lhs, { buffer = active.buf })
  end

  mapped = {}
end

local function map(lhs, fn)
  vim.keymap.set("n", lhs, fn, { buffer = active.buf, nowait = true, silent = true })
  table.insert(mapped, lhs)
end

-- Zamyka blok pytania: zostawia jedną linię z podsumowaniem wyboru. Gdy blok
-- ma własny bufor (okienko wpisywania), podsumowanie oddajemy wołającemu —
-- ląduje w logu czatu, a bufor pytania i tak zaraz zniknie z okna.
local function collapse(summary, group)
  local buf = active.buf

  if active.own_buf then
    if active.on_summary then
      pcall(active.on_summary, summary, group)
    end

    return
  end

  if vim.api.nvim_buf_is_valid(buf) then
    vim.bo[buf].modifiable = true
    vim.api.nvim_buf_set_lines(buf, active.first0, -1, false, { summary })
    vim.bo[buf].modifiable = false

    vim.api.nvim_buf_clear_namespace(buf, ns, active.first0, -1)
    pcall(vim.api.nvim_buf_set_extmark, buf, ns, active.first0, 0, {
      line_hl_group = group,
      priority = 300,
    })
  end
end

local function finish()
  local ctx = active
  unmap()
  active = nil

  if ctx.on_close then
    pcall(ctx.on_close)
  end

  return ctx
end

local function cancel()
  local q = current()
  collapse(("  %s anulowano: %s"):format("", q.header or "pytanie"), "AgentDim")

  local ctx = finish()

  if ctx.on_cancel then
    ctx.on_cancel()
  end
end

-- Zbiera WYBRANE OPCJE bieżącego pytania (tabele, nie same etykiety) — dzięki
-- temu wołający może zareagować na pole `value`, a nie parsować tekst.
local function chosen_options()
  local q = current()
  local out = {}

  if q.multiSelect then
    for i, opt in ipairs(q.options) do
      if active.selected[i] then
        table.insert(out, opt)
      end
    end
  else
    local opt = q.options[active.cursor]

    if opt then
      table.insert(out, opt)
    end
  end

  return out
end

local function next_question()
  local opts = chosen_options()

  if #opts == 0 then
    vim.notify("Agent: nie wybrano żadnej odpowiedzi", vim.log.levels.WARN)
    return
  end

  local labels = vim.tbl_map(function(o) return o.label or "?" end, opts)

  local q = current()
  table.insert(active.answers, {
    question = q.question or q.header or "?",
    answer = table.concat(labels, ", "),
    options = opts,
  })

  -- W logu zostaje jedna linia — z TREŚCIĄ pytania, nie samym nagłówkiem,
  -- inaczej po odpowiedzi nie widać, o co właściwie agent pytał.
  local asked = (q.question or q.header or "wybór"):gsub("%s+", " ")

  if vim.fn.strchars(asked) > 100 then
    asked = vim.fn.strcharpart(asked, 0, 97) .. "..."
  end

  collapse(("   %s → %s"):format(asked, table.concat(labels, ", ")), "AgentQuestionDone")

  if active.qi < #active.questions then
    active.qi = active.qi + 1
    active.cursor = 1
    active.selected = {}
    active.first0 = active.own_buf and 0 or vim.api.nvim_buf_line_count(active.buf)
    render()
    return
  end

  local ctx = finish()
  local parts = { "Odpowiedzi na Twoje pytania:" }

  for _, a in ipairs(ctx.answers) do
    table.insert(parts, ("- %s → %s"):format(a.question, a.answer))
  end

  -- Drugi argument: struktura odpowiedzi (z tabelami opcji) dla wołających,
  -- którzy potrzebują decyzji maszynowo — np. permission.lua czyta `value`.
  ctx.on_done(table.concat(parts, "\n"), ctx.answers)
end

local function move(delta)
  local n = #current().options
  active.cursor = ((active.cursor - 1 + delta) % n) + 1
  render()
end

local function hit(i)
  if i > #current().options then return end

  active.cursor = i

  if current().multiSelect then
    active.selected[i] = not active.selected[i] or nil
    render()
    return
  end

  next_question()
end

---------------------------------------------------------------------------
-- Wejście publiczne
---------------------------------------------------------------------------

-- Fallback, gdy panel czatu jest zamknięty — zwykły picker Neovima.
local function ask_via_select(questions, on_done, on_cancel)
  local answers = {}

  local function step(i)
    local q = questions[i]

    if not q then
      local parts = { "Odpowiedzi na Twoje pytania:" }

      for _, a in ipairs(answers) do
        table.insert(parts, ("- %s → %s"):format(a.question, a.answer))
      end

      on_done(table.concat(parts, "\n"), answers)
      return
    end

    vim.ui.select(q.options or {}, {
      prompt = q.question or q.header or "Wybierz",
      format_item = function(o) return o.label or "?" end,
    }, function(choice)
      if not choice then
        if on_cancel then on_cancel() end
        return
      end

      table.insert(answers, {
        question = q.question or q.header or "?",
        answer = choice.label,
        options = { choice },
      })
      step(i + 1)
    end)
  end

  step(1)
end

-- opts = { buf, win, own_buf, questions, on_done(text, answers), on_cancel(),
--          on_close(), on_summary(summary, group), on_render(line_count) }
-- own_buf = true → blok zajmuje cały bufor (okienko wpisywania), a podsumowanie
-- wyboru idzie do on_summary zamiast zostawać w tym buforze.
function M.ask(opts)
  local questions = {}

  for _, q in ipairs(opts.questions or {}) do
    if type(q) == "table" and type(q.options) == "table" and #q.options > 0 then
      table.insert(questions, q)
    end
  end

  if #questions == 0 then return false end

  if active then
    -- Jedno pytanie naraz; nowe czeka na następną turę.
    return false
  end

  local buf, win = opts.buf, opts.win

  if not (buf and vim.api.nvim_buf_is_valid(buf) and win and vim.api.nvim_win_is_valid(win)) then
    ask_via_select(questions, opts.on_done, opts.on_cancel)
    return true
  end

  active = {
    buf = buf,
    win = win,
    own_buf = opts.own_buf or false,
    questions = questions,
    qi = 1,
    cursor = 1,
    selected = {},
    answers = {},
    -- Własny bufor: blok jest całą jego zawartością (od linii 0). W logu
    -- czatu dopisujemy się pod tym, co już tam jest.
    first0 = opts.own_buf and 0 or vim.api.nvim_buf_line_count(buf),
    on_done = opts.on_done,
    on_cancel = opts.on_cancel,
    on_close = opts.on_close,
    on_summary = opts.on_summary,
    on_render = opts.on_render,
  }

  map("j", function() move(1) end)
  map("k", function() move(-1) end)
  map("<Down>", function() move(1) end)
  map("<Up>", function() move(-1) end)
  map("<CR>", next_question)
  map("<Space>", function() hit(active.cursor) end)
  map("<Esc>", cancel)
  map("q", cancel)

  for i = 1, 9 do
    map(tostring(i), function() hit(i) end)
  end

  render()

  vim.cmd("stopinsert")
  pcall(vim.api.nvim_set_current_win, win)

  return true
end

return M
