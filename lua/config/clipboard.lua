vim.api.nvim_set_option("clipboard", "unnamed")

vim.fn.has("clipboard") == 0 then
  vim.notify("Neovim nie ma wsparcia +clipboard!", vim.log.levels.WARN)
end
