return {
  "sudo-tee/opencode.nvim",
  dependencies = {
    "nvim-lua/plenary.nvim",
    {
      "MeanderingProgrammer/render-markdown.nvim",
      opts = {
        anti_conceal = { enabled = false },
        file_types = { 'markdown', 'opencode_output' },
      },
      ft = { 'markdown', 'Avante', 'copilot-chat', 'opencode_output' },
    },
  },
  config = function()
    -- Auto-enter insert mode when opening opencode input window
    -- Try multiple patterns since the filetype might vary
    local opencode_filetypes = {
      "opencode_input",
      "opencode-input", 
      "opencode",
      "prompt"
    }
    
    for _, ft in ipairs(opencode_filetypes) do
      vim.api.nvim_create_autocmd("FileType", {
        pattern = ft,
        callback = function()
          vim.schedule(function()
            vim.cmd('startinsert')
          end)
        end,
      })
    end
    
    -- Also trigger on BufEnter for any opencode-related buffer
    vim.api.nvim_create_autocmd("BufEnter", {
      pattern = "*",
      callback = function()
        local bufname = vim.api.nvim_buf_get_name(0)
        local ft = vim.bo.filetype
        
        -- Check if it's an opencode buffer by name or filetype
        if bufname:match("opencode") or ft:match("opencode") or vim.bo.buftype == "prompt" then
          -- Only enter insert mode if it looks like an input window (not output)
          if not bufname:match("output") and not ft:match("output") then
            vim.schedule(function()
              if vim.api.nvim_get_mode().mode == 'n' then
                vim.cmd('startinsert')
              end
            end)
          end
        end
      end,
    })
    
    require("opencode").setup({
      -- Executable
      opencode_executable = 'opencode',
      
      -- Default settings
      default_mode = 'build',
      default_global_keymaps = true,
      default_system_prompt = table.concat(vim.fn.readfile(vim.fn.expand('~/.config/nvim/assets/OPENCODE.md')), '\n'),
      
      -- Custom Keymaps
      keymap = {
        editor = {
          -- Main opencode toggle (opens in insert mode)
          ['<leader>o'] = { function()
            require('opencode.api').toggle()
            -- Multiple attempts to enter insert mode with increasing delays
            for i = 1, 3 do
              vim.defer_fn(function()
                local bufname = vim.api.nvim_buf_get_name(0)
                if bufname:match("opencode") and not bufname:match("output") then
                  if vim.api.nvim_get_mode().mode == 'n' then
                    vim.cmd('startinsert')
                  end
                end
              end, i * 50)
            end
          end },
          
          -- Open input window directly in insert mode
          ['<leader>oi'] = { function()
            require('opencode.api').open_input()
            vim.defer_fn(function()
              vim.cmd('startinsert')
            end, 100)
          end },
          
          -- Quick chat inline (shows dialog among code lines)
          ['<leader>i'] = { 'quick_chat', mode = { 'n', 'x' } },
          
          -- Keep some useful global keymaps
          ['<leader>oo'] = { 'open_output' },
          ['<leader>oq'] = { 'close' },
          ['<leader>os'] = { 'select_session' },
          ['<leader>op'] = { 'configure_provider' },
        },
        input_window = {
          -- Enter submits the prompt
          ['<cr>'] = { 'submit_input_prompt', mode = { 'n', 'i' } },
          
          -- Shift+Enter creates new line (disable default behavior)
          ['<S-cr>'] = false,
          
          -- Shift+Tab switches between Plan/Build mode
          ['<S-tab>'] = { 'switch_mode', mode = { 'n', 'i' } },
          
          -- Keep other useful defaults
          ['<esc>'] = { 'close' },
          ['<C-c>'] = { 'cancel' },
          ['~'] = { 'mention_file', mode = 'i' },
          ['@'] = { 'mention', mode = 'i' },
          ['/'] = { 'slash_commands', mode = 'i' },
          ['#'] = { 'context_items', mode = 'i' },
          ['<M-v>'] = { 'paste_image', mode = 'i' },
          ['<C-i>'] = { 'focus_input', mode = { 'n', 'i' } },
          ['<tab>'] = { 'toggle_pane', mode = { 'n', 'i' } },
          ['<up>'] = { 'prev_prompt_history', mode = { 'n', 'i' } },
          ['<down>'] = { 'next_prompt_history', mode = { 'n', 'i' } },
          ['<M-r>'] = { 'cycle_variant', mode = { 'n', 'i' } },
        },
      },
      
      -- UI Configuration
      ui = {
        position = 'right',
        window_width = 0.40,
        zoom_width = 0.8,
        display_model = true,
        display_context_size = true,
        display_cost = true,
        input = {
          min_height = 0.10,
          max_height = 0.25,
          auto_hide = false,
        },
      },
      
      -- Context Configuration
      context = {
        enabled = true,
        current_file = {
          enabled = true,
          show_full_path = true,
        },
        selection = {
          enabled = true,
        },
        diagnostics = {
          info = false,
          warn = true,
          error = true,
        },
      },
      
      -- Debug configuration
      logging = {
        enabled = true,
        level = 'debug',
      },
      debug = {
        enabled = true,
      },
    })
  end,
}
