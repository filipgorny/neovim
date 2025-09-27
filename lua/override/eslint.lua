-- file: lua/plugins/eslint_cli.lua
local Job = require("plenary.job")
local info = require("utils.info")

vim.api.nvim_create_autocmd("BufWritePost", {
  pattern = "*.js,*.ts,*.tsx,*.jsx,*.json",
  callback = function(args)
    local bufnr = args.buf
    local fname = vim.api.nvim_buf_get_name(bufnr)

    Job:new({
      command = "eslint",
      args = { "-f", "json", fname },
      on_exit = function(j, return_val)
        local result = table.concat(j:result(), "\n")
        local ok, diagnostics = pcall(vim.fn.json_decode, result)
        if not ok or not diagnostics or #diagnostics == 0 then return end

        local lines = {}
        for _, d in ipairs(diagnostics[1].messages) do
          table.insert(lines, {
            lnum = d.line - 1,
            message = d.message,
            severity = d.severity,
          })
        end

        vim.schedule(function()
          if vim.api.nvim_buf_is_valid(bufnr) then
            info.render_warnings(bufnr, lines)
          end
        end)
      end,
    }):start()
  end,
})