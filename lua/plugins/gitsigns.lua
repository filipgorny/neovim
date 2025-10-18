return {
  "lewis6991/gitsigns.nvim",
  event = { "BufReadPre", "BufNewFile" },
  config = function()
    require("gitsigns").setup({
      signs = {
        add          = { text = '│' },
        change       = { text = '│' },
        delete       = { text = '_' },
        topdelete    = { text = '‾' },
        changedelete = { text = '~' },
        untracked    = { text = '┆' },
      },
      signcolumn = true,  -- Toggle with `:Gitsigns toggle_signs`
      numhl      = false, -- Toggle with `:Gitsigns toggle_numhl`
      linehl     = true,  -- Toggle with `:Gitsigns toggle_linehl` - THIS HIGHLIGHTS THE LINE BACKGROUND
      word_diff  = false, -- Toggle with `:Gitsigns toggle_word_diff`
      watch_gitdir = {
        follow_files = true
      },
      attach_to_untracked = true,
      current_line_blame = false, -- Toggle with `:Gitsigns toggle_current_line_blame`
      current_line_blame_opts = {
        virt_text = true,
        virt_text_pos = 'eol', -- 'eol' | 'overlay' | 'right_align'
        delay = 1000,
        ignore_whitespace = false,
      },
      current_line_blame_formatter = '<author>, <author_time:%Y-%m-%d> - <summary>',
      sign_priority = 6,
      update_debounce = 100,
      status_formatter = nil, -- Use default
      max_file_length = 40000, -- Disable if file is longer than this (in lines)
      preview_config = {
        -- Options passed to nvim_open_win
        border = 'rounded',
        style = 'minimal',
        relative = 'cursor',
        row = 0,
        col = 1
      },
      -- Customize the highlight colors
      on_attach = function(bufnr)
        local gs = package.loaded.gitsigns

        local function map(mode, l, r, opts)
          opts = opts or {}
          opts.buffer = bufnr
          vim.keymap.set(mode, l, r, opts)
        end

        -- Navigation is now defined in lua/config/keymap.lua using utils.git module

        -- Actions
        map('n', '<leader>hs', gs.stage_hunk, { desc = "Stage hunk" })
        map('n', '<leader>hr', gs.reset_hunk, { desc = "Reset hunk" })
        map('v', '<leader>hs', function() gs.stage_hunk {vim.fn.line('.'), vim.fn.line('v')} end, { desc = "Stage hunk" })
        map('v', '<leader>hr', function() gs.reset_hunk {vim.fn.line('.'), vim.fn.line('v')} end, { desc = "Reset hunk" })
        map('n', '<leader>hS', gs.stage_buffer, { desc = "Stage buffer" })
        map('n', '<leader>hu', gs.undo_stage_hunk, { desc = "Undo stage hunk" })
        map('n', '<leader>hR', gs.reset_buffer, { desc = "Reset buffer" })
        map('n', '<leader>hp', gs.preview_hunk, { desc = "Preview hunk" })
        map('n', '<leader>hb', function() gs.blame_line{full=true} end, { desc = "Blame line" })
        map('n', '<leader>tb', gs.toggle_current_line_blame, { desc = "Toggle line blame" })
        map('n', '<leader>hd', gs.diffthis, { desc = "Diff this" })
        map('n', '<leader>hD', function() gs.diffthis('~') end, { desc = "Diff this ~" })
        map('n', '<leader>td', gs.toggle_deleted, { desc = "Toggle deleted" })

        -- Text object
        map({'o', 'x'}, 'ih', ':<C-U>Gitsigns select_hunk<CR>', { desc = "Select hunk" })
      end
    })

    -- Function to adjust color brightness
    local function adjust_color(hex_color, amount)
      -- Remove # if present
      hex_color = hex_color:gsub("#", "")

      -- Convert hex to RGB
      local r = tonumber(hex_color:sub(1, 2), 16)
      local g = tonumber(hex_color:sub(3, 4), 16)
      local b = tonumber(hex_color:sub(5, 6), 16)

      -- Adjust brightness
      r = math.min(255, math.max(0, r + amount))
      g = math.min(255, math.max(0, g + amount))
      b = math.min(255, math.max(0, b + amount))

      -- Convert back to hex
      return string.format("#%02x%02x%02x", r, g, b)
    end

    -- Get current background color
    local function get_bg_color()
      local normal_hl = vim.api.nvim_get_hl(0, { name = "Normal" })
      if normal_hl.bg then
        return string.format("#%06x", normal_hl.bg)
      end
      -- Default fallback for dark themes
      return "#1e1e1e"
    end

    -- Set custom highlight colors based on current theme
    vim.schedule(function()
      local bg_color = get_bg_color()

      -- Make changed lines slightly lighter (add 15 to RGB values)
      local change_bg = adjust_color(bg_color, 15)

      -- Make added lines even more lighter (add 25 to RGB values)
      local add_bg = adjust_color(bg_color, 25)

      -- Make deleted lines slightly lighter with red tint
      local delete_bg = adjust_color(bg_color, 10)

      vim.api.nvim_set_hl(0, 'GitSignsAddLn', { bg = add_bg })
      vim.api.nvim_set_hl(0, 'GitSignsChangeLn', { bg = change_bg })
      vim.api.nvim_set_hl(0, 'GitSignsDeleteLn', { bg = delete_bg })
    end)

    -- Update highlights when colorscheme changes
    vim.api.nvim_create_autocmd("ColorScheme", {
      callback = function()
        vim.schedule(function()
          local bg_color = get_bg_color()
          local change_bg = adjust_color(bg_color, 15)
          local add_bg = adjust_color(bg_color, 25)
          local delete_bg = adjust_color(bg_color, 10)

          vim.api.nvim_set_hl(0, 'GitSignsAddLn', { bg = add_bg })
          vim.api.nvim_set_hl(0, 'GitSignsChangeLn', { bg = change_bg })
          vim.api.nvim_set_hl(0, 'GitSignsDeleteLn', { bg = delete_bg })
        end)
      end
    })
  end,
}
