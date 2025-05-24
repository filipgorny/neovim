return {
  {'romgrk/barbar.nvim',
    dependencies = {
      'lewis6991/gitsigns.nvim', -- OPTIONAL: for git status
      'nvim-tree/nvim-web-devicons', -- OPTIONAL: for file icons
    },
    init = function() vim.g.barbar_auto_setup = true end,
    opts = {
      -- lazy.nvim will automatically call setup for you. put your options here, anything missing will use the default:
      -- animation = true,
      -- insert_at_start = true,
      -- …etc.
    },
    version = '^1.0.0', -- optional: only update when a new 1.x version is released
    config = function() 
                local map = vim.api.nvim_set_keymap
                local opts = { noremap = true, silent = true }

                -- Move to previous/next
                map('n', '<A-j>', '<Cmd>BufferPrevious<CR>', opts)
                map('n', '<A-k>', '<Cmd>BufferNext<CR>', opts)

                -- Re-order to previous/next
                map('n', '<S-j>', '<Cmd>BufferMovePrevious<CR>', opts)
                map('n', '<S-k>', '<Cmd>BufferMoveNext<CR>', opts)

                -- Goto buffer in position...
                map('n', '<A-q>', '<Cmd>BufferGoto 1<CR>', opts)
                map('n', '<A-w>', '<Cmd>BufferGoto 2<CR>', opts)
                map('n', '<A-r>', '<Cmd>BufferGoto 3<CR>', opts)
                map('n', '<A-t>', '<Cmd>BufferGoto 4<CR>', opts)
                map('n', '<A-y>', 'eCmd>BufferGoto 5<CR>', opts)
                map('n', '<A-u>', '<Cmd>BufferGoto 6<CR>', opts)
                map('n', '<A-i>', '<Cmd>BufferGoto 7<CR>', opts)
                map('n', '<A-o>', '<Cmd>BufferGoto 8<CR>', opts)
                map('n', '<A-p>', '<Cmd>BufferGoto 9<CR>', opts)
                map('n', '<A-[>', '<Cmd>BufferLast<CR>', opts)

                -- Pin/unpin buffer
                map('n', '<S-p>', '<Cmd>BufferPin<CR>', opts)

                -- Goto pinned/unpinned buffer
                --                 :BufferGotoPinned
                --                 :BufferGotoUnpinned

                -- Close buffer
                map('n', '<S-q>', '<Cmd>BufferClose<CR>', opts)

                -- Wipeout buffer
                --                 :BufferWipeout

                -- Close commands
                --                 :BufferCloseAllButCurrent
                --                 :BufferCloseAllButPinned
                --                 :BufferCloseAllButCurrentOrPinned
                --                 :BufferCloseBuffersLeft
                --                 :BufferCloseBuffersRight

                -- Magic buffer-picking mode
                map('n', '<C-p>',   '<Cmd>BufferPick<CR>', opts)
                map('n', '<C-s-p>', '<Cmd>BufferPickDelete<CR>', opts)

                -- Sort automatically by...
                map('n', '<Space>bb', '<Cmd>BufferOrderByBufferNumber<CR>', opts)
                map('n', '<Space>bn', '<Cmd>BufferOrderByName<CR>', opts)
                map('n', '<Space>bd', '<Cmd>BufferOrderByDirectory<CR>', opts)
                map('n', '<Space>bl', '<Cmd>BufferOrderByLanguage<CR>', opts)
                map('n', '<Space>bw', '<Cmd>BufferOrderByWindowNumber<CR>', opts)

                -- Other:
                -- :BarbarEnable - enables barbar (enabled by default)
                -- :BarbarDisable - very bad command, should never be used
        end
    }
}
