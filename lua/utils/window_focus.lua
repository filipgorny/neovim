-- <M-q>: przełączanie focusu między panelem neo-tree a oknem z edytowanym
-- plikiem. Panel czatu agenta (okna z winfixbuf) oraz pływające panele są
-- pomijane — focus nigdy na nich nie ląduje.

local M = {}

-- Panele boczne, których nie traktujemy jak okna edytora.
local SIDEBAR_FT = {
  ["neo-tree"] = true, ["neo-tree-popup"] = true,
  ["NvimTree"] = true, ["aerial"] = true,
  ["Outline"] = true, ["undotree"] = true,
}

-- Zadokowane (nie-float) okno neo-tree, jeśli otwarte.
local function tree_win()
  for _, w in ipairs(vim.api.nvim_list_wins()) do
    local b = vim.api.nvim_win_get_buf(w)

    if vim.api.nvim_win_get_config(w).relative == ""
      and vim.api.nvim_buf_is_valid(b)
      and vim.bo[b].filetype == "neo-tree" then
      return w
    end
  end

  return nil
end

-- Czy okno to prawdziwy edytor: zwykły plikowy bufor, nie czat agenta
-- (winfixbuf), nie panel boczny, nie float.
local function is_editor_win(w)
  if not vim.api.nvim_win_is_valid(w) then return false end
  if vim.api.nvim_win_get_config(w).relative ~= "" then return false end -- float
  if vim.wo[w].winfixbuf then return false end                           -- panel czatu agenta

  local b = vim.api.nvim_win_get_buf(w)

  if vim.bo[b].buftype ~= "" then return false end -- nofile/terminal/prompt (neo-tree=nofile)
  if SIDEBAR_FT[vim.bo[b].filetype] then return false end

  return true
end

-- Okno z edytowanym plikiem — najpierw bieżące (jeśli pasuje), potem dowolne inne.
local function file_win()
  local cur = vim.api.nvim_get_current_win()

  if is_editor_win(cur) then return cur end

  for _, w in ipairs(vim.api.nvim_list_wins()) do
    if is_editor_win(w) then return w end
  end

  return nil
end

-- <M-q>: przełącz focus neo-tree ↔ okno edytora (z pominięciem agenta).
--   * w neo-tree      → skocz do okna z plikiem (jeśli jakieś jest; jeśli plik
--                       zamknięty i nie ma innego, focus zostaje — nic nie robimy)
--   * w panelu agenta → skocz do okna z plikiem (drzewka NIE otwieramy)
--   * w edytorze      → skocz do neo-tree; gdy panel nie jest zadokowany,
--                       otwórz go po lewej (jak <leader>E)
function M.toggle_tree_editor()
  local cur = vim.api.nvim_get_current_win()
  local cur_buf = vim.api.nvim_win_get_buf(cur)
  local cur_ft = vim.bo[cur_buf].filetype

  if cur_ft == "neo-tree" then
    local fw = file_win()

    if fw then
      vim.api.nvim_set_current_win(fw)
    end

    return
  end

  -- Z panelu agenta <M-q> ma wracać do EDYTORA, nie do drzewka. Wcześniej
  -- trafiał w gałąź „otwórz neo-tree po lewej", co przy otwartym czacie dokładało
  -- trzecią kolumnę i na stałe przestawiało neo-tree z float na left.
  if vim.api.nvim_buf_get_name(cur_buf):match("^agent://") then
    local fw = file_win()

    if fw then
      vim.api.nvim_set_current_win(fw)
    end

    return
  end

  local tw = tree_win()

  if tw then
    vim.api.nvim_set_current_win(tw)

    return
  end

  -- Neo-tree niezadokowany — otwórz po lewej i wejdź w niego.
  pcall(vim.cmd, "Neotree show position=left")

  vim.schedule(function()
    local w = tree_win()

    if w then
      vim.api.nvim_win_set_width(w, math.floor(vim.o.columns * 0.2))
      vim.api.nvim_set_current_win(w)
    end
  end)
end

return M
