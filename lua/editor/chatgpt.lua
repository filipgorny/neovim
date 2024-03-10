install("MunifTanjim/nui.nvim")
install("nvim-lua/plenary.nvim")
install("folke/trouble.nvim")
install("nvim-telescope/telescope.nvim")
install("jackMort/ChatGPT.nvim")

require("chatgpt").setup()

keys.map_all("<leader>c", "<Esc>:ChatGPT<CR>")
