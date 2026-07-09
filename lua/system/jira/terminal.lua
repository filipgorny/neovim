-- Detekcja możliwości graficznych terminala.
--
-- Prawdziwe avatary (obrazki) da się pokazać tylko w terminalach ze
-- wsparciem protokołu graficznego: kitty graphics protocol (kitty, ghostty,
-- WezTerm) albo iTerm2 inline images. W pozostałych spadamy na inicjały.
--
-- Detekcja jest heurystyczna (zmienne środowiskowe) i cache'owana.

local M = {}

local cached = nil

local function detect()
  local term = (vim.env.TERM or ""):lower()
  local term_program = (vim.env.TERM_PROGRAM or ""):lower()

  -- kitty graphics protocol
  if vim.env.KITTY_WINDOW_ID or term:match("kitty") then
    return { supported = true, protocol = "kitty" }
  end

  -- ghostty implementuje kitty graphics protocol
  if term_program == "ghostty" or (vim.env.GHOSTTY_RESOURCES_DIR ~= nil) then
    return { supported = true, protocol = "kitty" }
  end

  -- WezTerm — kitty graphics protocol
  if term_program == "wezterm" or vim.env.WEZTERM_PANE then
    return { supported = true, protocol = "kitty" }
  end

  -- iTerm2 inline images
  if term_program == "iterm.app" then
    return { supported = true, protocol = "iterm" }
  end

  return { supported = false, protocol = nil }
end

-- @return table { supported = bool, protocol = "kitty"|"iterm"|nil }
function M.graphics()
  if cached == nil then
    cached = detect()
  end

  return cached
end

function M.supports_images()
  return M.graphics().supported
end

return M
