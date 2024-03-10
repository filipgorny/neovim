local tabs = {}
local tree = require("editor.tree")

tabs.next_tab = function ()
  tree.close()
  vim.cmd(":tabnext")
  tree.update_previous_window()
  tree.open()
end

tabs.prev_tab = function ()
  tree.close()
  vim.cmd(":tabprevious")
  tree.update_previous_window()
  tree.open()
end

tabs.new_tab = function ()
  tree.close()
  vim.cmd(":tab")
  tree.update_previous_window()
  tree.open()
end

return tabs
