install("nvim-lua/plenary.nvim")
install("nvim-telescope/telescope.nvim")

configure(function ()
  require("telescope").setup({
    defaults = {
      layout_strategy = "flex",
      layout_config = {
        width = 0.9,
        height = 0.9,
      },
      preview = {
        border = true,
	      file_previewer = require'telescope.previewers'.vim_buffer_cat.new,
	      grep_previewer = require'telescope.previewers'.vim_buffer_vimgrep.new,
	      qflist_previewer = require'telescope.previewers'.vim_buffer_qflist.new,
      },
    },
  })

  keys.map_all("<leader>f", "<cmd>Telescope find_files<cr>")
end)
