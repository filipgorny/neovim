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
                local file = vim.fn.expand("%")
                if file == "" then
                    vim.notify("No file open", vim.log.levels.WARN)
                    return
                end
                -- Check if file has git history
                local result = vim.fn.system('git log -1 --format=%H -- "' .. file .. '" 2>/dev/null')
                if vim.v.shell_error ~= 0 or result == "" then
                    vim.notify("No git history for this file", vim.log.levels.WARN)
                    return
                end
                require('telescope').extensions.git_file_history.git_file_history()
            end,
            desc = 'Git file history'
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
    end,
}
