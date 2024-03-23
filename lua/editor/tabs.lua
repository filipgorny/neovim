install("tiagovla/scope.nvim")

configure(function () 
  require("scope").setup({})
end)

local tabs = {}
local tree = require("editor.tree")
local keypress = require("utils.keypress")

tabs.next_tab = function ()
  tree.close()
  vim.cmd(":tabnext")
  tree.update_previous_window()
  win = vim.api.nvim_get_current_win()
  tree.open()
  vim.api.nvim_set_current_win(win)
end

tabs.prev_tab = function ()
  tree.close()
  vim.cmd(":tabprevious")
  tree.update_previous_window()
  win = vim.api.nvim_get_current_win()
  tree.open()
  vim.api.nvim_set_current_win(win)
end

tabs.new_tab = function ()
  tree.close()
  vim.cmd(":tabnew")
  tree.update_previous_window()
  tree.open()
  
end

return tabs
