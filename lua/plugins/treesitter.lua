return {
    "nvim-treesitter/nvim-treesitter",
    build = ":TSUpdate",
    run = ":TSUpdate",
    config = function () 
      local configs = require("nvim-treesitter.configs")

      configs.setup({
          ensure_installed = { "c", "lua", "vim", "vimdoc", "query", "elixir", "heex", "javascript", "html", "typescript", "go" },
          sync_install = false,
          highlight = { enable = true },
          indent = { enable = true },  
        })

        require('nvim-treesitter.configs').setup({
            ensure_installed = { 'typescript', 'javascript', 'tsx' },
             highlight = { enable = true },
        })
end,
	opts = { ensure_installed = { "go", "gomod", "gowork", "gosum" } }
 }
