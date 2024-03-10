install("ellisonleao/dotenv.nvim")

configure(function ()
  require('dotenv').setup({
    enable_on_load = true, -- will load your .env file upon loading a buffer
    verbose = false, -- show error notification if .env file is not found and if .env is loaded
  })
  vim.cmd("Dotenv")
end)

function dotenv(name)
  return vim.cmd(":DotenvGet " .. name)
end

