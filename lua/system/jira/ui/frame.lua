-- Reużywalna ramka (popup) UI Jiry.
--
-- Jedno pływające okno z ~10% marginesem z każdej strony, zaokrąglony border,
-- wspólny nagłówek z zakładkami trzech ekranów i stopka z podpowiedziami.
-- Ekrany (board/task/backlog) nie tworzą własnych okien — dostają bufor ramki
-- i renderują do niego bloki (patrz components.render).
--
-- Ramka jest neutralna: nie wie nic o treści ekranów. Zna tylko chrome,
-- wymiary, bufor, keymapy i przełączanie aktywnej zakładki.

local components = require("system.jira.ui.components")

local M = {}

M.state = nil -- { bufnr, win, ns, width, height, maps = {} }

local TABS = {
  { id = "board", label = "Sprint Board" },
  { id = "task", label = "Task" },
  { id = "backlog", label = "Backlog" },
}

-- Margines 10% -> okno zajmuje 80% ekranu, wyśrodkowane.
local function dimensions()
  local total_w = vim.o.columns
  local total_h = vim.o.lines

  local width = math.floor(total_w * 0.8)
  local height = math.floor(total_h * 0.8)
  local row = math.floor((total_h - height) / 2)
  local col = math.floor((total_w - width) / 2)

  return width, height, row, col
end

function M.is_open()
  return M.state ~= nil
    and M.state.win
    and vim.api.nvim_win_is_valid(M.state.win)
end

-- Otwiera ramkę (albo zwraca istniejącą). Rejestruje domyślne keymapy
-- nawigacji (q/Esc zamyka, Tab przełącza zakładki — obsługę zakładek
-- podpina router przez M.on_tab).
function M.open()
  if M.is_open() then
    return M.state
  end

  local width, height, row, col = dimensions()

  local bufnr = vim.api.nvim_create_buf(false, true)
  vim.api.nvim_buf_set_option(bufnr, "buftype", "nofile")
  vim.api.nvim_buf_set_option(bufnr, "bufhidden", "wipe")
  vim.api.nvim_buf_set_option(bufnr, "swapfile", false)
  vim.api.nvim_buf_set_option(bufnr, "filetype", "jira")

  local win = vim.api.nvim_open_win(bufnr, true, {
    relative = "editor",
    width = width,
    height = height,
    row = row,
    col = col,
    style = "minimal",
    border = "rounded",
    title = " Jira ",
    title_pos = "center",
  })

  vim.api.nvim_win_set_option(win, "wrap", false)
  vim.api.nvim_win_set_option(win, "cursorline", false)
  vim.api.nvim_win_set_option(win, "winhl", "Normal:NormalFloat,FloatBorder:JiraBorder")

  M.state = {
    bufnr = bufnr,
    win = win,
    ns = vim.api.nvim_create_namespace("jira_frame"),
    width = width,
    height = height,
    row = row,
    col = col,
    maps = {},
  }

  -- Przypięte okno stopki (nie scrolluje się z treścią) — ostatni wiersz ramki.
  local footer_buf = vim.api.nvim_create_buf(false, true)
  vim.api.nvim_buf_set_option(footer_buf, "bufhidden", "wipe")

  -- Stopka na ostatnim wierszu treści ramki. Uwaga: przy borderze z tytułem
  -- realnie renderowany wiersz jest o 1 niżej niż wynika z (row + height - 1),
  -- dlatego kotwiczymy na row + height (zweryfikowane wizualnie).
  local footer_win = vim.api.nvim_open_win(footer_buf, false, {
    relative = "editor",
    width = width,
    height = 1,
    row = row + height,
    col = col,
    style = "minimal",
    focusable = false,
    zindex = 60,
    noautocmd = true,
  })
  vim.api.nvim_win_set_option(footer_win, "winhl", "Normal:NormalFloat")

  M.state.footer_buf = footer_buf
  M.state.footer_win = footer_win
  M.state.footer_ns = vim.api.nvim_create_namespace("jira_footer")

  components.setup_highlights()
  require("system.jira.avatar").setup()

  -- Zamknięcie — wspólne dla wszystkich ekranów.
  M.map("n", "q", function() M.close() end)
  M.map("n", "<Esc>", function() M.close() end)

  -- Zakładki: Tab / Shift-Tab i bezpośrednie 1/2/3.
  M.map("n", "<Tab>", function() M._cycle_tab(1) end)
  M.map("n", "<S-Tab>", function() M._cycle_tab(-1) end)

  vim.api.nvim_create_autocmd("WinClosed", {
    pattern = tostring(win),
    once = true,
    callback = function()
      if M.state and M.state.footer_win and vim.api.nvim_win_is_valid(M.state.footer_win) then
        vim.api.nvim_win_close(M.state.footer_win, true)
      end

      M.state = nil
    end,
  })

  return M.state
