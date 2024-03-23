local keypress = {}

keypress.press = function (keys)
  for i = 1, #keys do
    vim.api.nvim_feedkeys(vim.api.nvim_replace_termcodes(keys:sub(i, i, true, true, true), true, true, true), "n", true)
  end
end

return keypress
