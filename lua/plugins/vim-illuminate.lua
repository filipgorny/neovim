return {
    "RRethy/vim-illuminate",
    config = function()
        require("illuminate").configure({
            filetypes_denylist = {
                "dirvish",
                "fugitive",
                "NvimTree",
                "TelescopePrompt",
                "TelescopeResults",
                "toggleterm",
            },
            providers = {
                "lsp",
                "treesitter",
                "regex",
            },
            delay = 100,
        })
    end,
}
