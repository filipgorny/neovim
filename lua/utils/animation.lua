local M = {}

-- Configuration
local config = {
  blink_duration = 300, -- Total duration of blink animation in ms (4x faster: was 1200)
  blink_steps = 12, -- Number of animation steps
}

-- Color gradient from dark orange to yellow and back
local color_steps = {
  "#8B4000", -- Dark brown-orange
  "#A85000", -- Dark orange
  "#C56000", -- Orange
  "#E27000", -- Bright orange
  "#FF8000", -- Orange
  "#FFB000", -- Orange-yellow
  "#FFD700", -- Gold/Yellow (peak)
  "#FFB000", -- Orange-yellow
  "#FF8000", -- Orange
  "#E27000", -- Bright orange
  "#C56000", -- Orange
  "#A85000", -- Dark orange
}

-- Active animations (to prevent multiple animations on same line)
local active_animations = {}

-- Create highlight group for a specific color
local function create_highlight(color)
  local hl_name = "AnimationBlink_" .. color:gsub("#", "")

  vim.api.nvim_set_hl(0, hl_name, {
    bg = color,
    fg = "#000000", -- Black text for readability
    bold = true,
  })

  return hl_name
end

-- Clear highlight from a line (must be called from vim.schedule context)
local function clear_line_highlight(bufnr, ns_id, line)
  if vim.api.nvim_buf_is_valid(bufnr) then
    vim.api.nvim_buf_clear_namespace(bufnr, ns_id, line, line + 1)
  end
end

-- Apply highlight to entire line
local function highlight_line(bufnr, ns_id, line, hl_group)
  if not vim.api.nvim_buf_is_valid(bufnr) then
    return false
  end

  -- Clear previous highlight
  clear_line_highlight(bufnr, ns_id, line)

  -- Get line length to highlight entire line
  local line_count = vim.api.nvim_buf_line_count(bufnr)
  if line >= line_count then
    return false
  end

  -- Add highlight using extmark with line highlight
  pcall(vim.api.nvim_buf_set_extmark, bufnr, ns_id, line, 0, {
    end_line = line + 1,
    hl_group = hl_group,
    hl_eol = true, -- Highlight to end of line including virtual space
    hl_mode = "combine", -- Combine with existing highlights (shows under characters)
    priority = 200, -- Higher priority to override other highlights
  })

  return true
end

-- Blink line with color animation
function M.blink_line(bufnr, line)
  bufnr = bufnr or vim.api.nvim_get_current_buf()

  if not vim.api.nvim_buf_is_valid(bufnr) then
    return
  end

  -- Convert to 0-indexed
  local line_idx = line - 1

  -- Create unique key for this line
  local anim_key = bufnr .. "_" .. line_idx

  -- If already animating this line, don't start another animation
  if active_animations[anim_key] then
    return
  end

  active_animations[anim_key] = true

  -- Create namespace for animation
  local ns_id = vim.api.nvim_create_namespace("animation_blink")

  -- Calculate delay between steps
  local step_delay = math.floor(config.blink_duration / config.blink_steps)

  -- Animation step counter
  local step = 0

  -- Create timer for animation
  local timer = vim.loop.new_timer()

  local function animate_step()
    step = step + 1

    -- Check if animation should continue
    if step > #color_steps then
      -- Animation complete, clean up
      timer:stop()
      timer:close()
      vim.schedule(function()
        clear_line_highlight(bufnr, ns_id, line_idx)
        active_animations[anim_key] = nil
      end)
      return
    end

    -- Apply current color
    vim.schedule(function()
      local color = color_steps[step]
      local hl_group = create_highlight(color)
      highlight_line(bufnr, ns_id, line_idx, hl_group)
    end)
  end

  -- Start animation
  timer:start(0, step_delay, animate_step)
end

-- Blink multiple lines
function M.blink_lines(bufnr, start_line, end_line)
  bufnr = bufnr or vim.api.nvim_get_current_buf()

  for line = start_line, end_line do
    M.blink_line(bufnr, line)
  end
end

-- Blink current line
function M.blink_current_line()
  local cursor = vim.api.nvim_win_get_cursor(0)
  local line = cursor[1]
  M.blink_line(vim.api.nvim_get_current_buf(), line)
end

-- Flash line once (shorter, single color pulse)
function M.flash_line(bufnr, line, color, duration)
  bufnr = bufnr or vim.api.nvim_get_current_buf()
  color = color or "#FFD700"
  duration = duration or 300

  vim.schedule(function()
    if not vim.api.nvim_buf_is_valid(bufnr) then
      return
    end

    local line_idx = line - 1
    local ns_id = vim.api.nvim_create_namespace("animation_flash")

    -- Apply highlight
    local hl_group = create_highlight(color)
    highlight_line(bufnr, ns_id, line_idx, hl_group)

    -- Clear after duration
    vim.defer_fn(function()
      clear_line_highlight(bufnr, ns_id, line_idx)
    end, duration)
  end)
end

-- Pulse line (fade in and out)
function M.pulse_line(bufnr, line, color)
  bufnr = bufnr or vim.api.nvim_get_current_buf()
  color = color or "#FF8000"

  if not vim.api.nvim_buf_is_valid(bufnr) then
    return
  end

  local line_idx = line - 1
  local anim_key = bufnr .. "_pulse_" .. line_idx

  if active_animations[anim_key] then
    return
  end

  active_animations[anim_key] = true

  local ns_id = vim.api.nvim_create_namespace("animation_pulse")

  -- Create opacity steps (simulated with color brightness)
  local opacity_steps = {
    0.2, 0.4, 0.6, 0.8, 1.0, 0.8, 0.6, 0.4, 0.2
  }

  local step = 0
  local timer = vim.loop.new_timer()
  local step_delay = 80

  local function pulse_step()
    step = step + 1

    if step > #opacity_steps then
      timer:stop()
      timer:close()
      vim.schedule(function()
        clear_line_highlight(bufnr, ns_id, line_idx)
        active_animations[anim_key] = nil
      end)
      return
    end

    vim.schedule(function()
      -- Adjust color brightness based on opacity
      local opacity = opacity_steps[step]
      local adjusted_color = adjust_color_brightness(color, opacity)
      local hl_group = create_highlight(adjusted_color)
      highlight_line(bufnr, ns_id, line_idx, hl_group)
    end)
  end

  timer:start(0, step_delay, pulse_step)
end

-- Helper to adjust color brightness
function adjust_color_brightness(color, factor)
  -- Parse hex color
  local r = tonumber(color:sub(2, 3), 16)
  local g = tonumber(color:sub(4, 5), 16)
  local b = tonumber(color:sub(6, 7), 16)

  -- Adjust brightness
  r = math.floor(r * factor)
  g = math.floor(g * factor)
  b = math.floor(b * factor)

  -- Clamp values
  r = math.min(255, math.max(0, r))
  g = math.min(255, math.max(0, g))
  b = math.min(255, math.max(0, b))

  return string.format("#%02X%02X%02X", r, g, b)
end

-- Setup function
function M.setup(opts)
  opts = opts or {}
  config = vim.tbl_deep_extend("force", config, opts)
  return true
end

return M
