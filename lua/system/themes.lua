-- Ustaw termguicolors PRZED załadowaniem jakiegokolwiek motywu
vim.opt.termguicolors = true

-- plik gdzie trzymamy nazwę motywu
local state_file = vim.fn.stdpath("data") .. "/last_colorscheme"

-- funkcja ładowania
local function load_colorscheme()
  local f = io.open(state_file, "r")
  if not f then return false end
  local cs = f:read("*l")
  vim.notify(cs)
  f:close()
  if cs and #cs > 0 then
    local ok = pcall(vim.cmd.colorscheme, cs)
    return ok
  end
  return false
end

-- spróbuj załadować ostatni motyw
if not load_colorscheme() then
  pcall(vim.cmd.colorscheme, "tokyonight") -- fallback
end

-- autocommand do zapisywania przy każdej zmianie
vim.api.nvim_create_autocmd("ColorScheme", {
  callback = function()
    if vim.g.colors_name then
      local f = io.open(state_file, "w")
      if f then
        f:write(vim.g.colors_name)
        f:close()
      end
    end
  end,
})