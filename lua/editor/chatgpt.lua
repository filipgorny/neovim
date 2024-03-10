install("MunifTanjim/nui.nvim")
install("nvim-lua/plenary.nvim")
install("folke/trouble.nvim")
install("nvim-telescope/telescope.nvim")
install("jackMort/ChatGPT.nvim")

configure(function () 
	require("chatgpt").setup({
    --api_key_cmd = "echo \"$OPEN_API_KEY\"",
    chat = {
      keymaps = {
        submit = "<CR>"
      }
    }
  })

	keys.map_all("<leader>c", "<Esc>:ChatGPT<CR>")
end)
