install("nvim-tree/nvim-tree.lua")
install("nvim-tree/nvim-web-devicons")

-- disable netrw at the very start of your init.lua
vim.g.loaded_netrw = 1
vim.g.loaded_netrwPlugin = 1

-- optionally enable 24-bit colour
vim.opt.termguicolors = true

local is_focused = false
local opened = false
local previous_window = nil

local function on_attach(bufnr)
  local api = require "nvim-tree.api"

  -- default mappings
  api.config.mappings.default_on_attach(bufnr)

  -- custom mappings
  vim.keymap.set('n', '<M-q>', toggle_tree)
end

function toggle_tree()
  local api = require("nvim-tree.api")

  if opened then
    if is_focused then
      is_focused = false
      vim.api.nvim_set_current_win(previous_window)
    else
      previous_window = vim.api.nvim_get_current_win()
      api.tree.focus()
      is_focused = true
    end
  else
    previous_window = vim.api.nvim_get_current_win()
    api.tree.open()
    api.tree.focus()
    is_focused = true
    opened = true
  end
end

function open_tree()
  local api = require("nvim-tree.api")
  api.nvim_tree_open()
  api.nvim_tree_focus()
  is_focused = true
  opened = true
end

configure(function ()
  require("nvim-tree").setup({
    on_attach = on_attach,
  })
  keys.map_all("<C-n>", open_tree)
  keys.map_all("<M-q>", toggle_tree)
end)


