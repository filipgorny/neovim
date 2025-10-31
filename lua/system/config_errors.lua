local M = {}

-- Store captured errors
M.errors = {}

-- Function to capture and display configuration errors
local function capture_error(err, context)
  local error_msg = string.format("[Neovim Config Error] %s: %s", context, err)
  table.insert(M.errors, {
    context = context,
    message = err,
    timestamp = os.date("%H:%M:%S")
  })

  -- Display in :messages with error highlighting
  vim.api.nvim_echo({
    { "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n", "ErrorMsg" },
    { error_msg .. "\n", "ErrorMsg" },
    { "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n", "ErrorMsg" },
  }, false, {})
end

-- Wrap a require call with error handling
function M.safe_require(module_name, context)
  context = context or module_name
  local ok, result = pcall(require, module_name)
  if not ok then
    capture_error(result, context)
    return nil
  end
  return result
end

-- Wrap a function call with error handling
function M.safe_call(func, context)
  context = context or "function call"
  local ok, result = pcall(func)
  if not ok then
    capture_error(result, context)
    return nil, result
  end
  return result
end

-- Setup function with error handler
function M.setup(opts)
  opts = opts or {}

  -- Set up global error handler for Lua errors
  vim.api.nvim_create_autocmd("VimEnter", {
    callback = function()
      -- Display captured errors on startup if any
      if #M.errors > 0 then
        vim.notify(
          string.format("Found %d configuration error(s). Check :messages for details.", #M.errors),
          vim.log.levels.ERROR
        )
      end
    end,
    once = true,
  })

  -- Command to display all captured errors
  vim.api.nvim_create_user_command("ConfigErrors", function()
    if #M.errors == 0 then
      print("No configuration errors found.")
      return
    end

    for i, err in ipairs(M.errors) do
      vim.api.nvim_echo({
        { string.format("\n[%d] %s - %s\n", i, err.timestamp, err.context), "Title" },
        { err.message .. "\n", "ErrorMsg" },
      }, false, {})
    end
  end, { desc = "Display all captured configuration errors" })
end

-- Clear all captured errors
function M.clear()
  M.errors = {}
  print("Configuration errors cleared.")
end

return M
