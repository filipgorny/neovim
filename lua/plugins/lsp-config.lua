-- file: lua/plugins/lsp-config.lua
return {
  -- mason: manager serwerów lsp
  {
    "williamboman/mason.nvim",
    cmd = "Mason",
    config = function()
      require("mason").setup()
    end,
  },

  -- mason + lspconfig
  {
    "williamboman/mason-lspconfig.nvim",
    dependencies = { "mason.nvim" },
    config = function()
      require("mason-lspconfig").setup({
        ensure_installed = { "ts_ls", "eslint", "lua_ls", "gopls" },
        automatic_installation = true,
        automatic_enable = true, -- włącza lsp automatycznie po otwarciu pliku
      })

      -- Also ensure debug adapters are installed
      local registry = require("mason-registry")
      local adapters_to_install = { "js-debug-adapter" }

      for _, adapter in ipairs(adapters_to_install) do
        local package = registry.get_package(adapter)
        if not package:is_installed() then
          vim.notify("Installing " .. adapter .. "...", vim.log.levels.INFO)
          package:install()
        end
      end
    end,
  },

  -- lspconfig i cmp
  {
    "neovim/nvim-lspconfig",
    dependencies = { "hrsh7th/cmp-nvim-lsp" },
    event = { "bufreadpre", "bufnewfile" },
    config = function()
      local cmp_capabilities = require("cmp_nvim_lsp").default_capabilities()

      -- funkcje wspólne dla wszystkich lsp
      local function common_on_attach(client, bufnr)
        local opts = { noremap = true, silent = true, buffer = bufnr }
        
        -- gd skacze bezpośrednio do pierwszej definicji bez pokazywania okna wyboru
        vim.keymap.set("n", "gd", function()
          local clients = vim.lsp.get_clients({bufnr = 0})
          if #clients == 0 then
            vim.notify("No LSP client attached", vim.log.levels.WARN)
            return
          end
          
          local params = vim.lsp.util.make_position_params(0, clients[1].offset_encoding)
          vim.lsp.buf_request(0, 'textDocument/definition', params, function(err, result, ctx, config)
            if err then
              vim.notify("LSP Error: " .. vim.inspect(err), vim.log.levels.ERROR)
              return
            end
            if not result or vim.tbl_isempty(result) then
              vim.notify("No definition found", vim.log.levels.WARN)
              return
            end
            
            -- Handle both single result and array of results
            local locations = vim.islist(result) and result or {result}
            if #locations > 0 then
              local loc = locations[1]
              local uri = loc.uri or loc.targetUri
              local range = loc.range or loc.targetRange or loc.targetSelectionRange
              
              if uri then
                -- Get file path from URI
                local filepath = vim.uri_to_fname(uri)
                local current_buf = vim.api.nvim_get_current_buf()
                local current_file = vim.api.nvim_buf_get_name(current_buf)
                
                -- Check if opening a different file
                local is_new_file = (filepath ~= current_file)
                
                -- Open file in buffer
                vim.cmd('edit ' .. vim.fn.fnameescape(filepath))
                
                -- If it's a new file, move it to position right after the previous buffer
                -- (zaraz po prawej stronie poprzedniego taba)
                if is_new_file then
                  vim.defer_fn(function()
                    local new_buf = vim.api.nvim_get_current_buf()
                    
                    -- Get all buffers in order
                    local buffers = vim.fn.getbufinfo({buflisted = 1})
                    local prev_buf_index = nil
                    
                    -- Find the previous buffer index
                    for i, buf in ipairs(buffers) do
                      if buf.bufnr == current_buf then
                        prev_buf_index = i
                        break
                      end
                    end
                    
                    if prev_buf_index then
                      -- Count how many positions we need to move back
                      local current_new_index = nil
                      for i, buf in ipairs(buffers) do
                        if buf.bufnr == new_buf then
                          current_new_index = i
                          break
                        end
                      end
                      
                      if current_new_index and current_new_index > prev_buf_index + 1 then
                        -- Move left until we're right after previous buffer
                        local moves = current_new_index - prev_buf_index - 1
                        for i = 1, moves do
                          pcall(vim.cmd, 'BufferLineMovePrev')
                        end
                      elseif current_new_index and current_new_index < prev_buf_index + 1 then
                        -- Move right until we're right after previous buffer
                        local moves = prev_buf_index + 1 - current_new_index
                        for i = 1, moves do
                          pcall(vim.cmd, 'BufferLineMoveNext')
                        end
                      end
                    end
                  end, 50)
                end
                
                -- Set cursor position
                if range and range.start then
                  vim.api.nvim_win_set_cursor(0, {range.start.line + 1, range.start.character})
                end
              end
            end
          end)
        end, opts)
        
        vim.keymap.set("n", "gi", vim.lsp.buf.implementation, opts)
        vim.keymap.set("n", "gr", vim.lsp.buf.references, opts)
        vim.keymap.set("n", "K", vim.lsp.buf.hover, opts)
        vim.keymap.set("n", "<leader>rn", vim.lsp.buf.rename, opts)
        vim.keymap.set("n", "<leader>ca", vim.lsp.buf.code_action, opts)
        vim.keymap.set("n", "<leader>r", vim.diagnostic.open_float, opts)
        vim.keymap.set("n", "[d", vim.diagnostic.goto_prev, opts)
        vim.keymap.set("n", "]d", vim.diagnostic.goto_next, opts)
        vim.keymap.set("i", "<c-h>", vim.lsp.buf.signature_help, opts)
      end

      ----------------------------------------------------------
      -- 🔧 pomocnicze funkcje do formatowania tylko zmienionych linii
      ----------------------------------------------------------
      local function get_changed_ranges()
        local bufnr = vim.api.nvim_get_current_buf()
        local filename = vim.api.nvim_buf_get_name(bufnr)
        if filename == "" then return {} end

        -- zapisz aktualną zawartość do tymczasowego pliku
        local tmpfile = vim.fn.tempname()
        vim.api.nvim_command("silent write! " .. tmpfile)

        -- porównaj bieżący bufor z wersją na dysku
        local diff_output = vim.fn.systemlist({ "diff", "-u0", tmpfile, filename })
        vim.fn.delete(tmpfile)

        local ranges = {}
        for _, line in ipairs(diff_output) do
          -- szukaj linii diff-a np. "@@ -10,0 +11,3 @@"
          local start_new, count_new = line:match("%+([0-9]+),?([0-9]*)")
          if start_new then
            start_new = tonumber(start_new)
            count_new = tonumber(count_new ~= "" and count_new or 1)
            table.insert(ranges, { start_new - 1, start_new - 1 + count_new })
          end
        end
        return ranges
      end

      local function format_changed_lines()
        local bufnr = vim.api.nvim_get_current_buf()
        local ranges = get_changed_ranges()
        if #ranges == 0 then return end

        for _, range in ipairs(ranges) do
          vim.lsp.buf.format({
            bufnr = bufnr,
            async = false,
            range = {
              ["start"] = { range[1], 0 },
              ["end"] = { range[2], 0 },
            },
          })
        end
      end

      -- =========================
      -- lua lsp
      vim.lsp.config("lua_ls", {
        cmd = { "lua-language-server" },
        filetypes = { "lua" },
        root_markers = { ".git", "." },
        settings = {
          Lua = {
            runtime = { version = "LuaJIT" },
            diagnostics = {
              globals = { "vim" },
            },
            workspace = {
              library = vim.api.nvim_get_runtime_file("", true),
              checkThirdParty = false,
            },
            telemetry = { enable = false },
            completion = {
              callSnippet = "Replace"
            },
          },
        },
        capabilities = cmp_capabilities,
        on_attach = common_on_attach,
      })

      -- =========================
      -- typescript/javascript
      vim.lsp.config("ts_ls", {
        cmd = { "typescript-language-server", "--stdio" },
        filetypes = { "typescript", "typescriptreact", "typescript.tsx", "javascript", "javascriptreact" },
        root_markers = { "tsconfig.json", "jsconfig.json", "package.json", ".git" },
        capabilities = cmp_capabilities,
        on_attach = common_on_attach,
        init_options = { hostinfo = "neovim" },
      })

      -- =========================
      -- eslint
      vim.lsp.config("eslint", {
        cmd = { "vscode-eslint-language-server", "--stdio" },
        filetypes = { "javascript", "javascriptreact", "typescript", "typescriptreact" },
        root_markers = {
          ".eslintrc",
          ".eslintrc.js",
          ".eslintrc.cjs",
          ".eslintrc.json",
          "package.json",
          ".git"
        },
        capabilities = cmp_capabilities,
        on_attach = function(client, bufnr)
          if client.name == "eslint" then
            client.server_capabilities.documentFormattingProvider = true
          end

          vim.api.nvim_create_autocmd("BufWritePre", {
            buffer = bufnr,
            callback = function()
              format_changed_lines()
            end,
          })

          common_on_attach(client, bufnr)
        end,
        settings = {
          format = true,
          run = "onSave",
          validate = "onSave",
          quiet = true,
          workingDirectory = { mode = "auto" },
          codeAction = {
            disableRuleComment = { enable = true, location = "separateLine" },
            showDocumentation = { enable = true },
          },
        },
      })

      -- Enable LSP servers with autocommands
      vim.api.nvim_create_autocmd("FileType", {
        pattern = "lua",
        callback = function()
          vim.lsp.enable("lua_ls")
        end,
      })

      vim.api.nvim_create_autocmd("FileType", {
        pattern = { "typescript", "typescriptreact", "javascript", "javascriptreact" },
        callback = function()
          vim.lsp.enable("ts_ls")
        end,
      })

      vim.api.nvim_create_autocmd("FileType", {
        pattern = { "javascript", "javascriptreact", "typescript", "typescriptreact" },
        callback = function()
          vim.lsp.enable("eslint")
        end,
      })

      -- =========================
      -- gopls (Go language server)
      vim.lsp.config("gopls", {
        cmd = { "gopls" },
        filetypes = { "go", "gomod", "gowork", "gotmpl" },
        root_markers = { "go.work", "go.mod", ".git" },
        capabilities = cmp_capabilities,
        on_attach = common_on_attach,
        settings = {
          gopls = {
            analyses = {
              unusedparams = true,
            },
            staticcheck = true,
            gofumpt = true,
          },
        },
      })

      vim.api.nvim_create_autocmd("FileType", {
        pattern = "go",
        callback = function()
          vim.lsp.enable("gopls")
        end,
      })

      ----------------------------------------------------------
      -- 💡 dodatkowa optymalizacja środowiska node.js
      ----------------------------------------------------------
      vim.env.NODE_OPTIONS = "--max-old-space-size=8000"

    end,
  },

}