end

function M.close()
  if M.state then
    if M.state.footer_win and vim.api.nvim_win_is_valid(M.state.footer_win) then
      vim.api.nvim_win_close(M.state.footer_win, true)
    end

    if M.state.win and vim.api.nvim_win_is_valid(M.state.win) then
      vim.api.nvim_win_close(M.state.win, true)
    end
  end

  M.state = nil
end

-- Renderuje przypiętą stopkę z podpowiedziami (zawsze widoczna, nie scrolluje).
function M.set_footer(hints)
  if not M.state or not M.state.footer_buf then
    return
  end

  local spans = components.keyhints(hints)
  table.insert(spans, 1, components.span(" ", nil))
  components.render(M.state.footer_buf, M.state.footer_ns, { spans })
end

-- Callback ustawiany przez router: function(tab_id) -> pokaż dany ekran.
M.on_tab = nil
M.active_tab = "board"

function M._cycle_tab(dir)
  local idx = 1
  for i, t in ipairs(TABS) do
    if t.id == M.active_tab then
      idx = i
      break
    end
  end

  idx = ((idx - 1 + dir) % #TABS) + 1

  if M.on_tab then
    M.on_tab(TABS[idx].id)
  end
end

-- Buforowa keymapa — zapamiętana, żeby dało się je wyczyścić przy zmianie ekranu.
function M.map(mode, lhs, fn)
  if not M.state then
    return
  end

  vim.keymap.set(mode, lhs, fn, {
    buffer = M.state.bufnr,
    nowait = true,
    silent = true,
  })
  table.insert(M.state.maps, { mode = mode, lhs = lhs })
end

-- Czyści keymapy zarejestrowane przez ekran (zostawia chrome ramki).
-- Router woła to przed zamontowaniem nowego ekranu; chrome (q/Esc/Tab)
-- podpinamy ponownie po czyszczeniu.
function M.reset_screen_maps()
  if not M.state then
    return
  end

  for _, m in ipairs(M.state.maps) do
    pcall(vim.keymap.del, m.mode, m.lhs, { buffer = M.state.bufnr })
  end

  M.state.maps = {}

  M.map("n", "q", function() M.close() end)
  M.map("n", "<Esc>", function() M.close() end)
  M.map("n", "<Tab>", function() M._cycle_tab(1) end)
  M.map("n", "<S-Tab>", function() M._cycle_tab(-1) end)
end

-- Pasek zakładek jako span-linia (komponent chrome).
function M.tabbar(active)
  local spans = { components.span(" ⇄ Tab ", "JiraKeyhintKey"), components.span(" ", nil) }

  for _, t in ipairs(TABS) do
    local is_active = t.id == active
    local hl = is_active and "JiraTabActive" or "JiraTabInactive"
    local label = (is_active and "● " or "  ") .. t.label

    table.insert(spans, components.span(" " .. label .. " ", hl))
    table.insert(spans, components.span(" ", nil))
  end

  return spans
end

-- Stopka z podpowiedziami klawiszy (span-linia).
function M.footer(hints)
  return components.keyhints(hints)
end

-- Renderuje kompletny block (nagłówek + body + stopka składa router/ekran).
function M.render(block)
  if not M.state then
    return
  end

  components.render(M.state.bufnr, M.state.ns, block)
end

-- Ustawia kursor bezpiecznie w granicach bufora.
function M.set_cursor(lnum, col)
  if not M.is_open() then
    return
  end

  local total = vim.api.nvim_buf_line_count(M.state.bufnr)
  lnum = math.max(1, math.min(lnum, total))
  pcall(vim.api.nvim_win_set_cursor, M.state.win, { lnum, col or 0 })
end

return M
