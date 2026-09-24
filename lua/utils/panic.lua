-- <leader>q — awaryjne „wyjdź ze wszystkiego".
--
-- Zamyka panele nakładkowe (czat agenta, panel diffa brancha, neo-tree, floaty)
-- i zostawia wyłącznie okna z edytowanymi plikami, przenosząc do nich focus.
-- Własne splity użytkownika zostają nietknięte — zdejmujemy tylko to, co panel
-- sam dołożył.
--
-- Powód istnienia: każdy panel ma inny skrót wyjścia (q, <Esc>, <Esc><Esc>,
-- Neotree close). Gdy focus utknie w którymś z nich, jeden pewny klawisz jest
-- szybszy niż zgadywanie — i dużo szybszy niż restart nvima.

local M = {}

-- Okno z prawdziwym plikiem: zwykły bufor, nie panel boczny, nie float,
-- nie okno agenta (winfixbuf).
local function is_editor_win(w)
  if not vim.api.nvim_win_is_valid(w) then return false end
  if vim.api.nvim_win_get_config(w).relative ~= "" then return false end
  if vim.wo[w].winfixbuf then return false end

  local b = vim.api.nvim_win_get_buf(w)

  if vim.bo[b].buftype ~= "" then return false end
  if vim.bo[b].filetype == "neo-tree" then return false end

  return true
end

function M.close_panels()
  -- 1. Panel diffa — wołamy jego własne close(), bo tylko ono kasuje
  --    podświetlenia branch-diff i zatrzymuje watchery. Samo zamknięcie okna
  --    zostawiłoby pokolorowane bufory.
  local ok_ui, ui = pcall(require, "utils.ui")

  if ok_ui and ui._active_list_overview then
    pcall(ui._active_list_overview.close)
  end

  -- 2. Czat agenta (log + okienko wpisywania naraz; sesja żyje dalej,
  --    <leader>c przywraca panel z całą historią).
  local ok_agent, agent = pcall(require, "system.agent")

  if ok_agent and agent.close then
    pcall(agent.close)
  end

  -- 3. Neo-tree — zadokowany i pływający.
  pcall(vim.cmd, "Neotree close")

  -- 4. Pozostałe floaty: popupy diagnostyk, podglądy, niedomknięte pickery.
  local cur = vim.api.nvim_get_current_win()

  for _, w in ipairs(vim.api.nvim_list_wins()) do
    if w ~= cur and vim.api.nvim_win_get_config(w).relative ~= "" then
      pcall(vim.api.nvim_win_close, w, true)
    end
  end

  -- 5. Focus do okna z plikiem. Robimy to na końcu, bo dopiero teraz wiadomo,
  --    które okna przetrwały.
  vim.schedule(function()
    if is_editor_win(vim.api.nvim_get_current_win()) then return end

    for _, w in ipairs(vim.api.nvim_list_wins()) do
      if is_editor_win(w) then
        vim.api.nvim_set_current_win(w)

        return
      end
    end
  end)
end

return M
