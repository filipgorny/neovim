local M = {}

M.bind_for_all = function (key, callback)
  vim.keymap.set("n", key, callback)
  vim.keymap.set("i", key, callback)
  vim.keymap.set("v", key, callback)
end

M.bind = function(mode, key, callback)
  vim.keymap.set(mode, key, callback)
end

return M
