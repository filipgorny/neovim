return {
    'nvim-telescope/telescope.nvim',
    -- tag = '0.1.8', -- Opcjonalnie, jeśli chcesz konkretną wersję
    dependencies = { 
        'nvim-lua/plenary.nvim', 
        "isak102/telescope-git-file-history.nvim",
         dependencies = {
                "nvim-lua/plenary.nvim",
                "tpope/vim-fugitive"
        },
        "mrloop/telescope-git-branch.nvim"
    },
    keys = {
        {
            '<leader>f',
            function()
                require('telescope.builtin').find_files()
            end,
            desc = 'Telescope find files',
        },
        {
            '<leader>g',
            function()
                require('telescope.builtin').live_grep()
            end,
            desc = 'Telescope live grep',
        },
        {
            '<leader>t',
            function()
                require('telescope.builtin').colorscheme()
            end,
            desc = 'Select color theme',
        },
        {
            '<leader>h',
            function()
                require('telescope').extensions.git_file_history.git_file_history()
            end,
            desc = 'Git file history'
        },
        {
            '<leader>d',
            function()
                require('git_branch').files()
            end,
            desc = 'Git diff'
        }
    },
    config = function()
        require('telescope').setup {
            defaults = {
                mappings = {
                    i = {
                        ['<C-j>'] = require('telescope.actions').move_selection_next,
                        ['<C-k>'] = require('telescope.actions').move_selection_previous,
                    },
                },
            },
            pickers = {
                colorscheme = {
                    enable_preview = true, -- Włącza podgląd motywu podczas wyboru
                },
            },
        }
        require("telescope").load_extension("diff")
        require('telescope').load_extension('git_branch')
    end,
}
