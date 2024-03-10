install("akinsho/toggleterm.nvim")

configure(function ()
  require("toggleterm").setup()

  keys.map_all("<C-x>", "<cmd>lua terminal_toggle()<CR>")
end)

function terminal_toggle()
  require("toggleterm").toggle()

  if vim.fn.bufwinnr("term://*") == -1 then
    opts = { buffer = 0 }
    vim.keymap.set("t", "<C-x>", "<cmd>lua require('toggleterm').toggle()<CR>", opts)
  end
end
