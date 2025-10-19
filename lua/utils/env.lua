-- .env file reader utility
local M = {}

-- Read and parse .env file
-- @param filepath string: Path to .env file (optional, defaults to .env in git root or cwd)
-- @return table: Key-value pairs from .env file
function M.read(filepath)
  -- If no filepath provided, try to find .env in git root or current directory
  if not filepath then
    -- Try git root first
    local git_root = vim.fn.systemlist("git rev-parse --show-toplevel 2>/dev/null")[1]
    if vim.v.shell_error == 0 and git_root and git_root ~= "" then
      filepath = git_root .. "/.env"
    else
      -- Fall back to current working directory
      filepath = vim.fn.getcwd() .. "/.env"
    end
  end

  -- Check if file exists
  if vim.fn.filereadable(filepath) ~= 1 then
    return {}
  end

  local env_vars = {}
  local lines = vim.fn.readfile(filepath)

  for _, line in ipairs(lines) do
    -- Skip empty lines and comments
    if line ~= "" and not line:match("^%s*#") then
      -- Parse KEY=VALUE format
      local key, value = line:match("^%s*([%w_]+)%s*=%s*(.*)%s*$")

      if key and value then
        -- Remove quotes if present
        value = value:gsub("^['\"](.*)['\"]$", "%1")
        env_vars[key] = value
      end
    end
  end

  return env_vars
end

-- Get a specific value from .env file, with fallback to environment
-- @param key string: The environment variable key
-- @param filepath string: Path to .env file (optional)
-- @return string|nil: The value from .env, environment, or nil if not found
function M.get(key, filepath)
  local env_vars = M.read(filepath)
  local value = env_vars[key]

  -- Fall back to environment variable if not found in .env
  if not value then
    value = os.getenv(key) or vim.env[key]
  end

  return value
end

-- Load .env into process environment
-- @param filepath string: Path to .env file (optional)
function M.load(filepath)
  local env_vars = M.read(filepath)

  for key, value in pairs(env_vars) do
    vim.fn.setenv(key, value)
  end

  return env_vars
end

return M
