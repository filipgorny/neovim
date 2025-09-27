local M = {}

-- Namespace for highlights (optional)
M.ns = vim.api.nvim_create_namespace("debug_buffer")

-- Create or get the debug buffer
M.get_buffer = function()
  if M.buf and vim.api.nvim_buf_is_valid(M.buf) then
    return M.buf
  end

  -- Create a listed scratch buffer (will persist across tabs)
  M.buf = vim.api.nvim_create_buf(true, true)
  vim.api.nvim_buf_set_name(M.buf, "DebugBuffer")
  vim.api.nvim_buf_set_option(M.buf, "bufhidden", "hide")  -- <- keep buffer even if hidden
  vim.api.nvim_buf_set_option(M.buf, "modifiable", true)
  vim.api.nvim_buf_set_option(M.buf, "filetype", "log")

  -- Open buffer in a new tab
  vim.api.nvim_command("tabnew")
  local win = vim.api.nvim_get_current_win()
  vim.api.nvim_win_set_buf(win, M.buf)

  return M.buf
end

-- Print a message to the debug buffer
M.print = function(msg)
  local buf = M.get_buffer()
  vim.api.nvim_buf_set_option(buf, "modifiable", true)
  vim.api.nvim_buf_set_lines(buf, -1, -1, false, { tostring(msg) })
  vim.api.nvim_buf_set_option(buf, "modifiable", false)

  -- Optional: scroll to bottom
  local line_count = vim.api.nvim_buf_line_count(buf)
  vim.api.nvim_win_set_cursor(0, { line_count, 0 })

  -- Focus debug tab automatically
  for _, win in ipairs(vim.api.nvim_list_wins()) do
    if vim.api.nvim_win_get_buf(win) == buf then
      vim.api.nvim_set_current_win(win)
      break
    end
  end
end

return M
