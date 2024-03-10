install("hrsh7th/nvim-cmp")
install("allaman/emoji.nvim")

configure(function ()
  require("emoji").setup({
    enable_cmp_integration = true,
  })
end)
