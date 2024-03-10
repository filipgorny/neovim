install("rcarriga/nvim-notify")

configure(function ()
  vim.opt.termguicolors = true
  vim.notify = require("notify")
end)

