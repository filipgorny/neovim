install("rcarriga/nvim-notify")

configure(function ()
  vim.opt.termguicolors = true
  vim.notify = require("notify", {timeout = 1000})
end)

