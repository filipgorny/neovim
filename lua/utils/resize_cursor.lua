local M = {}

-- Highlights the window separator when mouse hovers over it,
-- giving visual feedback that the border is resizable.

local ns = vim.api.nvim_create_namespace("resize_cursor")
local hover_active = false

-- Default and hover highlight colors
local function setup_highlights()
  -- Get current WinSeparator colors as the "normal" state
  local sep_hl = vim.api.nvim_get_hl(0, { name = "WinSeparator", link = false })
  -- Store original so we can restore
  M._orig_sep = sep_hl

  -- Create a bright hover highlight
  vim.api.nvim_set_hl(0, "WinSeparatorHover", {
    fg = "#f0c674", -- bright yellow/gold
    bold = true,
  })
end

local function set_hover(active)
  if active == hover_active then
    return
  end
  hover_active = active
  if active then
    vim.api.nvim_set_hl(0, "WinSeparator", {
      link = "WinSeparatorHover",
    })
  else
    -- Restore original
    if M._orig_sep and next(M._orig_sep) then
      vim.api.nvim_set_hl(0, "WinSeparator", M._orig_sep)
    else
      -- Clear to default
      vim.api.nvim_set_hl(0, "WinSeparator", {})
    end
  end
end

--- Check if mouse position is on a window separator
local function is_on_separator(mouse_pos)
  local mouse_row = mouse_pos.screenrow
  local mouse_col = mouse_pos.screencol

  -- Get all windows in current tab
  local wins = vim.api.nvim_tabpage_list_wins(0)

  for _, win in ipairs(wins) do
    -- Skip floating windows
    local config = vim.api.nvim_win_get_config(win)
    if config.relative == "" then
      local pos = vim.api.nvim_win_get_position(win) -- [row, col] 0-indexed
      local width = vim.api.nvim_win_get_width(win)
      local height = vim.api.nvim_win_get_height(win)

      -- Window occupies screen area:
      --   rows: pos[1]+1 to pos[1]+height (1-indexed)
      --   cols: pos[2]+1 to pos[2]+width (1-indexed)
      -- The separator is the column/row right after the window

      local win_top = pos[1] + 1
      local win_left = pos[2] + 1
      local win_bottom = pos[1] + height
      local win_right = pos[2] + width

      -- Check right border (vertical separator)
      -- The separator char is at col = win_right + 1
      if mouse_col == win_right + 1 and mouse_row >= win_top and mouse_row <= win_bottom then
        return true, "vertical"
      end

      -- Check bottom border (horizontal separator / statusline boundary)
      if mouse_row == win_bottom + 1 and mouse_col >= win_left and mouse_col <= win_right then
        return true, "horizontal"
      end
    end
  end

  return false, nil
end

function M.setup()
  setup_highlights()

  local group = vim.api.nvim_create_augroup("ResizeCursor", { clear = true })

  -- NOTE: MouseMove is not a valid Neovim autocmd event.
  -- This feature requires a different approach (e.g. timer-based polling)
  -- to detect mouse hover over window separators.

  -- Restore on leaving Neovim or changing colorscheme
  vim.api.nvim_create_autocmd("ColorScheme", {
    group = group,
    callback = function()
      hover_active = false
      setup_highlights()
    end,
  })

  vim.api.nvim_create_autocmd("VimLeavePre", {
    group = group,
    callback = function()
      set_hover(false)
    end,
  })
end

return M
