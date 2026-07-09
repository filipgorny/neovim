-- Renderowanie avatarów użytkowników.
--
-- Dwie ścieżki, wybierane automatycznie:
--   * Terminal ze wsparciem grafiki (kitty/iterm) + zainstalowany image.nvim
--     -> prawdziwy obrazek pobrany z Jiry i wyświetlony w oknie.
--   * W przeciwnym razie -> kolorowy badge z inicjałami (działa wszędzie).
--
-- Badge to podstawowa, zawsze dostępna reprezentacja. Obrazki są ulepszeniem
-- progresywnym (wymagają terminala graficznego i pluginu image.nvim, którego
-- ta konfiguracja nie wymaga na sztywno).

local terminal = require("system.jira.terminal")

local M = {}

-- Każdy użytkownik dostaje własny, deterministyczny kolor nazwiska/badge'a
-- wyliczony z hasha jego identyfikatora (seed = accountId/displayName).
-- Highlight grupy tworzymy leniwie i cache'ujemy.

local did_setup = false
local hl_cache = {} -- seed -> nazwa grupy highlight

function M.setup()
  did_setup = true
end

-- Hash djb2 z tekstu.
local function hash(str)
  local h = 5381
  for i = 1, #str do
    h = (h * 33 + str:byte(i)) % 2147483648
  end
  return h
end

-- HSL -> RGB (h w [0,360), s/l w [0,1]).
local function hsl_to_rgb(h, s, l)
  local c = (1 - math.abs(2 * l - 1)) * s
  local x = c * (1 - math.abs((h / 60) % 2 - 1))
  local m = l - c / 2
  local r, g, b = 0, 0, 0

  if h < 60 then
    r, g, b = c, x, 0
  elseif h < 120 then
    r, g, b = x, c, 0
  elseif h < 180 then
    r, g, b = 0, c, x
  elseif h < 240 then
    r, g, b = 0, x, c
  elseif h < 300 then
    r, g, b = x, 0, c
  else
    r, g, b = c, 0, x
  end

  return math.floor((r + m) * 255 + 0.5),
    math.floor((g + m) * 255 + 0.5),
    math.floor((b + m) * 255 + 0.5)
end

-- Deterministyczny kolor "#rrggbb" z seeda (odcień z całego koła barw,
-- nasycenie/jasność lekko modulowane, żeby kolory się rozjeżdżały).
local function color_for(seed)
  local h = hash(seed)
  local hue = h % 360
  local sat = 0.55 + (h % 30) / 100      -- 0.55–0.84
  local lum = 0.60 + ((h % 17) / 100)    -- 0.60–0.76
  local r, g, b = hsl_to_rgb(hue, sat, lum)
  return string.format("#%02x%02x%02x", r, g, b)
end

-- Zwraca (tworząc w razie potrzeby) nazwę grupy highlight dla użytkownika.
function M.user_hl(user)
  local seed = "?"

  if type(user) == "table" then
    seed = user.accountId or user.displayName or user.name or user.emailAddress or "?"
  end

  if hl_cache[seed] then
    return hl_cache[seed]
  end

  local name = "JiraUser" .. (hash(seed) % 1000000)
  pcall(vim.api.nvim_set_hl, 0, name, { fg = color_for(seed), bold = true })
  hl_cache[seed] = name
  return name
end

-- Czy `user` to prawdziwa tabela usera (nie nil, nie vim.NIL/userdata).
local function present(user)
  return type(user) == "table"
end

M.present = present

-- Inicjały z displayName ("Filip Górny" -> "FG", "Łukasz" -> "ŁU").
-- Cięcie PO ZNAKACH (strcharpart) i uppercase świadome Unicode (toupper) —
-- polskie znaki są wielobajtowe, więc :sub()/:upper() by je uszkodziły.
function M.initials(user)
  if not present(user) then
    return "?"
  end

  local name = vim.trim(user.displayName or user.name or user.emailAddress or "")

  if name == "" then
    return "?"
  end

  local parts = vim.split(name, "%s+")

  if #parts >= 2 and parts[2] ~= "" then
    local first = vim.fn.strcharpart(parts[1], 0, 1)
    local second = vim.fn.strcharpart(parts[2], 0, 1)
    return vim.fn.toupper(first .. second)
  end

  return vim.fn.toupper(vim.fn.strcharpart(name, 0, 2))
end

-- @return table { text = "FG", hl = "<grupa koloru usera>" }
function M.badge(user)
  if not present(user) then
    return { text = "··", hl = "Comment" }
  end

  return { text = M.initials(user), hl = M.user_hl(user) }
end

-- Czy w ogóle jesteśmy w stanie pokazać prawdziwe obrazki?
function M.can_render_images()
  if not terminal.supports_images() then
    return false
  end

  -- Rendering obrazków delegujemy do image.nvim, jeśli jest dostępny —
  -- ręczne sekwencje graficzne w oknach pływających nvim są zawodne.
  return pcall(require, "image")
end

-- Ścieżka cache dla avatara danego użytkownika.
local function cache_path(account_id)
  local dir = vim.fn.stdpath("cache") .. "/jira/avatars"
  vim.fn.mkdir(dir, "p")
  local safe = tostring(account_id):gsub("[^%w]", "_")
  return dir .. "/" .. safe .. ".png"
end

-- Pobiera avatar do cache (async). callback(path|nil).
function M.download(user, callback)
  if not present(user) or not user.avatarUrls then
    return callback(nil)
  end

  local config = require("system.jira.config")
  local creds = config.credentials()

  if not creds then
    return callback(nil)
  end

  local url = user.avatarUrls["48x48"] or user.avatarUrls["32x32"]

  if not url then
    return callback(nil)
  end

  local path = cache_path(user.accountId or user.displayName or "unknown")

  if vim.fn.filereadable(path) == 1 then
    return callback(path)
  end

  vim.fn.jobstart({
    "curl", "-s", "-L",
    "-u", creds.email .. ":" .. creds.api_token,
    "-o", path,
    url,
  }, {
    on_exit = function(_, code)
      vim.schedule(function()
        if code == 0 and vim.fn.filereadable(path) == 1 then
          callback(path)
        else
          callback(nil)
        end
      end)
    end,
  })
end

return M
