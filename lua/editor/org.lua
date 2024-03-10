install("nvim-neorg/neorg")

configure(function ()
  require('neorg').setup {
    load = {
        ["core.defaults"] = {},
        ["core.dirman"] = {
            config = {
                workspaces = {
                    work = "~/notes/work",
                    personal = "~/notes/personal",
                },
                default_workspace = "work",
            }
        },
        ["core.export.markdown"] = {},
        ["core.journal"] = {}
    }
  }

  vim.cmd([[:Neorg sync-parsers]])

  keys.map_all("<leader>n", "<Esc>:Neorg workspace work<CR>")
  keys.map_all("<leader>j", "<Esc>:Neorg journal today<CR>")
end)
