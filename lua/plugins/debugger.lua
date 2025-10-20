return {
  -- Mason integration for DAP (auto-install debug adapters)
  {
    "jay-babu/mason-nvim-dap.nvim",
    dependencies = { "mason.nvim", "mason-lspconfig.nvim" },
    cmd = { "DapInstall", "DapUninstall" },
    opts = {
      automatic_installation = true,
      ensure_installed = {
        "js-debug-adapter", -- Modern JavaScript/TypeScript debugger
      },
      handlers = {},
    },
  },

  -- DAP (Debug Adapter Protocol) - Core debugging plugin
  {
    "mfussenegger/nvim-dap",
    dependencies = {
      -- UI for nvim-dap
      "rcarriga/nvim-dap-ui",
      "nvim-neotest/nvim-nio",

      -- Virtual text support (show variable values inline)
      "theHamsta/nvim-dap-virtual-text",

      -- Mason integration
      "jay-babu/mason-nvim-dap.nvim",
    },
    config = function()
      local dap = require("dap")
      local dapui = require("dapui")

      -- Enable DAP logging (INFO level for normal operation)
      dap.set_log_level("INFO")

      -- Setup DAP UI
      dapui.setup({
        layouts = {
          {
            elements = {
              -- Variables (most important - top half)
              {
                id = "scopes",
                size = 0.50, -- 50% of right panel
              },
              -- Call Stack
              {
                id = "stacks",
                size = 0.25, -- 25% of right panel
              },
              -- Breakpoints
              {
                id = "breakpoints",
                size = 0.15, -- 15% of right panel
              },
              -- Watches
              {
                id = "watches",
                size = 0.10, -- 10% of right panel
              },
            },
            size = 0.33, -- 33% of screen width
            position = "right",
          },
          {
            elements = {
              -- Debug Console
              {
                id = "console",
                size = 0.60, -- 60% of bottom panel
              },
              -- REPL
              {
                id = "repl",
                size = 0.40, -- 40% of bottom panel
              },
            },
            size = 0.27, -- 27% of screen height
            position = "bottom",
          },
        },
        -- Add custom window titles
        controls = {
          enabled = true,
        },
        element_mappings = {},
        floating = {
          border = "rounded",
          mappings = {
            close = { "q", "<Esc>" },
          },
        },
        render = {
          indent = 1,
          max_value_lines = 100,
        },
      })

      -- Setup virtual text
      require("nvim-dap-virtual-text").setup({
        enabled = true,
        enabled_commands = true,
        highlight_changed_variables = true,
        highlight_new_as_changed = false,
        show_stop_reason = true,
        commented = false,
      })

      -- Auto open/close DAP UI
      dap.listeners.after.event_initialized["dapui_config"] = function()
        dapui.open()
        -- Set window titles after opening
        vim.defer_fn(function()
          for _, win in ipairs(vim.api.nvim_list_wins()) do
            local buf = vim.api.nvim_win_get_buf(win)
            local ft = vim.bo[buf].filetype

            -- Set title based on filetype
            local title = ""
            if ft == "dapui_scopes" then
              title = " Variables & Scope "
            elseif ft == "dapui_stacks" then
              title = " Call Stack "
            elseif ft == "dapui_breakpoints" then
              title = " Breakpoints "
            elseif ft == "dapui_watches" then
              title = " Watches "
            elseif ft == "dapui_console" then
              title = " Debug Console (Output) "
            elseif ft == "dapui_repl" then
              title = " REPL (Interactive) "
            end

            if title ~= "" and vim.api.nvim_win_is_valid(win) then
              vim.api.nvim_win_set_config(win, {
                title = title,
                title_pos = "center",
              })
            end
          end
        end, 100)
      end
      dap.listeners.before.event_terminated["dapui_config"] = function()
        dapui.close()
      end
      dap.listeners.before.event_exited["dapui_config"] = function()
        dapui.close()
      end

      -- Configure Node.js debugging
      for _, language in ipairs({ "typescript", "javascript", "typescriptreact", "javascriptreact" }) do
        dap.configurations[language] = {
          -- Debug NestJS application (launches npm run start:debug)
          {
            name = "🚀 Launch NestJS App",
            type = "pwa-node",
            request = "launch",
            runtimeExecutable = "npm",
            runtimeArgs = { "run", "start:debug" },
            cwd = "${workspaceFolder}",
            console = "integratedTerminal",
            restart = true,
            port = 9229, -- Ensure it matches the NestJS debug port
            sourceMaps = true,
            protocol = "inspector",
            skipFiles = { "<node_internals>/**", "node_modules/**" },
            resolveSourceMapLocations = {
              "${workspaceFolder}/**",
              "!**/node_modules/**",
            },
            -- Critical: Tell debugger where compiled JS files are
            outFiles = {
              "${workspaceFolder}/dist/**/*.js",
            },
            -- Source map configuration
            sourceMapPathOverrides = {
              ["webpack:///./*"] = "${workspaceFolder}/*",
              ["webpack:///*"] = "*",
            },
          },
          -- Attach to already running NestJS on default debug port
          {
            name = "🔗 Attach to NestJS (port 9229)",
            type = "pwa-node",
            request = "attach",
            cwd = "${workspaceFolder}",
            sourceMaps = true,
            protocol = "inspector",
            port = 9229, -- Use static port to match --inspect
            skipFiles = { "<node_internals>/**", "node_modules/**" },
            resolveSourceMapLocations = {
              "${workspaceFolder}/**",
              "!**/node_modules/**",
            },
            -- Critical: Tell debugger where compiled JS files are
            outFiles = {
              "${workspaceFolder}/dist/**/*.js",
            },
            -- Source map configuration
            sourceMapPathOverrides = {
              ["webpack:///./*"] = "${workspaceFolder}/*",
              ["webpack:///*"] = "*",
            },
          },
          -- Debug current TypeScript/JavaScript file
          {
            name = "📄 Debug Current File",
            type = "pwa-node",
            request = "launch",
            program = "${file}",
            cwd = "${workspaceFolder}",
            console = "integratedTerminal",
          },
          -- Debug Jest tests
          {
            name = "🧪 Debug Jest Tests",
            type = "pwa-node",
            request = "launch",
            runtimeExecutable = "npm",
            runtimeArgs = { "run", "test:debug" },
            cwd = "${workspaceFolder}",
            console = "integratedTerminal",
          },
        }
      end

      -- Configure the pwa-node adapter (supports both launch and attach)
      dap.adapters["pwa-node"] = {
        type = "server",
        host = "localhost",
        port = "${port}",
        executable = {
          command = "js-debug-adapter", -- Use the Mason-installed executable wrapper
          args = { "${port}" },
        },
      }

      -- Setup breakpoint signs
      vim.fn.sign_define("DapBreakpoint", { text = "🔴", texthl = "", linehl = "", numhl = "" })
      vim.fn.sign_define("DapBreakpointCondition", { text = "🔵", texthl = "", linehl = "", numhl = "" })
      vim.fn.sign_define("DapBreakpointRejected", { text = "❌", texthl = "", linehl = "", numhl = "" })
      vim.fn.sign_define("DapStopped", { text = "🦆", texthl = "", linehl = "debugPC", numhl = "" })
      vim.fn.sign_define("DapLogPoint", { text = "📝", texthl = "", linehl = "", numhl = "" })


      -- Listen for breakpoint verification issues (only warn for real problems)
      dap.listeners.after.setBreakpoints["debug_breakpoints"] = function(session, err, response, args, seq)
        if response and response.breakpoints then
          -- Check if ALL breakpoints are unverified with "Unbound breakpoint" message
          -- This is a temporary state - the adapter will send verified=true shortly
          local all_unbound = true
          for _, bp in ipairs(response.breakpoints) do
            if bp.verified or bp.message ~= "Unbound breakpoint" then
              all_unbound = false
              break
            end
          end

          -- Only warn about breakpoints that have real issues (not temporary "Unbound" state)
          if not all_unbound then
            for i, bp in ipairs(response.breakpoints) do
              if not bp.verified and bp.message ~= "Unbound breakpoint" then
                local msg = bp.message or "Unknown reason"
                vim.notify(
                  string.format("Breakpoint %d NOT verified: %s", i, msg),
                  vim.log.levels.WARN
                )
              end
            end
          end
        end
      end

      -- Fix sign issues with duplicate breakpoint IDs from js-debug-adapter
      dap.listeners.after.event_breakpoint["debug_breakpoints"] = function(session, body)
        if body and body.breakpoint then
          local bp = body.breakpoint

          -- Workaround for duplicate breakpoint IDs from js-debug-adapter
          -- When a breakpoint becomes verified, manually update the sign
          if body.reason == "changed" and bp.verified and bp.source and bp.source.path then
            local bufnr = vim.fn.bufnr(bp.source.path)
            if bufnr and bufnr ~= -1 then
              local signs = vim.fn.sign_getplaced(bufnr, { group = "dap_breakpoints", lnum = bp.line })
              if signs and signs[1] and signs[1].signs then
                for _, sign in ipairs(signs[1].signs) do
                  vim.fn.sign_place(
                    sign.id,
                    "dap_breakpoints",
                    "DapBreakpoint",
                    bufnr,
                    { lnum = bp.line, priority = 21 }
                  )
                end
              end
            end
          end

          -- Only warn about breakpoints that fail to verify
          if not bp.verified and bp.message and bp.message ~= "Unbound breakpoint" then
            local msg = bp.message or "Unknown reason"
            vim.notify(
              string.format("Breakpoint update - NOT verified: %s", msg),
              vim.log.levels.WARN
            )
          end
        end
      end
    end,
  },
}

