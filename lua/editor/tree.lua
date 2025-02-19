install("nvim-tree/nvim-tree.lua", {
  setup = {
    highlight_focused_file = true,
    update_focused_file = {
      enable = true,
      update_cwd = true,
      ignore_list = {}
    },
  }
})
install("nvim-tree/nvim-web-devicons")

local tree = {}

local utils = require("nvim-tree.utils")

-- disable netrw at the very start of your init.lua
vim.g.loaded_netrw = 1
vim.g.loaded_netrwPlugin = 1

-- optionally enable 24-bit colour
vim.opt.termguicolors = true

local is_focused = false
local opened = false
local previous_window = nil

tree.on_attach = function (bufnr)
  local api = require("nvim-tree.api")

  -- default mappings
  api.config.mappings.default_on_attach(bufnr)

  -- custom mappings
  vim.keymap.set('n', '<M-q>', toggle_tree)
end

tree.update_previous_window = function (window)
  local api = require("nvim-tree.api")
  
  if window then
    previous_window = window
  else
    previous_window = vim.api.nvim_get_current_win()
  end
end

tree.toggle_tree = function ()
  local api = require("nvim-tree.api")


  
  if opened then
    if utils.is_nvim_tree_buf() then 
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

tree.open = function()
  local api = require("nvim-tree.api")
  api.tree.open()
  api.tree.focus()
  is_focused = true
  opened = true
end

tree.close = function()
  local api = require("nvim-tree.api")
  api.tree.close()
  is_focused = false
  opened = false
end

function tree_on_attach(bufnr)
  local api = require('nvim-tree.api')

  -- OR use all default mappings
  api.config.mappings.default_on_attach(bufnr)

  -- remove a default
  vim.keymap.del('n', '<C-k>', { buffer = bufnr })

end

configure(function ()
  require("nvim-tree").setup({
    on_attach = tree_on_attach,
    git = {
      enable = true,
      ignore = false
    },
    filters = {
      dotfiles = false
    }
 })
end)


return tree
