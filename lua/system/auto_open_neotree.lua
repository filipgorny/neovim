-- Auto-open neo-tree when nvim is launched with a directory argument
-- (e.g. `nvim .`, `nvim some/folder`). Registered on VimEnter via an init.lua-
-- level require so the autocmd exists before VimEnter fires, regardless of
-- lazy.nvim plugin load order.
--
-- netrw is disabled in init.lua (vim.g.loaded_netrw / loaded_netrwPlugin), so
-- nvim leaves a stub buffer named after the directory — we wipe it after the
-- tree panel is shown.

-- Auto-open neo-tree when nvim is launched with a directory argument.
-- We use `Neotree focus` (not `show`) because the configured position is
-- `float`, and float panels auto-close as soon as another window gets focus
-- (neo-tree's own `win_enter_event` → `close_all("float")`). `focus` keeps
-- focus inside the panel so it survives.

local group = vim.api.nvim_create_augroup("AutoOpenNeotreeForDir", { clear = true })

vim.api.nvim_create_autocmd("BufEnter", {
  group = group,
  callback = function()
    if vim.fn.argc() ~= 1 then return end
    local arg = vim.fn.argv(0)
    local stat = (vim.uv or vim.loop).fs_stat(arg)
    if not stat or stat.type ~= "directory" then return end

    pcall(vim.api.nvim_del_augroup_by_id, group)

    vim.cmd.cd(arg)
    pcall(vim.cmd, "Neotree focus")
  end,
})
