-- lua/plugins/debugger.lua
-- Plugin do debugowania aplikacji NestJS (Node.js) w Neovim
-- Wymaga: mfussenegger/nvim-dap, rcarriga/nvim-dap-ui, jay-babu/mason-nvim-dap.nvim

return {
  {
    "mfussenegger/nvim-dap",
    dependencies = {
      "rcarriga/nvim-dap-ui",
      "jay-babu/mason-nvim-dap.nvim",
      "nvim-neotest/nvim-nio"
    },
    config = function()
      local dap = require("dap")
      local dapui = require("dapui")

      -- UI
      dapui.setup()
      dap.listeners.after.event_initialized["dapui_config"] = function()
        dapui.open()
      end
      dap.listeners.before.event_terminated["dapui_config"] = function()
        dapui.close()
      end
      dap.listeners.before.event_exited["dapui_config"] = function()
        dapui.close()
      end

      -- Adapter Node.js (inspector)
      dap.adapters.node2 = {
        type = "executable",
        command = "node",
        args = { os.getenv("HOME") .. "/.local/share/nvim/mason/packages/node-debug2-adapter/out/src/nodeDebug.js" },
      }

      -- Konfiguracja dla plików TypeScript (NestJS)
      dap.configurations.typescript = {
        {
          type = "node2",
          request = "launch",
          name = "NestJS: debug current file",
          program = "${file}",
          cwd = vim.fn.getcwd(),
          sourceMaps = true,
          protocol = "inspector",
          console = "integratedTerminal",
          runtimeExecutable = "ts-node",
        },
        {
          type = "node2",
          request = "launch",
          name = "NestJS: start app",
          program = "${workspaceFolder}/src/main.ts",
          cwd = vim.fn.getcwd(),
          runtimeExecutable = "ts-node",
          sourceMaps = true,
          protocol = "inspector",
          console = "integratedTerminal",
        },
        {
          type = "node2",
          request = "attach",
          name = "NestJS: attach to process",
          processId = require("dap.utils").pick_process,
          cwd = vim.fn.getcwd(),
        },
      }

      -- Mapy klawiszy
      vim.keymap.set("n", "<F5>", function() dap.continue() end, { desc = "DAP Continue" })
      vim.keymap.set("n", "<F10>", function() dap.step_over() end, { desc = "DAP Step Over" })
      vim.keymap.set("n", "<F11>", function() dap.step_into() end, { desc = "DAP Step Into" })
      vim.keymap.set("n", "<F12>", function() dap.step_out() end, { desc = "DAP Step Out" })
      vim.keymap.set("n", "<leader>b", function() dap.toggle_breakpoint() end, { desc = "DAP Toggle Breakpoint" })
      vim.keymap.set("n", "<leader>B", function()
        dap.set_breakpoint(vim.fn.input("Breakpoint condition: "))
      end, { desc = "DAP Conditional Breakpoint" })
      vim.keymap.set("n", "<leader>dr", function() dap.repl.open() end, { desc = "DAP REPL" })
      vim.keymap.set("n", "<leader>dl", function() dap.run_last() end, { desc = "DAP Run Last" })
    end,
  },
}
