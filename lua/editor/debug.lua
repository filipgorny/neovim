install("mfussenegger/nvim-dap")
install("rcarriga/nvim-dap-ui")
install("nvim-neotest/nvim-nio")
install("mxsdev/nvim-dap-vscode-js")
install("williamboman/mason.nvim")
install("theHamsta/nvim-dap-virtual-text")

configure(function()
  local dapui = require("dapui");

  local dap = require("dap")
 
  dapui.setup({
   controls = {
  icons = {
     pause = "‖",
     play = "",
     step_back = "",
     step_over = "➔",
     },
     },
  })
  

  
  local mason = require("mason")

  mason.setup({
    ui = {
        icons = {
            package_installed = "✓",
            package_pending = "➜",
            package_uninstalled = "✗"
        }
    },
    providers = {
        "mason.providers.registry-api",
        "mason.providers.client",
    },
    registries = {
        "github:mason-org/mason-registry",
    },
  })

  local mason_registry = require("mason-registry")
  mason_registry.refresh()
  mason_registry.update()

  mason_registry.get_package("js-debug-adapter"):install()

  local js_debug_path = mason_registry.get_package("js-debug-adapter"):get_install_path()

  for _, adapter in ipairs({
     "pwa-node",
     "pwa-chrome",
     "pwa-msedge",
     "pwa-extensionHost",
   }) do
     dap.adapters[adapter] = {
       type = "server",
       host = "localhost",
       port = "${port}",
       executable = {
	command = "node",
	 args = {
	   js_debug_path .. "/js-debug/src/dapDebugServer.js",
	   "${port}",
	 },
       },
     }
  end

  for _, language in ipairs({ "typescript", "javascript", "typescriptreact", "javascriptreact" }) do
     dap.configurations[language] = {
       {
	 type = "pwa-node",
	 request = "launch",
	 name = "Launch file",
	 program = "${file}",
	 cwd = "${workspaceFolder}",
       },
     }
   end
end)

local api = require("nvim-tree.api")
local treeIsOpened = false;

local function debug_start() 
  treeIsOpened = api.tree.is_visible()
  api.tree.close();

  local dap = require("dap")
  local dapui = require("dapui")

  dap.continue()
  dapui.open()
end

local function debug_stop()
  local dap = require("dap")
  local dapui = require("dapui")

  dap.terminate()
  dapui.close()

  if treeIsOpened then
    api.tree.open();
  end
end

keys.map_all("<f5>", debug_start, { desc = "Starts the debugger." })
keys.map_all("<f10>", ":lua require('dap').step_over()<cr>")
keys.map_all("<f11>", ":lua require('dap').step_into()<cr>")
keys.map_all("<f12>", ":lua require('dap').step_out()<cr>")
keys.map_all("<leader>b", ":lua require('dap').toggle_breakpoint()<cr>")
keys.map_all("<leader>dr", ":lua require('dap').repl.open()<cr>")
keys.map_all("<leader>du", ":lua require('dapui').toggle()<cr>")
keys.map_all("<Esc>", debug_stop, { desc = "Stops the debugger." })
